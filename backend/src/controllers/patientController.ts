import { Request, Response } from 'express';
import { Op } from 'sequelize';
import Patient from '../models/Patient';
import logger from '../utils/logger';

export const getAllPatients = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 50,
      search,
      is_active = 'true',
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);
    const where: any = {};

    if (is_active) where.is_active = is_active === 'true';

    if (search) {
      where[Op.or] = [
        { first_name: { [Op.iLike]: `%${search}%` } },
        { last_name: { [Op.iLike]: `%${search}%` } },
        { patient_code: { [Op.iLike]: `%${search}%` } },
        { phone_number: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows: patients } = await Patient.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit: Number(limit),
      offset,
    });

    res.json({
      success: true,
      data: {
        patients,
        pagination: {
          total: count,
          page: Number(page),
          limit: Number(limit),
          total_pages: Math.ceil(count / Number(limit)),
        },
      },
    });
  } catch (error) {
    logger.error('Get patients error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getPatientById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const patient = await Patient.findByPk(id);

    if (!patient) {
      res.status(404).json({
        success: false,
        message: 'Patient not found',
      });
      return;
    }

    res.json({
      success: true,
      data: patient,
    });
  } catch (error) {
    logger.error('Get patient error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const searchPatients = async (req: Request, res: Response): Promise<void> => {
  try {
    const { q, limit = 20 } = req.query;

    if (!q) {
      res.status(400).json({
        success: false,
        message: 'Search query required',
      });
      return;
    }

    const patients = await Patient.findAll({
      where: {
        is_active: true,
        [Op.or]: [
          { first_name: { [Op.iLike]: `%${q}%` } },
          { last_name: { [Op.iLike]: `%${q}%` } },
          { patient_code: { [Op.iLike]: `%${q}%` } },
          { phone_number: { [Op.iLike]: `%${q}%` } },
        ],
      },
      limit: Number(limit),
      order: [['first_name', 'ASC']],
    });

    res.json({
      success: true,
      data: patients,
    });
  } catch (error) {
    logger.error('Search patients error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const createPatient = async (req: Request, res: Response): Promise<void> => {
  try {
    const patientData = req.body;

    // Validate required fields
    if (!patientData.patient_code || !patientData.first_name ||
        !patientData.last_name || !patientData.phone_number) {
      res.status(400).json({
        success: false,
        message: 'patient_code, first_name, last_name, and phone_number are required',
      });
      return;
    }

    // Check if patient_code already exists
    const existing = await Patient.findOne({
      where: { patient_code: patientData.patient_code },
    });

    if (existing) {
      res.status(400).json({
        success: false,
        message: 'Patient with this code already exists',
      });
      return;
    }

    // Check if phone number already exists
    const existingPhone = await Patient.findOne({
      where: { phone_number: patientData.phone_number },
    });

    if (existingPhone) {
      res.status(400).json({
        success: false,
        message: 'Patient with this phone number already exists',
        data: { existing_patient: existingPhone },
      });
      return;
    }

    const patient = await Patient.create(patientData);

    logger.info(`Patient created: ${patient.patient_code} - ${patient.full_name}`);

    res.status(201).json({
      success: true,
      message: 'Patient created successfully',
      data: patient,
    });
  } catch (error) {
    logger.error('Create patient error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const updatePatient = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const patient = await Patient.findByPk(id);

    if (!patient) {
      res.status(404).json({
        success: false,
        message: 'Patient not found',
      });
      return;
    }

    await patient.update(updateData);

    logger.info(`Patient updated: ${patient.patient_code}`);

    res.json({
      success: true,
      message: 'Patient updated successfully',
      data: patient,
    });
  } catch (error) {
    logger.error('Update patient error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const deletePatient = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const patient = await Patient.findByPk(id);

    if (!patient) {
      res.status(404).json({
        success: false,
        message: 'Patient not found',
      });
      return;
    }

    // Soft delete
    await patient.update({ is_active: false });

    logger.info(`Patient deleted: ${patient.patient_code}`);

    res.json({
      success: true,
      message: 'Patient deleted successfully',
    });
  } catch (error) {
    logger.error('Delete patient error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getPatientByPhone = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone } = req.params;

    const patient = await Patient.findOne({
      where: { phone_number: phone, is_active: true },
    });

    if (!patient) {
      res.status(404).json({
        success: false,
        message: 'Patient not found',
      });
      return;
    }

    res.json({
      success: true,
      data: patient,
    });
  } catch (error) {
    logger.error('Get patient by phone error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
