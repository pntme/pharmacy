/**
 * Simple Pharmacy Starter Backend
 * - Node.js + Express
 * - sqlite3 (file: retail.db) created automatically
 * Endpoints:
 *   GET /products
 *   POST /products
 *   GET /inventory
 *   POST /purchase   (receive stock)
 *   POST /sales      (create sale)
 *
 * Run:
 *   npm install
 *   node server.js
 */
const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_FILE = path.join(__dirname, 'retail.db');
const db = new sqlite3.Database(DB_FILE);

// Initialize tables if not exist
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS products (
    product_id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_code TEXT UNIQUE,
    product_name TEXT,
    generic_name TEXT,
    manufacturer TEXT,
    pack_size TEXT,
    mrp REAL,
    purchase_rate REAL,
    hsn TEXT,
    gst_rate INTEGER,
    schedule TEXT,
    reorder_level INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS inventory (
    inventory_id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER,
    batch_number TEXT,
    expiry_date TEXT,
    quantity INTEGER,
    cost_per_unit REAL,
    received_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(product_id) REFERENCES products(product_id)
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS sales (
    sale_id INTEGER PRIMARY KEY AUTOINCREMENT,
    sale_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    total_amount REAL,
    payment_method TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS sale_items (
    sale_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
    sale_id INTEGER,
    product_id INTEGER,
    batch_number TEXT,
    quantity INTEGER,
    unit_price REAL,
    FOREIGN KEY(sale_id) REFERENCES sales(sale_id),
    FOREIGN KEY(product_id) REFERENCES products(product_id)
  )`);
});

const app = express();
app.use(bodyParser.json());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// Serve frontend static if present
app.use('/', express.static(path.join(__dirname, '..', 'frontend')));

// Get products (simple catalog)
app.get('/products', (req, res) => {
  const q = "SELECT p.*, IFNULL(SUM(i.quantity),0) as qty_on_hand FROM products p LEFT JOIN inventory i ON p.product_id=i.product_id GROUP BY p.product_id";
  db.all(q, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Add product
app.post('/products', (req, res) => {
  const p = req.body;
  const stmt = db.prepare(`INSERT OR IGNORE INTO products (item_code, product_name, generic_name, manufacturer, pack_size, mrp, purchase_rate, hsn, gst_rate, schedule, reorder_level) VALUES (?,?,?,?,?,?,?,?,?,?,?)`);
  stmt.run(p.item_code, p.product_name, p.generic_name, p.manufacturer, p.pack_size, p.mrp || 0, p.purchase_rate || 0, p.hsn || '', p.gst_rate || 0, p.schedule || '', p.reorder_level || 0, function(err){
    if (err) return res.status(500).json({ error: err.message });
    res.json({ product_id: this.lastID });
  });
});

// Inventory list
app.get('/inventory', (req, res) => {
  const q = `SELECT i.*, p.product_name, p.mrp FROM inventory i JOIN products p ON i.product_id=p.product_id ORDER BY i.expiry_date`;
  db.all(q, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Receive purchase (add inventory batch)
app.post('/purchase', (req, res) => {
  const p = req.body;
  if (!p.product_id || !p.quantity) return res.status(400).json({ error: "product_id and quantity required" });
  const stmt = db.prepare(`INSERT INTO inventory (product_id, batch_number, expiry_date, quantity, cost_per_unit) VALUES (?,?,?,?,?)`);
  stmt.run(p.product_id, p.batch_number || '', p.expiry_date || null, p.quantity, p.cost_per_unit || 0, function(err){
    if (err) return res.status(500).json({ error: err.message });
    res.json({ inventory_id: this.lastID });
  });
});

// Create sale (deduct from oldest batches FEFO)
app.post('/sales', (req, res) => {
  const sale = req.body;
  if (!sale.items || !Array.isArray(sale.items) || sale.items.length === 0) return res.status(400).json({ error: "items required" });
  db.serialize(() => {
    db.run("BEGIN TRANSACTION");
    db.run(`INSERT INTO sales (total_amount, payment_method) VALUES (?,?)`, [sale.total_amount || 0, sale.payment_method || 'CASH'], function(err){
      if (err) { db.run("ROLLBACK"); return res.status(500).json({error: err.message}); }
      const saleId = this.lastID;
      const processNext = (index) => {
        if (index >= sale.items.length) {
          db.run("COMMIT");
          return res.json({ sale_id: saleId });
        }
        const it = sale.items[index];
        // Consume from inventory FEFO
        const q = `SELECT * FROM inventory WHERE product_id = ? AND quantity > 0 ORDER BY expiry_date ASC, received_date ASC`;
        db.all(q, [it.product_id], (err, batches) => {
          if (err) { db.run("ROLLBACK"); return res.status(500).json({ error: err.message }); }
          let qtyToTake = it.quantity;
          const takeFromBatch = (bindex) => {
            if (qtyToTake <= 0) return processNext(index+1);
            if (bindex >= batches.length) {
              db.run("ROLLBACK");
              return res.status(400).json({ error: `Insufficient stock for product_id ${it.product_id}` });
            }
            const batch = batches[bindex];
            const take = Math.min(qtyToTake, batch.quantity);
            db.run(`UPDATE inventory SET quantity = quantity - ? WHERE inventory_id = ?`, [take, batch.inventory_id], function(err){
              if (err) { db.run("ROLLBACK"); return res.status(500).json({ error: err.message }); }
              db.run(`INSERT INTO sale_items (sale_id, product_id, batch_number, quantity, unit_price) VALUES (?,?,?,?,?)`, [saleId, it.product_id, batch.batch_number, take, it.unit_price || 0], function(err){
                if (err) { db.run("ROLLBACK"); return res.status(500).json({ error: err.message }); }
                qtyToTake -= take;
                takeFromBatch(bindex+1);
              });
            });
          };
          takeFromBatch(0);
        });
      };
      processNext(0);
    });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Pharmacy starter backend listening on port ${PORT}`);
  console.log(`DB file: ${DB_FILE}`);
});