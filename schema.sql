-- Simple schema for Pharmacy Starter (Postgres/Sqlite compatible)
CREATE TABLE products (
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
  reorder_level INTEGER DEFAULT 0
);