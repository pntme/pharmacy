import express from 'express';
import authRoutes from './authRoutes';
import productRoutes from './productRoutes';
import inventoryRoutes from './inventoryRoutes';
import patientRoutes from './patientRoutes';
import salesRoutes from './salesRoutes';

const router = express.Router();

// API routes
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/patients', patientRoutes);
router.use('/sales', salesRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Pharmacy Management System API is running',
    timestamp: new Date().toISOString(),
  });
});

// Root endpoint
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Pharmacy Management System API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/v1/auth',
      products: '/api/v1/products',
      inventory: '/api/v1/inventory',
      patients: '/api/v1/patients',
      sales: '/api/v1/sales',
      health: '/api/v1/health',
    },
  });
});

export default router;
