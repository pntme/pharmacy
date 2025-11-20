import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface ProductAttributes {
  product_id: number;
  item_code: string;
  product_name: string;
  generic_name?: string;
  brand_name?: string;
  manufacturer_id?: number;
  strength?: string;
  dosage_form?: string;
  pack_size?: string;
  unit_of_measure?: string;
  therapeutic_class?: string;
  schedule?: string;
  hsn_code?: string;
  mrp: number;
  purchase_rate?: number;
  selling_price?: number;
  discount_percentage?: number;
  gst_rate?: number;
  cgst_rate?: number;
  sgst_rate?: number;
  igst_rate?: number;
  storage_requirements?: string;
  is_refrigerated?: boolean;
  is_controlled_substance?: boolean;
  is_hazardous?: boolean;
  requires_prescription?: boolean;
  reorder_level?: number;
  reorder_quantity?: number;
  barcode?: string;
  image_url?: string;
  description?: string;
  is_active?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

interface ProductCreationAttributes extends Optional<ProductAttributes, 'product_id' | 'is_active' | 'created_at' | 'updated_at'> {}

class Product extends Model<ProductAttributes, ProductCreationAttributes> implements ProductAttributes {
  public product_id!: number;
  public item_code!: string;
  public product_name!: string;
  public generic_name?: string;
  public brand_name?: string;
  public manufacturer_id?: number;
  public strength?: string;
  public dosage_form?: string;
  public pack_size?: string;
  public unit_of_measure?: string;
  public therapeutic_class?: string;
  public schedule?: string;
  public hsn_code?: string;
  public mrp!: number;
  public purchase_rate?: number;
  public selling_price?: number;
  public discount_percentage?: number;
  public gst_rate?: number;
  public cgst_rate?: number;
  public sgst_rate?: number;
  public igst_rate?: number;
  public storage_requirements?: string;
  public is_refrigerated?: boolean;
  public is_controlled_substance?: boolean;
  public is_hazardous?: boolean;
  public requires_prescription?: boolean;
  public reorder_level?: number;
  public reorder_quantity?: number;
  public barcode?: string;
  public image_url?: string;
  public description?: string;
  public is_active?: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Product.init(
  {
    product_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    item_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    product_name: {
      type: DataTypes.STRING(300),
      allowNull: false,
    },
    generic_name: {
      type: DataTypes.STRING(300),
      allowNull: true,
    },
    brand_name: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    manufacturer_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      // Foreign key to manufacturers table - will be added when Manufacturer model is implemented
    },
    strength: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    dosage_form: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    pack_size: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    unit_of_measure: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    therapeutic_class: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    schedule: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        isIn: [['H', 'H1', 'X', 'G', 'J', 'OTC']],
      },
    },
    hsn_code: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    mrp: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    purchase_rate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    selling_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    discount_percentage: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
    },
    gst_rate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 12.00,
    },
    cgst_rate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    sgst_rate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    igst_rate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    storage_requirements: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    is_refrigerated: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_controlled_substance: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_hazardous: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    requires_prescription: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    reorder_level: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    reorder_quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    barcode: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    image_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
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
    tableName: 'products',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['item_code'] },
      { fields: ['product_name'] },
      { fields: ['generic_name'] },
      { fields: ['schedule'] },
    ],
  }
);

export default Product;
