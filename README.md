# Pharmacy Management System (Retail + Wholesale)

A comprehensive, modern pharmacy management system designed for the Indian market. Supports both retail pharmacy operations and wholesale distribution with full compliance for Indian regulations (GST, Schedule H/H1/X, NDPS Act).

## 🏥 Features

### Core Features (MVP)
- **User Authentication & Authorization** - JWT-based auth with role-based access control
- **Product Management** - Complete product catalog with India-specific fields (HSN, Schedule, GST)
- **Inventory Management** - Batch-wise tracking with expiry date management (FEFO)
- **Prescription Management** - Digital prescription handling with Schedule H/H1/X compliance
- **POS/Billing System** - Fast checkout with GST calculations
- **Patient Management** - Customer records with prescription history
- **Supplier Management** - Vendor management with purchase orders
- **Reports & Analytics** - Sales, inventory, GST, and compliance reports

### India-Specific Compliance
- ✅ **GST Ready** - Automatic CGST/SGST/IGST calculation
- ✅ **Schedule H/H1/X** - Controlled substance tracking
- ✅ **NDPS Act Compliance** - Schedule X register maintenance
- ✅ **Drug License Management** - 20B/21B license tracking
- ✅ **FEFO System** - First Expiry First Out for inventory
- ✅ **MRP Enforcement** - Maximum Retail Price validation

## 🛠 Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL 14+
- **ORM**: Sequelize
- **Authentication**: JWT (JSON Web Tokens)
- **Logging**: Winston
- **Security**: Helmet, CORS, Rate Limiting

### Frontend (Upcoming)
- **Framework**: React 18+
- **UI Library**: Material-UI (MUI)
- **State Management**: Context API / Redux
- **HTTP Client**: Axios
- **Routing**: React Router

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn
- Git

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd pharmacy
```

### 2. Set Up PostgreSQL Database

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE pharmacy_db;

# Exit psql
\q
```

### 3. Run Database Schema

```bash
psql -U postgres -d pharmacy_db -f database/schema.sql
```

### 4. Set Up Backend

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env file with your database credentials
nano .env
```

**Important**: Update the following in your `.env` file:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pharmacy_db
DB_USER=postgres
DB_PASSWORD=your_password_here

JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
```

### 5. Build and Run Backend

```bash
# Development mode with hot reload
npm run dev

# Or build and run in production mode
npm run build
npm start
```

The API server will start on `http://localhost:3001`

### 6. Test the API

```bash
# Health check
curl http://localhost:3001/api/v1/health

# Expected response:
# {"success":true,"message":"Pharmacy Management System API is running","timestamp":"2025-..."}
```

## 📚 API Documentation

### Base URL
```
http://localhost:3001/api/v1
```

### Authentication Endpoints

#### Register New User
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "username": "admin",
  "password": "password123",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "phone_number": "+919876543210",
  "role_id": 1
}
```

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "user_id": 1,
      "username": "admin",
      "email": "john@example.com",
      "full_name": "John Doe",
      "role_id": 1
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Get Profile
```http
GET /api/v1/auth/profile
Authorization: Bearer <access_token>
```

### Product Endpoints

#### Get All Products
```http
GET /api/v1/products?page=1&limit=50&search=paracetamol
Authorization: Bearer <access_token>
```

Query Parameters:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 50)
- `search` - Search in name, generic name, item code
- `schedule` - Filter by schedule (H, H1, X, G, OTC)
- `is_active` - true/false
- `sort_by` - Field to sort by
- `sort_order` - ASC/DESC

#### Search Products (Quick Search)
```http
GET /api/v1/products/search?q=para&limit=20
Authorization: Bearer <access_token>
```

#### Get Product by ID
```http
GET /api/v1/products/:id
Authorization: Bearer <access_token>
```

#### Create Product
```http
POST /api/v1/products
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "item_code": "PARA500-100",
  "product_name": "Paracetamol 500mg",
  "generic_name": "Paracetamol",
  "manufacturer_id": 1,
  "strength": "500mg",
  "dosage_form": "Tablet",
  "pack_size": "10x10",
  "schedule": "H",
  "hsn_code": "30049099",
  "mrp": 50.00,
  "purchase_rate": 35.00,
  "gst_rate": 12.00,
  "reorder_level": 100,
  "requires_prescription": true,
  "is_active": true
}
```

#### Update Product
```http
PUT /api/v1/products/:id
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "mrp": 55.00,
  "purchase_rate": 38.00
}
```

#### Delete Product (Soft Delete)
```http
DELETE /api/v1/products/:id
Authorization: Bearer <access_token>
```

#### Get Products by Schedule
```http
GET /api/v1/products/schedule/X
Authorization: Bearer <access_token>
```

#### Get Low Stock Products
```http
GET /api/v1/products/low-stock
Authorization: Bearer <access_token>
```

## 🗂 Project Structure

```
pharmacy/
├── backend/
│   ├── src/
│   │   ├── config/           # Configuration files
│   │   │   ├── index.ts      # Main config
│   │   │   └── database.ts   # Database config
│   │   ├── controllers/      # Request handlers
│   │   │   ├── authController.ts
│   │   │   └── productController.ts
│   │   ├── middleware/       # Custom middleware
│   │   │   └── auth.ts       # Authentication middleware
│   │   ├── models/           # Database models
│   │   │   ├── User.ts
│   │   │   ├── Role.ts
│   │   │   ├── Product.ts
│   │   │   └── index.ts
│   │   ├── routes/           # API routes
│   │   │   ├── authRoutes.ts
│   │   │   ├── productRoutes.ts
│   │   │   └── index.ts
│   │   ├── types/            # TypeScript types
│   │   ├── utils/            # Utility functions
│   │   │   ├── jwt.ts        # JWT utilities
│   │   │   └── logger.ts     # Logging utility
│   │   └── server.ts         # Main server file
│   ├── dist/                 # Compiled JavaScript
│   ├── logs/                 # Application logs
│   ├── uploads/              # Uploaded files
│   ├── .env                  # Environment variables
│   ├── .env.example          # Environment template
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   └── (React app - coming soon)
├── database/
│   └── schema.sql            # Complete PostgreSQL schema
├── docs/                     # Documentation
└── README.md                 # This file
```

## 🔐 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt with configurable rounds
- **Rate Limiting** - Prevent brute force attacks
- **CORS** - Cross-Origin Resource Sharing configured
- **Helmet** - Security headers
- **Input Validation** - Request validation
- **SQL Injection Protection** - Parameterized queries via Sequelize
- **XSS Protection** - Built-in Express protections

## 🔑 Default Roles

The system comes with pre-defined roles (inserted via schema):

1. **Admin** - Full system access
2. **Pharmacist** - Prescription handling, sales, inventory view
3. **Pharmacy Manager** - Pharmacist + inventory management + reports
4. **Technician** - Prescription entry, limited sales access
5. **Cashier** - Sales and billing only
6. **Inventory Manager** - Inventory and purchase management

## 📊 Database Schema

The database includes the following main tables:

- **users** - System users with role-based access
- **roles** - User roles and permissions
- **products** - Product/medication catalog
- **inventory** - Batch-wise inventory with expiry tracking
- **patients** - Customer/patient records
- **business_customers** - B2B customers (wholesale)
- **prescriptions** - Prescription records
- **prescription_items** - Individual prescription items
- **schedule_x_register** - Legal register for controlled substances
- **sales_orders** - Sales transactions
- **sales_order_items** - Line items for sales
- **purchase_orders** - Purchase orders to suppliers
- **suppliers** - Supplier/wholesaler information
- **audit_logs** - Complete audit trail
- And many more...

See `database/schema.sql` for the complete schema.

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📈 Roadmap

### Phase 1 (Current) ✅
- ✅ Backend API setup
- ✅ Authentication & authorization
- ✅ Product management
- ✅ Database schema

### Phase 2 (Next)
- [ ] Inventory management API
- [ ] Prescription management API
- [ ] Billing/POS API
- [ ] Patient management API
- [ ] React frontend setup

### Phase 3
- [ ] Supplier & purchase order management
- [ ] Reports & analytics
- [ ] Dashboard UI
- [ ] Invoice generation

### Phase 4
- [ ] Mobile app (React Native)
- [ ] Barcode scanning
- [ ] SMS/Email notifications
- [ ] WhatsApp integration

### Phase 5
- [ ] Advanced analytics with AI
- [ ] Demand forecasting
- [ ] Integration with payment gateways
- [ ] Multi-location sync

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 📧 Support

For support and queries:
- Email: support@pharmacy-system.com
- GitHub Issues: [Create an issue](https://github.com/yourusername/pharmacy/issues)

## 🙏 Acknowledgments

- Built for the Indian pharmacy industry
- Compliant with Indian regulations (GST, NDPS Act, Drug Control)
- Designed for small to medium pharmacy businesses

## ⚠️ Disclaimer

This software is provided as-is for development and educational purposes. Ensure compliance with local regulations and laws before using in production. Consult with legal and regulatory experts for your specific use case.

---

**Made with ❤️ for Indian Pharmacies**
