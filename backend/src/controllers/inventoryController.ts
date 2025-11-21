import { Request, Response } from 'express';
import { Op } from 'sequelize';
import Inventory from '../models/Inventory';
import Product from '../models/Product';
import logger from '../utils/logger';
import moment from 'moment';
import path from 'path';
import { deleteFile } from '../middleware/upload';

export const getAllInventory = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 50,
      location_id,
      product_id,
      status = 'available',
      expiring_soon,
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);
    const where: any = {};

    if (location_id) where.location_id = location_id;
    if (product_id) where.product_id = product_id;
    if (status) where.status = status;

    if (expiring_soon === 'true') {
      const daysAhead = 90; // Next 90 days
      where.expiry_date = {
        [Op.between]: [new Date(), moment().add(daysAhead, 'days').toDate()],
      };
    }

    const { count, rows: inventory } = await Inventory.findAndCountAll({
      where,
      include: [
        {
          model: Product,
          attributes: ['product_id', 'product_name', 'generic_name', 'item_code', 'schedule'],
        },
      ],
      order: [['expiry_date', 'ASC']],
      limit: Number(limit),
      offset,
    });

    res.json({
      success: true,
      data: {
        inventory,
        pagination: {
          total: count,
          page: Number(page),
          limit: Number(limit),
          total_pages: Math.ceil(count / Number(limit)),
        },
      },
    });
  } catch (error) {
    logger.error('Get inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getInventoryByProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { product_id } = req.params;
    const { location_id } = req.query;

    const where: any = { product_id, status: 'available' };
    if (location_id) where.location_id = location_id;

    const inventory = await Inventory.findAll({
      where,
      order: [['expiry_date', 'ASC']], // FEFO - First Expiry First Out
    });

    const totalQuantity = inventory.reduce((sum, inv) => sum + inv.quantity_on_hand, 0);
    const availableQuantity = inventory.reduce((sum, inv) => sum + inv.quantity_available, 0);

    res.json({
      success: true,
      data: {
        product_id,
        batches: inventory,
        summary: {
          total_batches: inventory.length,
          total_quantity: totalQuantity,
          available_quantity: availableQuantity,
          allocated_quantity: totalQuantity - availableQuantity,
        },
      },
    });
  } catch (error) {
    logger.error('Get inventory by product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const addInventory = async (req: Request, res: Response): Promise<void> => {
  try {
    const inventoryData = req.body;

    // Validate required fields
    if (!inventoryData.product_id || !inventoryData.location_id ||
        !inventoryData.batch_number || !inventoryData.expiry_date ||
        !inventoryData.quantity_on_hand || !inventoryData.cost_per_unit) {
      res.status(400).json({
        success: false,
        message: 'Required fields: product_id, location_id, batch_number, expiry_date, quantity_on_hand, cost_per_unit',
      });
      return;
    }

    // Check if batch already exists
    const existing = await Inventory.findOne({
      where: {
        product_id: inventoryData.product_id,
        location_id: inventoryData.location_id,
        batch_number: inventoryData.batch_number,
      },
    });

    if (existing) {
      res.status(400).json({
        success: false,
        message: 'Inventory batch already exists. Use update endpoint to modify quantity.',
      });
      return;
    }

    const inventory = await Inventory.create(inventoryData);

    logger.info(`Inventory added: Product ${inventoryData.product_id}, Batch ${inventoryData.batch_number}, Qty ${inventoryData.quantity_on_hand}`);

    res.status(201).json({
      success: true,
      message: 'Inventory added successfully',
      data: inventory,
    });
  } catch (error) {
    logger.error('Add inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const updateInventory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const inventory = await Inventory.findByPk(id);

    if (!inventory) {
      res.status(404).json({
        success: false,
        message: 'Inventory not found',
      });
      return;
    }

    await inventory.update(updateData);

    logger.info(`Inventory updated: ID ${id}`);

    res.json({
      success: true,
      message: 'Inventory updated successfully',
      data: inventory,
    });
  } catch (error) {
    logger.error('Update inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const adjustInventory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { quantity_adjustment, reason } = req.body;

    if (!quantity_adjustment || !reason) {
      res.status(400).json({
        success: false,
        message: 'quantity_adjustment and reason are required',
      });
      return;
    }

    const inventory = await Inventory.findByPk(id);

    if (!inventory) {
      res.status(404).json({
        success: false,
        message: 'Inventory not found',
      });
      return;
    }

    const newQuantity = inventory.quantity_on_hand + Number(quantity_adjustment);

    if (newQuantity < 0) {
      res.status(400).json({
        success: false,
        message: 'Resulting quantity cannot be negative',
      });
      return;
    }

    await inventory.update({
      quantity_on_hand: newQuantity,
      notes: `${inventory.notes || ''}\n${new Date().toISOString()}: Adjusted by ${quantity_adjustment}. Reason: ${reason}`,
    });

    logger.info(`Inventory adjusted: ID ${id}, Adjustment ${quantity_adjustment}, Reason: ${reason}`);

    res.json({
      success: true,
      message: 'Inventory adjusted successfully',
      data: inventory,
    });
  } catch (error) {
    logger.error('Adjust inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getExpiringInventory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { days = 90, location_id } = req.query;

    const where: any = {
      status: 'available',
      expiry_date: {
        [Op.between]: [new Date(), moment().add(Number(days), 'days').toDate()],
      },
    };

    if (location_id) where.location_id = location_id;

    const inventory = await Inventory.findAll({
      where,
      include: [
        {
          model: Product,
          attributes: ['product_id', 'product_name', 'generic_name', 'item_code', 'mrp'],
        },
      ],
      order: [['expiry_date', 'ASC']],
    });

    // Categorize by urgency
    const now = moment();
    const categorized = {
      expired: inventory.filter(inv => moment(inv.expiry_date).isBefore(now)),
      critical: inventory.filter(inv => {
        const daysToExpiry = moment(inv.expiry_date).diff(now, 'days');
        return daysToExpiry >= 0 && daysToExpiry <= 30;
      }),
      warning: inventory.filter(inv => {
        const daysToExpiry = moment(inv.expiry_date).diff(now, 'days');
        return daysToExpiry > 30 && daysToExpiry <= 90;
      }),
    };

    res.json({
      success: true,
      data: {
        summary: {
          expired: categorized.expired.length,
          critical: categorized.critical.length,
          warning: categorized.warning.length,
          total: inventory.length,
        },
        inventory: categorized,
      },
    });
  } catch (error) {
    logger.error('Get expiring inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getStockSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const { location_id } = req.query;

    const where: any = { status: 'available' };
    if (location_id) where.location_id = location_id;

    const inventory = await Inventory.findAll({
      where,
      include: [
        {
          model: Product,
          attributes: ['product_id', 'product_name', 'reorder_level'],
        },
      ],
    });

    // Calculate stock value
    const totalValue = inventory.reduce((sum, inv) =>
      sum + (inv.quantity_on_hand * Number(inv.cost_per_unit)), 0
    );

    // Count low stock items
    const lowStockItems = inventory.filter(inv => {
      const product = inv.get('Product') as any;
      return product && inv.quantity_available <= product.reorder_level;
    });

    res.json({
      success: true,
      data: {
        total_items: inventory.length,
        total_stock_value: totalValue.toFixed(2),
        low_stock_count: lowStockItems.length,
        low_stock_items: lowStockItems,
      },
    });
  } catch (error) {
    logger.error('Get stock summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const uploadInvoice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
      return;
    }

    const inventory = await Inventory.findByPk(id);

    if (!inventory) {
      // Delete uploaded file if inventory not found
      if (req.file) {
        deleteFile(req.file.path);
      }
      res.status(404).json({
        success: false,
        message: 'Inventory not found',
      });
      return;
    }

    // Delete old invoice if exists
    if (inventory.invoice_url) {
      const oldFilePath = path.join(__dirname, '../../', inventory.invoice_url);
      deleteFile(oldFilePath);
    }

    // Update inventory with new invoice URL
    const invoiceUrl = `/uploads/invoices/${req.file.filename}`;
    await inventory.update({ invoice_url: invoiceUrl });

    logger.info(`Invoice uploaded for inventory ID ${id}: ${invoiceUrl}`);

    res.json({
      success: true,
      message: 'Invoice uploaded successfully',
      data: {
        inventory_id: inventory.inventory_id,
        invoice_url: invoiceUrl,
      },
    });
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file) {
      deleteFile(req.file.path);
    }
    logger.error('Upload invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const deleteInvoice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const inventory = await Inventory.findByPk(id);

    if (!inventory) {
      res.status(404).json({
        success: false,
        message: 'Inventory not found',
      });
      return;
    }

    if (!inventory.invoice_url) {
      res.status(400).json({
        success: false,
        message: 'No invoice attached to this inventory',
      });
      return;
    }

    // Delete file from filesystem
    const filePath = path.join(__dirname, '../../', inventory.invoice_url);
    deleteFile(filePath);

    // Update inventory to remove invoice URL
    await inventory.update({ invoice_url: null });

    logger.info(`Invoice deleted for inventory ID ${id}`);

    res.json({
      success: true,
      message: 'Invoice deleted successfully',
    });
  } catch (error) {
    logger.error('Delete invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
