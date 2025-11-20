import { Request, Response } from 'express';
import { Op, QueryTypes } from 'sequelize';
import SalesOrder from '../models/SalesOrder';
import Product from '../models/Product';
import Patient from '../models/Patient';
import Inventory from '../models/Inventory';
import sequelize from '../config/database';
import logger from '../utils/logger';
import { generateInvoiceNumber, calculateLineItemGST } from '../utils/gst';

interface SaleItem {
  product_id: number;
  quantity: number;
  unit_price: number;
  discount_percentage?: number;
  batch_number?: string;
}

export const createSale = async (req: Request, res: Response): Promise<void> => {
  const transaction = await sequelize.transaction();

  try {
    const {
      patient_id,
      location_id,
      items,
      payment_method,
      discount_percentage,
      delivery_method,
      notes,
    } = req.body;

    // Validate required fields
    if (!location_id || !items || !Array.isArray(items) || items.length === 0) {
      await transaction.rollback();
      res.status(400).json({
        success: false,
        message: 'location_id and items array are required',
      });
      return;
    }

    // Generate order number
    const order_number = generateInvoiceNumber('SO');

    // Calculate totals
    let subtotal = 0;
    let total_cgst = 0;
    let total_sgst = 0;
    let total_discount = 0;

    const processedItems: any[] = [];

    for (const item of items) {
      // Get product details
      const product = await Product.findByPk(item.product_id);
      if (!product) {
        await transaction.rollback();
        res.status(404).json({
          success: false,
          message: `Product ${item.product_id} not found`,
        });
        return;
      }

      // Check inventory availability (FEFO)
      const inventory = await Inventory.findAll({
        where: {
          product_id: item.product_id,
          location_id,
          status: 'available',
        },
        order: [['expiry_date', 'ASC']], // First Expiry First Out
        transaction,
      });

      const availableQty = inventory.reduce((sum, inv) => sum + inv.quantity_available, 0);

      if (availableQty < item.quantity) {
        await transaction.rollback();
        res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.product_name}. Available: ${availableQty}, Required: ${item.quantity}`,
        });
        return;
      }

      // Calculate line item GST
      const gstCalc = calculateLineItemGST({
        quantity: item.quantity,
        unit_price: item.unit_price || product.mrp,
        discount_percentage: item.discount_percentage || 0,
        gst_rate: product.gst_rate || 12,
      }, false); // false = intra-state

      subtotal += item.quantity * (item.unit_price || product.mrp);
      total_discount += gstCalc.discount_amount;
      total_cgst += gstCalc.cgst_amount;
      total_sgst += gstCalc.sgst_amount;

      processedItems.push({
        ...item,
        product_name: product.product_name,
        unit_price: item.unit_price || product.mrp,
        gst_rate: product.gst_rate,
        ...gstCalc,
      });

      // Deduct from inventory (FEFO)
      let remainingQty = item.quantity;
      for (const inv of inventory) {
        if (remainingQty <= 0) break;

        const qtyToDeduct = Math.min(remainingQty, inv.quantity_available);

        await inv.update({
          quantity_on_hand: inv.quantity_on_hand - qtyToDeduct,
        }, { transaction });

        remainingQty -= qtyToDeduct;

        logger.info(`Deducted ${qtyToDeduct} from inventory ID ${inv.inventory_id}, batch ${inv.batch_number}`);
      }
    }

    // Apply additional discount if provided
    if (discount_percentage) {
      const additionalDiscount = subtotal * (discount_percentage / 100);
      total_discount += additionalDiscount;
    }

    const taxable_amount = subtotal - total_discount;
    const total_gst = total_cgst + total_sgst;
    const total_amount = taxable_amount + total_gst;
    const final_amount = Math.round(total_amount);
    const round_off = final_amount - total_amount;

    // Create sales order
    const salesOrder = await SalesOrder.create({
      order_number,
      order_type: patient_id ? 'prescription' : 'retail',
      customer_type: patient_id ? 'patient' : undefined,
      patient_id,
      location_id,
      order_date: new Date(),
      status: 'completed',
      payment_status: 'paid',
      subtotal,
      discount_amount: total_discount,
      discount_percentage: discount_percentage || 0,
      cgst_amount: total_cgst,
      sgst_amount: total_sgst,
      igst_amount: 0,
      round_off,
      total_amount: final_amount,
      amount_paid: final_amount,
      balance_due: 0,
      delivery_method,
      created_by_user_id: req.user?.user_id,
      billed_by_user_id: req.user?.user_id,
      billed_at: new Date(),
      notes,
    }, { transaction });

    // Update patient total purchases if patient_id provided
    if (patient_id) {
      await Patient.increment(
        { total_purchases: final_amount },
        { where: { patient_id }, transaction }
      );
    }

    await transaction.commit();

    logger.info(`Sale created: ${order_number}, Total: ₹${final_amount}`);

    res.status(201).json({
      success: true,
      message: 'Sale created successfully',
      data: {
        sale: salesOrder,
        items: processedItems,
      },
    });
  } catch (error) {
    await transaction.rollback();
    logger.error('Create sale error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getAllSales = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 50,
      from_date,
      to_date,
      location_id,
      patient_id,
      status,
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);
    const where: any = {};

    if (location_id) where.location_id = location_id;
    if (patient_id) where.patient_id = patient_id;
    if (status) where.status = status;

    if (from_date && to_date) {
      where.order_date = {
        [Op.between]: [new Date(from_date as string), new Date(to_date as string)],
      };
    }

    const { count, rows: sales } = await SalesOrder.findAndCountAll({
      where,
      include: [
        {
          model: Patient,
          attributes: ['patient_id', 'patient_code', 'first_name', 'last_name', 'phone_number'],
        },
      ],
      order: [['order_date', 'DESC']],
      limit: Number(limit),
      offset,
    });

    res.json({
      success: true,
      data: {
        sales,
        pagination: {
          total: count,
          page: Number(page),
          limit: Number(limit),
          total_pages: Math.ceil(count / Number(limit)),
        },
      },
    });
  } catch (error) {
    logger.error('Get sales error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getSaleById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const sale = await SalesOrder.findByPk(id, {
      include: [
        {
          model: Patient,
          attributes: ['patient_id', 'patient_code', 'first_name', 'last_name', 'phone_number'],
        },
      ],
    });

    if (!sale) {
      res.status(404).json({
        success: false,
        message: 'Sale not found',
      });
      return;
    }

    res.json({
      success: true,
      data: sale,
    });
  } catch (error) {
    logger.error('Get sale error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getDailySalesReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { date, location_id } = req.query;

    const targetDate = date ? new Date(date as string) : new Date();
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const where: any = {
      order_date: {
        [Op.between]: [startOfDay, endOfDay],
      },
      status: { [Op.in]: ['completed', 'ready'] },
    };

    if (location_id) where.location_id = location_id;

    const sales = await SalesOrder.findAll({ where });

    const summary = {
      total_orders: sales.length,
      total_sales: sales.reduce((sum, sale) => sum + Number(sale.total_amount), 0),
      total_gst: sales.reduce((sum, sale) =>
        sum + Number(sale.cgst_amount) + Number(sale.sgst_amount) + Number(sale.igst_amount), 0
      ),
      total_discount: sales.reduce((sum, sale) => sum + Number(sale.discount_amount), 0),
      cash_sales: sales.filter(s => s.delivery_method === 'pickup').length,
      delivery_sales: sales.filter(s => s.delivery_method === 'delivery').length,
    };

    res.json({
      success: true,
      data: {
        date: targetDate.toISOString().split('T')[0],
        summary,
        sales,
      },
    });
  } catch (error) {
    logger.error('Get daily sales report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const cancelSale = async (req: Request, res: Response): Promise<void> => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { reason } = req.body;

    const sale = await SalesOrder.findByPk(id, { transaction });

    if (!sale) {
      await transaction.rollback();
      res.status(404).json({
        success: false,
        message: 'Sale not found',
      });
      return;
    }

    if (sale.status === 'cancelled') {
      await transaction.rollback();
      res.status(400).json({
        success: false,
        message: 'Sale already cancelled',
      });
      return;
    }

    // Update sale status
    await sale.update({
      status: 'cancelled',
      payment_status: 'refunded',
      notes: `${sale.notes || ''}\nCancelled: ${reason}`,
    }, { transaction });

    // TODO: Restore inventory quantities

    await transaction.commit();

    logger.info(`Sale cancelled: ${sale.order_number}`);

    res.json({
      success: true,
      message: 'Sale cancelled successfully',
      data: sale,
    });
  } catch (error) {
    await transaction.rollback();
    logger.error('Cancel sale error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Dashboard API Endpoints

export const getWeeklySalesTrend = async (req: Request, res: Response): Promise<void> => {
  try {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6);

    const sales = await SalesOrder.findAll({
      where: {
        order_date: {
          [Op.between]: [sevenDaysAgo, today],
        },
        status: { [Op.in]: ['completed', 'ready'] },
      },
      attributes: ['order_date', 'total_amount'],
    });

    // Group by day
    const dailySales = new Map();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Initialize all days with 0
    for (let i = 0; i < 7; i++) {
      const date = new Date(sevenDaysAgo);
      date.setDate(date.getDate() + i);
      const dayName = dayNames[date.getDay()];
      dailySales.set(dayName, { day: dayName, sales: 0, orders: 0 });
    }

    // Aggregate sales by day
    sales.forEach(sale => {
      const date = new Date(sale.order_date);
      const dayName = dayNames[date.getDay()];
      const existing = dailySales.get(dayName);
      if (existing) {
        existing.sales += Number(sale.total_amount);
        existing.orders += 1;
      }
    });

    const result = Array.from(dailySales.values());

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Get weekly sales trend error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getCategoryBreakdown = async (req: Request, res: Response): Promise<void> => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await sequelize.query(`
      SELECT
        CASE
          WHEN p.schedule IN ('H', 'H1', 'X') THEN 'Prescription'
          WHEN p.schedule = 'OTC' AND p.dosage_form IN ('Tablet', 'Capsule', 'Syrup', 'Injection') THEN 'OTC'
          WHEN p.dosage_form = 'Powder' OR p.generic_name = 'Herbal' THEN 'Ayurvedic'
          ELSE 'Surgical'
        END as category,
        COUNT(DISTINCT soi.order_item_id) as count,
        SUM(soi.total_price) as total_value
      FROM sales_order_items soi
      JOIN sales_orders so ON soi.order_number = so.order_number
      JOIN products p ON soi.product_id = p.product_id
      WHERE so.order_date >= :thirtyDaysAgo
        AND so.status IN ('completed', 'ready')
      GROUP BY category
    `, {
      replacements: { thirtyDaysAgo },
      type: QueryTypes.SELECT,
    });

    const colors = {
      Prescription: '#953553',
      OTC: '#2196f3',
      Ayurvedic: '#4caf50',
      Surgical: '#ff9800',
    };

    const formatted = (result as any[]).map((row: any) => ({
      name: row.category,
      value: parseInt(row.count),
      color: colors[row.category as keyof typeof colors] || '#666',
    }));

    res.json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    logger.error('Get category breakdown error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getTopSellingProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await sequelize.query(`
      SELECT
        p.product_name as name,
        SUM(soi.quantity) as sales
      FROM sales_order_items soi
      JOIN sales_orders so ON soi.order_number = so.order_number
      JOIN products p ON soi.product_id = p.product_id
      WHERE so.order_date >= :thirtyDaysAgo
        AND so.status IN ('completed', 'ready')
      GROUP BY p.product_id, p.product_name
      ORDER BY sales DESC
      LIMIT 5
    `, {
      replacements: { thirtyDaysAgo },
      type: QueryTypes.SELECT,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Get top selling products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const endOfToday = new Date(today.setHours(23, 59, 59, 999));

    // Today's sales
    const todaySales = await SalesOrder.findAll({
      where: {
        order_date: {
          [Op.between]: [startOfToday, endOfToday],
        },
        status: { [Op.in]: ['completed', 'ready'] },
      },
    });

    const todayTotalSales = todaySales.reduce((sum, sale) => sum + Number(sale.total_amount), 0);
    const todayTotalOrders = todaySales.length;

    // Patients count
    const patientsCount = await Patient.count();

    res.json({
      success: true,
      data: {
        todaySales: todayTotalSales,
        totalOrders: todayTotalOrders,
        patients: patientsCount,
      },
    });
  } catch (error) {
    logger.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
