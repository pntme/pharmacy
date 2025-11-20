import sequelize from '../config/database';
import { Product, Inventory, Patient, SalesOrder, SalesOrderItem, User, Role } from '../models';
import bcrypt from 'bcryptjs';

const sampleProducts = [
  { item_code: 'MED001', product_name: 'Dolo 650mg', generic_name: 'Paracetamol', brand_name: 'Dolo', strength: '650mg', dosage_form: 'Tablet', schedule: 'OTC', mrp: 35.00, selling_price: 32.00, gst_rate: 12, reorder_level: 100 },
  { item_code: 'MED002', product_name: 'Azithromycin 500mg', generic_name: 'Azithromycin', brand_name: 'Azee', strength: '500mg', dosage_form: 'Tablet', schedule: 'H', mrp: 120.00, selling_price: 110.00, gst_rate: 12, reorder_level: 50 },
  { item_code: 'MED003', product_name: 'Paracetamol 500mg', generic_name: 'Paracetamol', brand_name: 'Crocin', strength: '500mg', dosage_form: 'Tablet', schedule: 'OTC', mrp: 25.00, selling_price: 23.00, gst_rate: 12, reorder_level: 200 },
  { item_code: 'MED004', product_name: 'Amoxicillin 500mg', generic_name: 'Amoxicillin', brand_name: 'Mox', strength: '500mg', dosage_form: 'Capsule', schedule: 'H', mrp: 85.00, selling_price: 78.00, gst_rate: 12, reorder_level: 75 },
  { item_code: 'MED005', product_name: 'Crocin Advance', generic_name: 'Paracetamol', brand_name: 'Crocin', strength: '500mg', dosage_form: 'Tablet', schedule: 'OTC', mrp: 30.00, selling_price: 28.00, gst_rate: 12, reorder_level: 150 },
  { item_code: 'MED006', product_name: 'Cetirizine 10mg', generic_name: 'Cetirizine', brand_name: 'Cetrizet', strength: '10mg', dosage_form: 'Tablet', schedule: 'OTC', mrp: 45.00, selling_price: 42.00, gst_rate: 12, reorder_level: 100 },
  { item_code: 'MED007', product_name: 'Omeprazole 20mg', generic_name: 'Omeprazole', brand_name: 'Omez', strength: '20mg', dosage_form: 'Capsule', schedule: 'OTC', mrp: 55.00, selling_price: 50.00, gst_rate: 12, reorder_level: 80 },
  { item_code: 'MED008', product_name: 'Metformin 500mg', generic_name: 'Metformin', brand_name: 'Glycomet', strength: '500mg', dosage_form: 'Tablet', schedule: 'H', mrp: 65.00, selling_price: 60.00, gst_rate: 12, reorder_level: 100 },
  { item_code: 'MED009', product_name: 'Atorvastatin 10mg', generic_name: 'Atorvastatin', brand_name: 'Atorva', strength: '10mg', dosage_form: 'Tablet', schedule: 'H', mrp: 95.00, selling_price: 88.00, gst_rate: 12, reorder_level: 75 },
  { item_code: 'MED010', product_name: 'Aspirin 75mg', generic_name: 'Aspirin', brand_name: 'Disprin', strength: '75mg', dosage_form: 'Tablet', schedule: 'OTC', mrp: 20.00, selling_price: 18.00, gst_rate: 12, reorder_level: 150 },
  { item_code: 'MED011', product_name: 'Ibuprofen 400mg', generic_name: 'Ibuprofen', brand_name: 'Brufen', strength: '400mg', dosage_form: 'Tablet', schedule: 'OTC', mrp: 40.00, selling_price: 37.00, gst_rate: 12, reorder_level: 100 },
  { item_code: 'MED012', product_name: 'Vitamin D3 60K', generic_name: 'Cholecalciferol', brand_name: 'Uprise', strength: '60000IU', dosage_form: 'Capsule', schedule: 'OTC', mrp: 75.00, selling_price: 70.00, gst_rate: 12, reorder_level: 60 },
  { item_code: 'MED013', product_name: 'Multivitamin', generic_name: 'Multivitamin', brand_name: 'Revital', strength: '-', dosage_form: 'Capsule', schedule: 'OTC', mrp: 250.00, selling_price: 230.00, gst_rate: 18, reorder_level: 50 },
  { item_code: 'MED014', product_name: 'Calcium 500mg', generic_name: 'Calcium Carbonate', brand_name: 'Shelcal', strength: '500mg', dosage_form: 'Tablet', schedule: 'OTC', mrp: 120.00, selling_price: 110.00, gst_rate: 12, reorder_level: 70 },
  { item_code: 'MED015', product_name: 'Cough Syrup', generic_name: 'Dextromethorphan', brand_name: 'Benadryl', strength: '100ml', dosage_form: 'Syrup', schedule: 'OTC', mrp: 85.00, selling_price: 80.00, gst_rate: 18, reorder_level: 40 },
  { item_code: 'AYU001', product_name: 'Chyawanprash', generic_name: 'Herbal', brand_name: 'Dabur', strength: '500g', dosage_form: 'Paste', schedule: 'OTC', mrp: 350.00, selling_price: 320.00, gst_rate: 12, reorder_level: 30 },
  { item_code: 'AYU002', product_name: 'Triphala Churna', generic_name: 'Herbal', brand_name: 'Patanjali', strength: '100g', dosage_form: 'Powder', schedule: 'OTC', mrp: 80.00, selling_price: 75.00, gst_rate: 5, reorder_level: 40 },
  { item_code: 'SUR001', product_name: 'Bandage', generic_name: 'Cotton', brand_name: 'Hansaplast', strength: '6cm x 4m', dosage_form: '-', schedule: 'OTC', mrp: 45.00, selling_price: 42.00, gst_rate: 12, reorder_level: 100 },
  { item_code: 'SUR002', product_name: 'Surgical Gloves', generic_name: 'Latex', brand_name: 'Surgiwear', strength: 'Medium', dosage_form: '-', schedule: 'OTC', mrp: 120.00, selling_price: 110.00, gst_rate: 12, reorder_level: 50 },
  { item_code: 'SUR003', product_name: 'Thermometer Digital', generic_name: 'Digital', brand_name: 'Dr. Morepen', strength: '-', dosage_form: '-', schedule: 'OTC', mrp: 250.00, selling_price: 230.00, gst_rate: 18, reorder_level: 20 },
];

const samplePatients = [
  { patient_code: 'PAT001', first_name: 'Rajesh', last_name: 'Kumar', date_of_birth: new Date('1985-03-15'), gender: 'Male', phone_number: '9876543210', email: 'rajesh.k@example.com', blood_group: 'O+' },
  { patient_code: 'PAT002', first_name: 'Priya', last_name: 'Sharma', date_of_birth: new Date('1990-07-22'), gender: 'Female', phone_number: '9876543211', email: 'priya.s@example.com', blood_group: 'A+' },
  { patient_code: 'PAT003', first_name: 'Amit', last_name: 'Patel', date_of_birth: new Date('1978-11-30'), gender: 'Male', phone_number: '9876543212', email: 'amit.p@example.com', blood_group: 'B+' },
  { patient_code: 'PAT004', first_name: 'Sneha', last_name: 'Reddy', date_of_birth: new Date('1995-05-18'), gender: 'Female', phone_number: '9876543213', email: 'sneha.r@example.com', blood_group: 'AB+' },
  { patient_code: 'PAT005', first_name: 'Vikram', last_name: 'Singh', date_of_birth: new Date('1982-09-10'), gender: 'Male', phone_number: '9876543214', email: 'vikram.s@example.com', blood_group: 'O-' },
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Sync database (this will create tables if they don't exist)
    await sequelize.sync({ alter: true });
    console.log('✅ Database synced');

    // Clear existing data (optional - comment out if you want to keep existing data)
    await SalesOrderItem.destroy({ where: {}, truncate: true, cascade: true });
    await SalesOrder.destroy({ where: {}, truncate: true, cascade: true });
    await Inventory.destroy({ where: {}, truncate: true, cascade: true });
    await Product.destroy({ where: {}, truncate: true, cascade: true });
    await Patient.destroy({ where: {}, truncate: true, cascade: true });
    console.log('✅ Cleared existing data');

    // Ensure admin role exists
    let adminRole = await Role.findOne({ where: { role_name: 'admin' } });
    if (!adminRole) {
      adminRole = await Role.create({
        role_name: 'admin',
        role_description: 'Administrator with full access',
        permissions: {},
      });
      console.log('✅ Created admin role');
    }

    // Ensure admin user exists
    const adminExists = await User.findOne({ where: { username: 'admin' } });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        username: 'admin',
        password_hash: hashedPassword,
        first_name: 'Admin',
        last_name: 'User',
        email: 'admin@devsystems.com',
        role_id: adminRole.role_id,
        is_active: true,
      });
      console.log('✅ Created admin user');
    }

    // Seed Products
    console.log('📦 Seeding products...');
    const products = await Product.bulkCreate(sampleProducts);
    console.log(`✅ Created ${products.length} products`);

    // Seed Inventory with various expiry dates
    console.log('📦 Seeding inventory...');
    const inventoryData = [];
    const today = new Date();

    for (const product of products) {
      // Create 2-3 batches per product with different expiry dates
      const batchCount = Math.floor(Math.random() * 2) + 2; // 2 or 3 batches

      for (let i = 0; i < batchCount; i++) {
        const monthsToAdd = Math.floor(Math.random() * 24) + 3; // 3-27 months
        const expiryDate = new Date(today);
        expiryDate.setMonth(expiryDate.getMonth() + monthsToAdd);

        const quantityOnHand = Math.floor(Math.random() * 500) + 50; // 50-550 units
        inventoryData.push({
          product_id: product.product_id,
          batch_number: `BATCH-${product.item_code}-${String(i + 1).padStart(3, '0')}`,
          quantity_on_hand: quantityOnHand,
          quantity_allocated: 0,
          expiry_date: expiryDate,
          received_date: new Date(),
          cost_per_unit: (product.selling_price || 0) * 0.7, // Cost is 70% of selling price
          mrp: product.mrp,
          bin_location: `A${Math.floor(Math.random() * 10) + 1}`,
          rack_number: `R${Math.floor(Math.random() * 20) + 1}`,
          shelf_number: `S${Math.floor(Math.random() * 5) + 1}`,
          status: 'available',
        });
      }
    }

    await Inventory.bulkCreate(inventoryData);
    console.log(`✅ Created ${inventoryData.length} inventory batches`);

    // Seed Patients
    console.log('👥 Seeding patients...');
    const patients = await Patient.bulkCreate(samplePatients);
    console.log(`✅ Created ${patients.length} patients`);

    // Seed Sales Orders (last 30 days)
    console.log('💰 Seeding sales orders...');
    const salesOrders: any[] = [];
    const salesOrderItems: any[] = [];

    // Create sales for last 30 days
    for (let dayOffset = 30; dayOffset >= 0; dayOffset--) {
      const orderDate = new Date(today);
      orderDate.setDate(orderDate.getDate() - dayOffset);
      orderDate.setHours(10 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 60));

      // Create 3-8 orders per day
      const ordersPerDay = Math.floor(Math.random() * 6) + 3;

      for (let i = 0; i < ordersPerDay; i++) {
        const orderNumber = `ORD-${orderDate.getFullYear()}${String(orderDate.getMonth() + 1).padStart(2, '0')}${String(orderDate.getDate()).padStart(2, '0')}-${String(salesOrders.length + 1).padStart(4, '0')}`;
        const hasPatient = Math.random() > 0.3; // 70% have patient
        const patient_id = hasPatient ? patients[Math.floor(Math.random() * patients.length)].patient_id : undefined;

        // Select 1-5 random products for this order
        const itemCount = Math.floor(Math.random() * 5) + 1;
        const selectedProducts: typeof products = [];
        for (let j = 0; j < itemCount; j++) {
          const product = products[Math.floor(Math.random() * products.length)];
          if (!selectedProducts.find(p => p.product_id === product.product_id)) {
            selectedProducts.push(product);
          }
        }

        // Calculate order totals
        let subtotal = 0;
        const orderItems: any[] = [];

        for (const product of selectedProducts) {
          const quantity = Math.floor(Math.random() * 5) + 1; // 1-5 units
          const unit_price = product.selling_price || 0;
          const total_price = quantity * unit_price;
          const gst_rate = product.gst_rate || 0;
          const gst_amount = (total_price * gst_rate) / (100 + gst_rate);

          subtotal += total_price;

          orderItems.push({
            order_number: orderNumber,
            product_id: product.product_id,
            quantity: quantity,
            unit_price: unit_price,
            discount_percent: 0,
            discount_amount: 0,
            gst_rate: gst_rate,
            gst_amount: gst_amount,
            total_price: total_price,
          });
        }

        // Calculate GST breakdown
        const cgst_amount = subtotal * 0.06; // Assuming 12% GST split as 6% CGST + 6% SGST
        const sgst_amount = subtotal * 0.06;
        const igst_amount = 0;
        const total_amount = subtotal;

        const payment_statuses = ['paid', 'paid', 'paid', 'partial'] as const; // 75% fully paid
        const payment_status = payment_statuses[Math.floor(Math.random() * payment_statuses.length)];
        const amount_paid = payment_status === 'paid' ? total_amount : total_amount * 0.5;

        salesOrders.push({
          order_number: orderNumber,
          order_type: 'retail',
          order_date: orderDate,
          patient_id: patient_id,
          location_id: 1,
          subtotal: subtotal,
          discount_amount: 0,
          cgst_amount: cgst_amount,
          sgst_amount: sgst_amount,
          igst_amount: igst_amount,
          total_amount: total_amount,
          payment_status: payment_status,
          amount_paid: amount_paid,
          balance_due: total_amount - amount_paid,
          status: 'completed',
          notes: hasPatient ? 'Customer sale' : 'Walk-in customer',
        });

        salesOrderItems.push(...orderItems);
      }
    }

    await SalesOrder.bulkCreate(salesOrders);
    console.log(`✅ Created ${salesOrders.length} sales orders`);

    await SalesOrderItem.bulkCreate(salesOrderItems);
    console.log(`✅ Created ${salesOrderItems.length} sales order items`);

    console.log('');
    console.log('🎉 Database seeding completed successfully!');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   - Products: ${products.length}`);
    console.log(`   - Inventory Batches: ${inventoryData.length}`);
    console.log(`   - Patients: ${patients.length}`);
    console.log(`   - Sales Orders: ${salesOrders.length}`);
    console.log(`   - Sales Items: ${salesOrderItems.length}`);
    console.log('');
    console.log('👤 Login credentials:');
    console.log('   Username: admin');
    console.log('   Password: admin123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase();
