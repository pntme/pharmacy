import express from 'express';
import {
  getAllProducts,
  getProductById,
  searchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsBySchedule,
  getLowStockProducts,
} from '../controllers/productController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = express.Router();

// Public/Protected routes (require authentication)
router.get('/', authenticateToken, getAllProducts);
router.get('/search', authenticateToken, searchProducts);
router.get('/low-stock', authenticateToken, getLowStockProducts);
router.get('/schedule/:schedule', authenticateToken, getProductsBySchedule);
router.get('/:id', authenticateToken, getProductById);

// Admin/Manager only routes
router.post('/', authenticateToken, createProduct); // Can add role authorization
router.put('/:id', authenticateToken, updateProduct);
router.delete('/:id', authenticateToken, deleteProduct);

export default router;
