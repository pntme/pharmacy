import express from 'express';
import {
  getAllInventory,
  getInventoryByProduct,
  addInventory,
  updateInventory,
  adjustInventory,
  getExpiringInventory,
  getStockSummary,
} from '../controllers/inventoryController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.get('/', authenticateToken, getAllInventory);
router.get('/expiring', authenticateToken, getExpiringInventory);
router.get('/summary', authenticateToken, getStockSummary);
router.get('/product/:product_id', authenticateToken, getInventoryByProduct);
router.post('/', authenticateToken, addInventory);
router.put('/:id', authenticateToken, updateInventory);
router.post('/:id/adjust', authenticateToken, adjustInventory);

export default router;
