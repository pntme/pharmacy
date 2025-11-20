import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface SalesOrderItemAttributes {
  order_item_id: number;
  order_number: string;
  product_id: number;
  batch_number?: string;
  quantity: number;
  unit_price: number;
  discount_percent?: number;
  discount_amount?: number;
  gst_rate?: number;
  gst_amount?: number;
  total_price: number;
  created_at?: Date;
  updated_at?: Date;
}

interface SalesOrderItemCreationAttributes extends Optional<SalesOrderItemAttributes, 'order_item_id' | 'created_at' | 'updated_at'> {}

class SalesOrderItem extends Model<SalesOrderItemAttributes, SalesOrderItemCreationAttributes> implements SalesOrderItemAttributes {
  public order_item_id!: number;
  public order_number!: string;
  public product_id!: number;
  public batch_number?: string;
  public quantity!: number;
  public unit_price!: number;
  public discount_percent?: number;
  public discount_amount?: number;
  public gst_rate?: number;
  public gst_amount?: number;
  public total_price!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

SalesOrderItem.init(
  {
    order_item_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    order_number: {
      type: DataTypes.STRING(100),
      allowNull: false,
      references: {
        model: 'sales_orders',
        key: 'order_number',
      },
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'products',
        key: 'product_id',
      },
    },
    batch_number: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    unit_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    discount_percent: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
    },
    discount_amount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    gst_rate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
    },
    gst_amount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    total_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'sales_order_items',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['order_number'] },
      { fields: ['product_id'] },
    ],
  }
);

export default SalesOrderItem;
