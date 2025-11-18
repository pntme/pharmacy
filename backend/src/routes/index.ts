import express from 'express';
import authRoutes from './authRoutes';
import productRoutes from './productRoutes';

const router = express.Router();

// API routes
router.use('/auth', authRoutes);
router.use('/products', productRoutes);

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
      health: '/api/v1/health',
    },
  });
});

export default router;
