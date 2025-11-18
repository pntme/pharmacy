import express from 'express';
import {
  createSale,
  getAllSales,
  getSaleById,
  getDailySalesReport,
  cancelSale,
} from '../controllers/salesController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.post('/', authenticateToken, createSale);
router.get('/', authenticateToken, getAllSales);
router.get('/daily-report', authenticateToken, getDailySalesReport);
router.get('/:id', authenticateToken, getSaleById);
router.post('/:id/cancel', authenticateToken, cancelSale);

export default router;
