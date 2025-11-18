-- Pharmacy Management System - Complete Database Schema
-- PostgreSQL Version
-- Supports both Retail and Wholesale operations
-- India-specific compliance included

-- ============================================================================
-- MASTER DATA TABLES
-- ============================================================================

-- Addresses Table
CREATE TABLE addresses (
    address_id SERIAL PRIMARY KEY,
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(50) DEFAULT 'India',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Locations/Stores Table
CREATE TABLE locations (
    location_id SERIAL PRIMARY KEY,
    location_name VARCHAR(200) NOT NULL,
    location_type VARCHAR(50) CHECK (location_type IN ('retail', 'warehouse', 'distribution_center')),
    license_number VARCHAR(100) UNIQUE NOT NULL,
    drug_license_20b VARCHAR(100),
    drug_license_21b VARCHAR(100),
    gstin VARCHAR(15),
    phone_number VARCHAR(20),
    email VARCHAR(100),
    address_id INTEGER REFERENCES addresses(address_id),
    manager_id INTEGER,
    operating_hours JSONB,
    timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Roles Table
CREATE TABLE roles (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    role_description TEXT,
    permissions JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users Table
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone_number VARCHAR(20),
    role_id INTEGER REFERENCES roles(role_id),
    location_id INTEGER REFERENCES locations(location_id),
    pharmacist_registration_number VARCHAR(100),
    license_number VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Manufacturers Table
CREATE TABLE manufacturers (
    manufacturer_id SERIAL PRIMARY KEY,
    manufacturer_name VARCHAR(200) NOT NULL,
    manufacturer_code VARCHAR(50) UNIQUE,
    country VARCHAR(100),
    contact_person VARCHAR(100),
    phone_number VARCHAR(20),
    email VARCHAR(100),
    website VARCHAR(200),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products/Medications Table
CREATE TABLE products (
    product_id SERIAL PRIMARY KEY,
    item_code VARCHAR(50) UNIQUE NOT NULL,
    product_name VARCHAR(300) NOT NULL,
    generic_name VARCHAR(300),
    brand_name VARCHAR(200),
    manufacturer_id INTEGER REFERENCES manufacturers(manufacturer_id),
    strength VARCHAR(100),
    dosage_form VARCHAR(100),
    pack_size VARCHAR(100),
    unit_of_measure VARCHAR(50),
    therapeutic_class VARCHAR(200),

    -- India-specific fields
    schedule VARCHAR(20) CHECK (schedule IN ('H', 'H1', 'X', 'G', 'J', 'OTC')),
    hsn_code VARCHAR(20),

    -- Pricing
    mrp DECIMAL(10, 2) NOT NULL,
    purchase_rate DECIMAL(10, 2),
    selling_price DECIMAL(10, 2),
    discount_percentage DECIMAL(5, 2) DEFAULT 0,

    -- GST
    gst_rate DECIMAL(5, 2) DEFAULT 12.00,
    cgst_rate DECIMAL(5, 2),
    sgst_rate DECIMAL(5, 2),
    igst_rate DECIMAL(5, 2),

    -- Storage and handling
    storage_requirements TEXT,
    is_refrigerated BOOLEAN DEFAULT false,
    is_controlled_substance BOOLEAN DEFAULT false,
    is_hazardous BOOLEAN DEFAULT false,
    requires_prescription BOOLEAN DEFAULT false,

    -- Inventory settings
    reorder_level INTEGER DEFAULT 0,
    reorder_quantity INTEGER DEFAULT 0,

    -- Additional info
    barcode VARCHAR(100),
    image_url VARCHAR(500),
    description TEXT,
    is_active BOOLEAN DEFAULT true,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Suppliers/Wholesalers Table
CREATE TABLE suppliers (
    supplier_id SERIAL PRIMARY KEY,
    supplier_name VARCHAR(200) NOT NULL,
    supplier_type VARCHAR(50) CHECK (supplier_type IN ('manufacturer', 'c&f', 'stockist', 'wholesaler', 'super_stockist')),
    license_number VARCHAR(100),
    drug_license_20b VARCHAR(100),
    drug_license_21b VARCHAR(100),
    gstin VARCHAR(15),
    pan_number VARCHAR(10),
    contact_person VARCHAR(100),
    phone_number VARCHAR(20),
    fax_number VARCHAR(20),
    email VARCHAR(100),
    address_id INTEGER REFERENCES addresses(address_id),

    -- Payment terms
    payment_terms VARCHAR(50),
    credit_days INTEGER DEFAULT 0,
    credit_limit DECIMAL(15, 2) DEFAULT 0,

    -- Additional info
    bank_name VARCHAR(200),
    bank_account_number VARCHAR(50),
    bank_ifsc VARCHAR(20),

    is_active BOOLEAN DEFAULT true,
    rating DECIMAL(3, 2),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INVENTORY TABLES
-- ============================================================================

-- Inventory Table (Batch-wise)
CREATE TABLE inventory (
    inventory_id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(product_id),
    location_id INTEGER NOT NULL REFERENCES locations(location_id),
    batch_number VARCHAR(100) NOT NULL,
    lot_number VARCHAR(100),
    serial_number VARCHAR(100),

    -- Quantities
    quantity_on_hand INTEGER NOT NULL DEFAULT 0,
    quantity_allocated INTEGER DEFAULT 0,
    quantity_available INTEGER GENERATED ALWAYS AS (quantity_on_hand - quantity_allocated) STORED,

    -- Dates
    manufacture_date DATE,
    expiry_date DATE NOT NULL,
    received_date DATE DEFAULT CURRENT_DATE,

    -- Pricing
    cost_per_unit DECIMAL(10, 2) NOT NULL,
    mrp DECIMAL(10, 2),

    -- Storage
    bin_location VARCHAR(100),
    rack_number VARCHAR(50),
    shelf_number VARCHAR(50),

    -- Status
    status VARCHAR(50) CHECK (status IN ('available', 'quarantine', 'expired', 'returned', 'disposed')) DEFAULT 'available',

    supplier_id INTEGER REFERENCES suppliers(supplier_id),
    purchase_order_id INTEGER,

    last_counted_date DATE,
    notes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(product_id, location_id, batch_number)
);

-- ============================================================================
-- CUSTOMER/PATIENT TABLES
-- ============================================================================

-- Patients Table
CREATE TABLE patients (
    patient_id SERIAL PRIMARY KEY,
    patient_code VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(20) CHECK (gender IN ('Male', 'Female', 'Other')),

    -- Contact info
    phone_number VARCHAR(20) NOT NULL,
    alternate_phone VARCHAR(20),
    email VARCHAR(100),
    address_id INTEGER REFERENCES addresses(address_id),

    -- Emergency contact
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relation VARCHAR(50),

    -- Medical info (encrypted in production)
    blood_group VARCHAR(10),
    allergies JSONB,
    chronic_conditions JSONB,

    -- Preferences
    preferred_language VARCHAR(50) DEFAULT 'English',
    communication_preference VARCHAR(50) CHECK (communication_preference IN ('SMS', 'Email', 'WhatsApp', 'Call')),
    preferred_location_id INTEGER REFERENCES locations(location_id),

    -- Insurance (for future use)
    insurance_provider VARCHAR(200),
    insurance_number VARCHAR(100),

    -- Loyalty
    loyalty_points INTEGER DEFAULT 0,
    total_purchases DECIMAL(15, 2) DEFAULT 0,

    -- Consent
    consent_for_communication BOOLEAN DEFAULT false,
    consent_date DATE,

    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- B2B Customers (Wholesale)
CREATE TABLE business_customers (
    customer_id SERIAL PRIMARY KEY,
    customer_code VARCHAR(50) UNIQUE NOT NULL,
    business_name VARCHAR(200) NOT NULL,
    customer_type VARCHAR(50) CHECK (customer_type IN ('hospital', 'clinic', 'pharmacy', 'nursing_home', 'diagnostic_center')),

    -- License info
    license_number VARCHAR(100),
    drug_license VARCHAR(100),
    gstin VARCHAR(15),
    pan_number VARCHAR(10),

    -- Contact
    contact_person VARCHAR(100),
    designation VARCHAR(100),
    phone_number VARCHAR(20),
    email VARCHAR(100),
    address_id INTEGER REFERENCES addresses(address_id),

    -- Multiple delivery addresses
    delivery_addresses JSONB,

    -- Credit terms
    credit_limit DECIMAL(15, 2) DEFAULT 0,
    credit_days INTEGER DEFAULT 0,
    payment_terms VARCHAR(50),

    -- Banking
    bank_name VARCHAR(200),
    bank_account_number VARCHAR(50),
    bank_ifsc VARCHAR(20),

    -- Account manager
    account_manager_id INTEGER REFERENCES users(user_id),

    is_active BOOLEAN DEFAULT true,
    rating DECIMAL(3, 2),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- PRESCRIBER TABLES
-- ============================================================================

-- Prescribers/Doctors Table
CREATE TABLE prescribers (
    prescriber_id SERIAL PRIMARY KEY,
    prescriber_code VARCHAR(50) UNIQUE NOT NULL,
    registration_number VARCHAR(100) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    credentials VARCHAR(200),
    specialty VARCHAR(100),

    -- Practice info
    practice_name VARCHAR(200),
    hospital_name VARCHAR(200),

    -- Contact
    phone_number VARCHAR(20),
    fax_number VARCHAR(20),
    email VARCHAR(100),
    address_id INTEGER REFERENCES addresses(address_id),

    -- Prescription capabilities
    can_prescribe_schedule_x BOOLEAN DEFAULT false,
    erx_enabled BOOLEAN DEFAULT false,
    preferred_contact_method VARCHAR(50),

    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- PRESCRIPTION TABLES
-- ============================================================================

-- Prescriptions Table
CREATE TABLE prescriptions (
    prescription_id SERIAL PRIMARY KEY,
    rx_number VARCHAR(100) UNIQUE NOT NULL,
    patient_id INTEGER NOT NULL REFERENCES patients(patient_id),
    prescriber_id INTEGER NOT NULL REFERENCES prescribers(prescriber_id),

    -- Prescription details
    prescription_date DATE NOT NULL DEFAULT CURRENT_DATE,
    written_date DATE,

    -- Origin
    origin VARCHAR(50) CHECK (origin IN ('written', 'erx', 'phone', 'fax', 'verbal')) NOT NULL,
    prescription_image_url VARCHAR(500),

    -- Status
    status VARCHAR(50) CHECK (status IN ('received', 'verified', 'processing', 'ready', 'dispensed', 'cancelled', 'on_hold')) DEFAULT 'received',
    priority VARCHAR(20) CHECK (priority IN ('routine', 'urgent', 'stat')) DEFAULT 'routine',

    -- Delivery
    delivery_method VARCHAR(50) CHECK (delivery_method IN ('pickup', 'delivery', 'mail')),
    delivery_address_id INTEGER REFERENCES addresses(address_id),

    -- Processing info
    received_by_user_id INTEGER REFERENCES users(user_id),
    verified_by_user_id INTEGER REFERENCES users(user_id),
    dispensed_by_user_id INTEGER REFERENCES users(user_id),

    received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP,
    ready_at TIMESTAMP,
    dispensed_at TIMESTAMP,
    pickup_at TIMESTAMP,

    -- Notes
    pharmacist_notes TEXT,
    special_instructions TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Prescription Items
CREATE TABLE prescription_items (
    prescription_item_id SERIAL PRIMARY KEY,
    prescription_id INTEGER NOT NULL REFERENCES prescriptions(prescription_id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(product_id),

    -- Prescribed details
    drug_name VARCHAR(300),
    generic_name VARCHAR(300),
    strength VARCHAR(100),
    dosage_form VARCHAR(100),
    directions TEXT NOT NULL,

    quantity_prescribed INTEGER NOT NULL,
    quantity_dispensed INTEGER DEFAULT 0,
    days_supply INTEGER,

    refills_authorized INTEGER DEFAULT 0,
    refills_remaining INTEGER DEFAULT 0,

    -- Substitution
    daw_code INTEGER DEFAULT 0, -- Dispense As Written
    substitution_allowed BOOLEAN DEFAULT true,

    -- Status
    status VARCHAR(50) CHECK (status IN ('pending', 'filled', 'partially_filled', 'cancelled')) DEFAULT 'pending',

    -- Clinical
    clinical_check_status VARCHAR(50),
    interaction_warnings JSONB,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Schedule X Register (India-specific)
CREATE TABLE schedule_x_register (
    register_id SERIAL PRIMARY KEY,
    prescription_id INTEGER REFERENCES prescriptions(prescription_id),
    prescription_item_id INTEGER REFERENCES prescription_items(prescription_item_id),
    product_id INTEGER REFERENCES products(product_id),

    -- Patient info (duplicated for legal record)
    patient_name VARCHAR(200) NOT NULL,
    patient_address TEXT NOT NULL,
    patient_age INTEGER,

    -- Prescriber info (duplicated for legal record)
    prescriber_name VARCHAR(200) NOT NULL,
    prescriber_registration VARCHAR(100) NOT NULL,
    prescriber_address TEXT,

    -- Drug info
    drug_name VARCHAR(300) NOT NULL,
    quantity_dispensed INTEGER NOT NULL,

    -- Dispensing info
    dispensing_date DATE NOT NULL DEFAULT CURRENT_DATE,
    dispensed_by_user_id INTEGER REFERENCES users(user_id),
    dispensed_by_pharmacist_name VARCHAR(200),

    -- Running balance
    opening_balance INTEGER,
    closing_balance INTEGER,

    -- Prescription original retention
    prescription_retained BOOLEAN DEFAULT true,

    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- PURCHASE TABLES
-- ============================================================================

-- Purchase Orders Table
CREATE TABLE purchase_orders (
    po_id SERIAL PRIMARY KEY,
    po_number VARCHAR(100) UNIQUE NOT NULL,
    supplier_id INTEGER NOT NULL REFERENCES suppliers(supplier_id),
    location_id INTEGER NOT NULL REFERENCES locations(location_id),

    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expected_delivery_date DATE,
    actual_delivery_date DATE,

    -- Status
    status VARCHAR(50) CHECK (status IN ('draft', 'sent', 'acknowledged', 'partial', 'received', 'cancelled')) DEFAULT 'draft',

    -- Amounts
    subtotal DECIMAL(15, 2) DEFAULT 0,
    discount_amount DECIMAL(15, 2) DEFAULT 0,
    cgst_amount DECIMAL(15, 2) DEFAULT 0,
    sgst_amount DECIMAL(15, 2) DEFAULT 0,
    igst_amount DECIMAL(15, 2) DEFAULT 0,
    other_charges DECIMAL(15, 2) DEFAULT 0,
    total_amount DECIMAL(15, 2) DEFAULT 0,

    -- Approval
    created_by_user_id INTEGER REFERENCES users(user_id),
    approved_by_user_id INTEGER REFERENCES users(user_id),
    received_by_user_id INTEGER REFERENCES users(user_id),

    approved_at TIMESTAMP,

    payment_terms VARCHAR(200),
    delivery_terms VARCHAR(200),
    notes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Purchase Order Items
CREATE TABLE purchase_order_items (
    po_item_id SERIAL PRIMARY KEY,
    po_id INTEGER NOT NULL REFERENCES purchase_orders(po_id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(product_id),

    quantity_ordered INTEGER NOT NULL,
    quantity_received INTEGER DEFAULT 0,
    quantity_pending INTEGER GENERATED ALWAYS AS (quantity_ordered - quantity_received) STORED,

    unit_cost DECIMAL(10, 2) NOT NULL,
    discount_percentage DECIMAL(5, 2) DEFAULT 0,
    discount_amount DECIMAL(10, 2) DEFAULT 0,

    gst_rate DECIMAL(5, 2) DEFAULT 12.00,
    cgst_amount DECIMAL(10, 2) DEFAULT 0,
    sgst_amount DECIMAL(10, 2) DEFAULT 0,
    igst_amount DECIMAL(10, 2) DEFAULT 0,

    line_total DECIMAL(15, 2) NOT NULL,

    -- Receiving info
    batch_number VARCHAR(100),
    expiry_date DATE,
    received_date DATE,

    status VARCHAR(50) CHECK (status IN ('pending', 'partial', 'received', 'short', 'damaged', 'cancelled')) DEFAULT 'pending',

    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Goods Receipt Notes (GRN)
CREATE TABLE goods_receipt_notes (
    grn_id SERIAL PRIMARY KEY,
    grn_number VARCHAR(100) UNIQUE NOT NULL,
    po_id INTEGER REFERENCES purchase_orders(po_id),
    supplier_id INTEGER NOT NULL REFERENCES suppliers(supplier_id),
    location_id INTEGER NOT NULL REFERENCES locations(location_id),

    receipt_date DATE NOT NULL DEFAULT CURRENT_DATE,
    invoice_number VARCHAR(100),
    invoice_date DATE,
    invoice_amount DECIMAL(15, 2),

    transport_mode VARCHAR(100),
    vehicle_number VARCHAR(50),
    lr_number VARCHAR(100),

    received_by_user_id INTEGER REFERENCES users(user_id),
    verified_by_user_id INTEGER REFERENCES users(user_id),

    status VARCHAR(50) CHECK (status IN ('draft', 'verified', 'posted')) DEFAULT 'draft',

    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- GRN Items
CREATE TABLE grn_items (
    grn_item_id SERIAL PRIMARY KEY,
    grn_id INTEGER NOT NULL REFERENCES goods_receipt_notes(grn_id) ON DELETE CASCADE,
    po_item_id INTEGER REFERENCES purchase_order_items(po_item_id),
    product_id INTEGER NOT NULL REFERENCES products(product_id),

    batch_number VARCHAR(100) NOT NULL,
    manufacture_date DATE,
    expiry_date DATE NOT NULL,

    quantity_received INTEGER NOT NULL,
    free_quantity INTEGER DEFAULT 0,
    damaged_quantity INTEGER DEFAULT 0,

    unit_cost DECIMAL(10, 2) NOT NULL,
    mrp DECIMAL(10, 2),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- SALES TABLES
-- ============================================================================

-- Sales Orders Table
CREATE TABLE sales_orders (
    order_id SERIAL PRIMARY KEY,
    order_number VARCHAR(100) UNIQUE NOT NULL,
    order_type VARCHAR(50) CHECK (order_type IN ('retail', 'wholesale', 'online', 'prescription')) NOT NULL,

    -- Customer reference (polymorphic)
    customer_type VARCHAR(20) CHECK (customer_type IN ('patient', 'business')),
    patient_id INTEGER REFERENCES patients(patient_id),
    business_customer_id INTEGER REFERENCES business_customers(customer_id),

    location_id INTEGER NOT NULL REFERENCES locations(location_id),

    order_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Status
    status VARCHAR(50) CHECK (status IN ('draft', 'pending', 'processing', 'ready', 'completed', 'cancelled', 'returned')) DEFAULT 'draft',
    payment_status VARCHAR(50) CHECK (payment_status IN ('unpaid', 'partial', 'paid', 'refunded')) DEFAULT 'unpaid',

    -- Amounts
    subtotal DECIMAL(15, 2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(15, 2) DEFAULT 0,
    discount_percentage DECIMAL(5, 2) DEFAULT 0,

    cgst_amount DECIMAL(15, 2) DEFAULT 0,
    sgst_amount DECIMAL(15, 2) DEFAULT 0,
    igst_amount DECIMAL(15, 2) DEFAULT 0,

    round_off DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,

    amount_paid DECIMAL(15, 2) DEFAULT 0,
    balance_due DECIMAL(15, 2) DEFAULT 0,

    -- Delivery
    delivery_method VARCHAR(50) CHECK (delivery_method IN ('pickup', 'delivery', 'shipping', 'courier')),
    delivery_address_id INTEGER REFERENCES addresses(address_id),
    delivery_date DATE,
    delivery_charges DECIMAL(10, 2) DEFAULT 0,

    -- Linked prescription
    prescription_id INTEGER REFERENCES prescriptions(prescription_id),

    -- User tracking
    created_by_user_id INTEGER REFERENCES users(user_id),
    billed_by_user_id INTEGER REFERENCES users(user_id),

    billed_at TIMESTAMP,

    notes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sales Order Items
CREATE TABLE sales_order_items (
    order_item_id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES sales_orders(order_id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(product_id),
    inventory_id INTEGER REFERENCES inventory(inventory_id),
    prescription_item_id INTEGER REFERENCES prescription_items(prescription_item_id),

    -- Item details
    product_name VARCHAR(300),
    batch_number VARCHAR(100),
    expiry_date DATE,

    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    mrp DECIMAL(10, 2),

    discount_percentage DECIMAL(5, 2) DEFAULT 0,
    discount_amount DECIMAL(10, 2) DEFAULT 0,

    gst_rate DECIMAL(5, 2) DEFAULT 12.00,
    cgst_amount DECIMAL(10, 2) DEFAULT 0,
    sgst_amount DECIMAL(10, 2) DEFAULT 0,
    igst_amount DECIMAL(10, 2) DEFAULT 0,

    line_total DECIMAL(15, 2) NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- PAYMENT TABLES
-- ============================================================================

-- Payment Transactions Table
CREATE TABLE payment_transactions (
    payment_id SERIAL PRIMARY KEY,
    transaction_number VARCHAR(100) UNIQUE NOT NULL,

    -- Reference
    order_id INTEGER REFERENCES sales_orders(order_id),
    patient_id INTEGER REFERENCES patients(patient_id),
    business_customer_id INTEGER REFERENCES business_customers(customer_id),

    payment_type VARCHAR(50) CHECK (payment_type IN ('receipt', 'refund')),
    payment_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Payment details
    payment_method VARCHAR(50) CHECK (payment_method IN ('cash', 'card', 'upi', 'netbanking', 'cheque', 'credit')) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,

    -- For card/UPI/netbanking
    transaction_id VARCHAR(200),
    reference_number VARCHAR(200),
    card_last_four VARCHAR(4),
    upi_id VARCHAR(100),

    -- For cheque
    cheque_number VARCHAR(50),
    cheque_date DATE,
    bank_name VARCHAR(200),

    -- Status
    status VARCHAR(50) CHECK (status IN ('pending', 'completed', 'failed', 'refunded', 'cancelled')) DEFAULT 'completed',

    -- Refund info
    refund_amount DECIMAL(15, 2),
    refund_date TIMESTAMP,
    refund_reason TEXT,

    processed_by_user_id INTEGER REFERENCES users(user_id),

    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- AUDIT AND COMPLIANCE TABLES
-- ============================================================================

-- Audit Log Table
CREATE TABLE audit_logs (
    audit_id SERIAL PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    record_id INTEGER NOT NULL,
    action VARCHAR(50) CHECK (action IN ('INSERT', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'ACCESS')) NOT NULL,
    old_values JSONB,
    new_values JSONB,
    changed_fields JSONB,
    user_id INTEGER REFERENCES users(user_id),
    ip_address VARCHAR(50),
    user_agent TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_audit_table (table_name),
    INDEX idx_audit_user (user_id),
    INDEX idx_audit_timestamp (timestamp)
);

-- Stock Adjustments Table
CREATE TABLE stock_adjustments (
    adjustment_id SERIAL PRIMARY KEY,
    adjustment_number VARCHAR(100) UNIQUE NOT NULL,
    location_id INTEGER REFERENCES locations(location_id),
    inventory_id INTEGER REFERENCES inventory(inventory_id),
    product_id INTEGER REFERENCES products(product_id),

    adjustment_type VARCHAR(50) CHECK (adjustment_type IN ('damaged', 'expired', 'lost', 'found', 'correction', 'return', 'disposal')),
    adjustment_date DATE NOT NULL DEFAULT CURRENT_DATE,

    quantity_before INTEGER NOT NULL,
    quantity_adjusted INTEGER NOT NULL,
    quantity_after INTEGER NOT NULL,

    reason TEXT NOT NULL,

    adjusted_by_user_id INTEGER REFERENCES users(user_id),
    approved_by_user_id INTEGER REFERENCES users(user_id),

    status VARCHAR(50) CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Temperature Logs Table (for refrigerated items)
CREATE TABLE temperature_logs (
    log_id SERIAL PRIMARY KEY,
    location_id INTEGER REFERENCES locations(location_id),
    equipment_name VARCHAR(100) NOT NULL,
    equipment_type VARCHAR(50) CHECK (equipment_type IN ('refrigerator', 'freezer', 'room')),

    temperature DECIMAL(5, 2) NOT NULL,
    humidity DECIMAL(5, 2),

    min_threshold DECIMAL(5, 2),
    max_threshold DECIMAL(5, 2),
    is_out_of_range BOOLEAN DEFAULT false,

    recorded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    recorded_by_user_id INTEGER REFERENCES users(user_id),

    alert_sent BOOLEAN DEFAULT false,
    alert_acknowledged BOOLEAN DEFAULT false,

    notes TEXT
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Products indexes
CREATE INDEX idx_products_item_code ON products(item_code);
CREATE INDEX idx_products_name ON products(product_name);
CREATE INDEX idx_products_generic ON products(generic_name);
CREATE INDEX idx_products_schedule ON products(schedule);
CREATE INDEX idx_products_manufacturer ON products(manufacturer_id);

-- Inventory indexes
CREATE INDEX idx_inventory_product ON inventory(product_id);
CREATE INDEX idx_inventory_location ON inventory(location_id);
CREATE INDEX idx_inventory_expiry ON inventory(expiry_date);
CREATE INDEX idx_inventory_batch ON inventory(batch_number);
CREATE INDEX idx_inventory_status ON inventory(status);

-- Patients indexes
CREATE INDEX idx_patients_phone ON patients(phone_number);
CREATE INDEX idx_patients_code ON patients(patient_code);
CREATE INDEX idx_patients_name ON patients(first_name, last_name);

-- Prescriptions indexes
CREATE INDEX idx_prescriptions_rx ON prescriptions(rx_number);
CREATE INDEX idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX idx_prescriptions_status ON prescriptions(status);
CREATE INDEX idx_prescriptions_date ON prescriptions(prescription_date);

-- Sales orders indexes
CREATE INDEX idx_sales_orders_number ON sales_orders(order_number);
CREATE INDEX idx_sales_orders_date ON sales_orders(order_date);
CREATE INDEX idx_sales_orders_patient ON sales_orders(patient_id);
CREATE INDEX idx_sales_orders_status ON sales_orders(status);

-- Purchase orders indexes
CREATE INDEX idx_po_number ON purchase_orders(po_number);
CREATE INDEX idx_po_supplier ON purchase_orders(supplier_id);
CREATE INDEX idx_po_date ON purchase_orders(order_date);

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Insert default roles
INSERT INTO roles (role_name, role_description, permissions) VALUES
('admin', 'System Administrator', '{"all": true}'::jsonb),
('pharmacist', 'Licensed Pharmacist', '{"prescriptions": ["read", "write", "verify"], "sales": ["read", "write"], "inventory": ["read"]}'::jsonb),
('pharmacy_manager', 'Pharmacy Manager', '{"prescriptions": ["read", "write", "verify"], "sales": ["read", "write"], "inventory": ["read", "write"], "reports": ["read"]}'::jsonb),
('technician', 'Pharmacy Technician', '{"prescriptions": ["read", "write"], "sales": ["read"], "inventory": ["read"]}'::jsonb),
('cashier', 'Cashier', '{"sales": ["read", "write"], "inventory": ["read"]}'::jsonb),
('inventory_manager', 'Inventory Manager', '{"inventory": ["read", "write"], "purchase": ["read", "write"], "reports": ["read"]}'::jsonb);

-- ============================================================================
-- VIEWS FOR REPORTING
-- ============================================================================

-- Current Stock View
CREATE OR REPLACE VIEW v_current_stock AS
SELECT
    p.product_id,
    p.item_code,
    p.product_name,
    p.generic_name,
    p.manufacturer_id,
    l.location_id,
    l.location_name,
    SUM(i.quantity_on_hand) as total_quantity,
    SUM(i.quantity_allocated) as allocated_quantity,
    SUM(i.quantity_available) as available_quantity,
    MIN(i.expiry_date) as nearest_expiry,
    p.reorder_level,
    CASE
        WHEN SUM(i.quantity_available) <= p.reorder_level THEN 'Low Stock'
        WHEN SUM(i.quantity_available) = 0 THEN 'Out of Stock'
        ELSE 'In Stock'
    END as stock_status
FROM products p
LEFT JOIN inventory i ON p.product_id = i.product_id AND i.status = 'available'
LEFT JOIN locations l ON i.location_id = l.location_id
WHERE p.is_active = true
GROUP BY p.product_id, p.item_code, p.product_name, p.generic_name, p.manufacturer_id, l.location_id, l.location_name, p.reorder_level;

-- Expiring Soon View
CREATE OR REPLACE VIEW v_expiring_soon AS
SELECT
    i.inventory_id,
    p.product_id,
    p.product_name,
    i.batch_number,
    i.expiry_date,
    i.quantity_on_hand,
    l.location_name,
    CURRENT_DATE - i.expiry_date as days_to_expiry,
    CASE
        WHEN i.expiry_date < CURRENT_DATE THEN 'Expired'
        WHEN i.expiry_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'Critical'
        WHEN i.expiry_date <= CURRENT_DATE + INTERVAL '90 days' THEN 'Warning'
        ELSE 'Normal'
    END as expiry_status
FROM inventory i
JOIN products p ON i.product_id = p.product_id
JOIN locations l ON i.location_id = l.location_id
WHERE i.status = 'available'
  AND i.expiry_date <= CURRENT_DATE + INTERVAL '180 days'
ORDER BY i.expiry_date;

-- Daily Sales Summary View
CREATE OR REPLACE VIEW v_daily_sales_summary AS
SELECT
    DATE(order_date) as sale_date,
    location_id,
    order_type,
    COUNT(*) as total_orders,
    SUM(subtotal) as gross_sales,
    SUM(discount_amount) as total_discount,
    SUM(cgst_amount + sgst_amount + igst_amount) as total_gst,
    SUM(total_amount) as net_sales,
    SUM(amount_paid) as total_collected
FROM sales_orders
WHERE status IN ('completed', 'ready')
GROUP BY DATE(order_date), location_id, order_type;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update timestamps trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prescriptions_updated_at BEFORE UPDATE ON prescriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sales_orders_updated_at BEFORE UPDATE ON sales_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE products IS 'Master table for all pharmaceutical products';
COMMENT ON TABLE inventory IS 'Batch-wise inventory tracking with expiry dates';
COMMENT ON TABLE patients IS 'Patient/customer records for retail pharmacy';
COMMENT ON TABLE business_customers IS 'B2B customers for wholesale operations';
COMMENT ON TABLE prescriptions IS 'Prescription records with regulatory compliance';
COMMENT ON TABLE schedule_x_register IS 'Legal register for Schedule X controlled substances as per NDPS Act';
COMMENT ON TABLE sales_orders IS 'All sales transactions (retail and wholesale)';
COMMENT ON TABLE purchase_orders IS 'Purchase orders to suppliers';
COMMENT ON TABLE audit_logs IS 'Comprehensive audit trail for compliance';

-- End of schema
