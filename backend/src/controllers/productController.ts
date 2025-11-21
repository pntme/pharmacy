import { Request, Response } from 'express';
import { Op } from 'sequelize';
import Product from '../models/Product';
import logger from '../utils/logger';

export const getAllProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 50,
      search,
      schedule,
      is_active = 'true',
      sort_by = 'product_name',
      sort_order = 'ASC',
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    // Build where clause
    const where: any = {};

    if (is_active) {
      where.is_active = is_active === 'true';
    }

    if (schedule) {
      where.schedule = schedule;
    }

    if (search) {
      where[Op.or] = [
        { product_name: { [Op.iLike]: `%${search}%` } },
        { generic_name: { [Op.iLike]: `%${search}%` } },
        { item_code: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows: products } = await Product.findAndCountAll({
      where,
      order: [[sort_by as string, sort_order as string]],
      limit: Number(limit),
      offset,
    });

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          total: count,
          page: Number(page),
          limit: Number(limit),
          total_pages: Math.ceil(count / Number(limit)),
        },
      },
    });
  } catch (error) {
    logger.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
      });
      return;
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    logger.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const searchProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { q, limit = 20 } = req.query;

    if (!q) {
      res.status(400).json({
        success: false,
        message: 'Search query required',
      });
      return;
    }

    const products = await Product.findAll({
      where: {
        is_active: true,
        [Op.or]: [
          { product_name: { [Op.iLike]: `%${q}%` } },
          { generic_name: { [Op.iLike]: `%${q}%` } },
          { item_code: { [Op.iLike]: `%${q}%` } },
        ],
      },
      limit: Number(limit),
      order: [['product_name', 'ASC']],
    });

    res.json({
      success: true,
      data: {
        products,
      },
    });
  } catch (error) {
    logger.error('Search products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const productData = req.body;

    // Validate required fields
    if (!productData.item_code || !productData.product_name || !productData.mrp) {
      res.status(400).json({
        success: false,
        message: 'item_code, product_name, and mrp are required',
      });
      return;
    }

    // Check if item_code already exists
    const existing = await Product.findOne({
      where: { item_code: productData.item_code },
    });

    if (existing) {
      res.status(400).json({
        success: false,
        message: 'Product with this item_code already exists',
      });
      return;
    }

    // Calculate GST split if not provided
    if (!productData.cgst_rate && !productData.sgst_rate && productData.gst_rate) {
      productData.cgst_rate = productData.gst_rate / 2;
      productData.sgst_rate = productData.gst_rate / 2;
      productData.igst_rate = productData.gst_rate;
    }

    const product = await Product.create(productData);

    logger.info(`Product created: ${product.item_code} - ${product.product_name}`);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product,
    });
  } catch (error) {
    logger.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const product = await Product.findByPk(id);

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
      });
      return;
    }

    // If item_code is being updated, check uniqueness
    if (updateData.item_code && updateData.item_code !== product.item_code) {
      const existing = await Product.findOne({
        where: { item_code: updateData.item_code },
      });

      if (existing) {
        res.status(400).json({
          success: false,
          message: 'Product with this item_code already exists',
        });
        return;
      }
    }

    await product.update(updateData);

    logger.info(`Product updated: ${product.item_code}`);

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error) {
    logger.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
      });
      return;
    }

    // Soft delete by setting is_active to false
    await product.update({ is_active: false });

    logger.info(`Product deleted: ${product.item_code}`);

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    logger.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getProductsBySchedule = async (req: Request, res: Response): Promise<void> => {
  try {
    const { schedule } = req.params;

    const products = await Product.findAll({
      where: {
        schedule,
        is_active: true,
      },
      order: [['product_name', 'ASC']],
    });

    res.json({
      success: true,
      data: {
        schedule,
        count: products.length,
        products,
      },
    });
  } catch (error) {
    logger.error('Get products by schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getLowStockProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    // This would require joining with inventory table
    // For now, return products where reorder_level > 0
    const products = await Product.findAll({
      where: {
        is_active: true,
        reorder_level: {
          [Op.gt]: 0,
        },
      },
      order: [['reorder_level', 'DESC']],
    });

    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    logger.error('Get low stock products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
