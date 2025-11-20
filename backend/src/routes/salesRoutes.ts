import express from 'express';
import {
  createSale,
  getAllSales,
  getSaleById,
  getDailySalesReport,
  cancelSale,
  getWeeklySalesTrend,
  getCategoryBreakdown,
  getTopSellingProducts,
  getDashboardStats,
} from '../controllers/salesController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.post('/', authenticateToken, createSale);
router.get('/', authenticateToken, getAllSales);
router.get('/daily-report', authenticateToken, getDailySalesReport);

// Dashboard endpoints
router.get('/dashboard/stats', authenticateToken, getDashboardStats);
router.get('/dashboard/weekly-trend', authenticateToken, getWeeklySalesTrend);
router.get('/dashboard/category-breakdown', authenticateToken, getCategoryBreakdown);
router.get('/dashboard/top-products', authenticateToken, getTopSellingProducts);

router.get('/:id', authenticateToken, getSaleById);
router.post('/:id/cancel', authenticateToken, cancelSale);

export default router;
