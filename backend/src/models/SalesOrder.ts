import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface SalesOrderAttributes {
  order_id: number;
  order_number: string;
  order_type: string;
  customer_type?: string;
  patient_id?: number;
  location_id: number;
  order_date: Date;
  status: string;
  payment_status: string;
  subtotal: number;
  discount_amount?: number;
  discount_percentage?: number;
  cgst_amount?: number;
  sgst_amount?: number;
  igst_amount?: number;
  round_off?: number;
  total_amount: number;
  amount_paid?: number;
  balance_due?: number;
  delivery_method?: string;
  delivery_charges?: number;
  prescription_id?: number;
  created_by_user_id?: number;
  billed_by_user_id?: number;
  billed_at?: Date;
  notes?: string;
  created_at?: Date;
  updated_at?: Date;
}

interface SalesOrderCreationAttributes extends Optional<SalesOrderAttributes, 'order_id' | 'status' | 'payment_status' | 'created_at' | 'updated_at'> {}

class SalesOrder extends Model<SalesOrderAttributes, SalesOrderCreationAttributes> implements SalesOrderAttributes {
  public order_id!: number;
  public order_number!: string;
  public order_type!: string;
  public customer_type?: string;
  public patient_id?: number;
  public location_id!: number;
  public order_date!: Date;
  public status!: string;
  public payment_status!: string;
  public subtotal!: number;
  public discount_amount?: number;
  public discount_percentage?: number;
  public cgst_amount?: number;
  public sgst_amount?: number;
  public igst_amount?: number;
  public round_off?: number;
  public total_amount!: number;
  public amount_paid?: number;
  public balance_due?: number;
  public delivery_method?: string;
  public delivery_charges?: number;
  public prescription_id?: number;
  public created_by_user_id?: number;
  public billed_by_user_id?: number;
  public billed_at?: Date;
  public notes?: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

SalesOrder.init(
  {
    order_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    order_number: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    order_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        isIn: [['retail', 'wholesale', 'online', 'prescription']],
      },
    },
    customer_type: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        isIn: [['patient', 'business']],
      },
    },
    patient_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'patients',
        key: 'patient_id',
      },
    },
    location_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'locations',
        key: 'location_id',
      },
    },
    order_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    status: {
      type: DataTypes.STRING(50),
      defaultValue: 'draft',
      validate: {
        isIn: [['draft', 'pending', 'processing', 'ready', 'completed', 'cancelled', 'returned']],
      },
    },
    payment_status: {
      type: DataTypes.STRING(50),
      defaultValue: 'unpaid',
      validate: {
        isIn: [['unpaid', 'partial', 'paid', 'refunded']],
      },
    },
    subtotal: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    discount_amount: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
    },
    discount_percentage: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
    },
    cgst_amount: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
    },
    sgst_amount: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
    },
    igst_amount: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
    },
    round_off: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    total_amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    amount_paid: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
    },
    balance_due: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
    },
    delivery_method: {
      type: DataTypes.STRING(50),
      allowNull: true,
      validate: {
        isIn: [['pickup', 'delivery', 'shipping', 'courier']],
      },
    },
    delivery_charges: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    prescription_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    created_by_user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'user_id',
      },
    },
    billed_by_user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'user_id',
      },
    },
    billed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    tableName: 'sales_orders',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['order_number'] },
      { fields: ['patient_id'] },
      { fields: ['order_date'] },
      { fields: ['status'] },
    ],
  }
);

export default SalesOrder;
