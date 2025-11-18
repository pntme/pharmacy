import express from 'express';
import {
  getAllPatients,
  getPatientById,
  searchPatients,
  createPatient,
  updatePatient,
  deletePatient,
  getPatientByPhone,
} from '../controllers/patientController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.get('/', authenticateToken, getAllPatients);
router.get('/search', authenticateToken, searchPatients);
router.get('/phone/:phone', authenticateToken, getPatientByPhone);
router.get('/:id', authenticateToken, getPatientById);
router.post('/', authenticateToken, createPatient);
router.put('/:id', authenticateToken, updatePatient);
router.delete('/:id', authenticateToken, deletePatient);

export default router;
