import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface InventoryAttributes {
  inventory_id: number;
  product_id: number;
  location_id?: number;
  batch_number: string;
  lot_number?: string;
  serial_number?: string;
  quantity_on_hand: number;
  quantity_allocated: number;
  manufacture_date?: Date;
  expiry_date: Date;
  received_date: Date;
  cost_per_unit: number;
  mrp?: number;
  bin_location?: string;
  rack_number?: string;
  shelf_number?: string;
  status: string;
  supplier_id?: number;
  last_counted_date?: Date;
  notes?: string;
  created_at?: Date;
  updated_at?: Date;
}

interface InventoryCreationAttributes extends Optional<InventoryAttributes, 'inventory_id' | 'quantity_allocated' | 'status' | 'created_at' | 'updated_at'> {}

class Inventory extends Model<InventoryAttributes, InventoryCreationAttributes> implements InventoryAttributes {
  public inventory_id!: number;
  public product_id!: number;
  public location_id?: number;
  public batch_number!: string;
  public lot_number?: string;
  public serial_number?: string;
  public quantity_on_hand!: number;
  public quantity_allocated!: number;
  public manufacture_date?: Date;
  public expiry_date!: Date;
  public received_date!: Date;
  public cost_per_unit!: number;
  public mrp?: number;
  public bin_location?: string;
  public rack_number?: string;
  public shelf_number?: string;
  public status!: string;
  public supplier_id?: number;
  public last_counted_date?: Date;
  public notes?: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Virtual field for available quantity
  public get quantity_available(): number {
    return this.quantity_on_hand - this.quantity_allocated;
  }
}

Inventory.init(
  {
    inventory_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'products',
        key: 'product_id',
      },
    },
    location_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      // Foreign key to locations table - will be added when Location model is implemented
    },
    batch_number: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    lot_number: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    serial_number: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    quantity_on_hand: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    quantity_allocated: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    manufacture_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    expiry_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    received_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    cost_per_unit: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    mrp: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    bin_location: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    rack_number: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    shelf_number: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(50),
      defaultValue: 'available',
      validate: {
        isIn: [['available', 'quarantine', 'expired', 'returned', 'disposed']],
      },
    },
    supplier_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      // Foreign key to suppliers table - will be added when Supplier model is implemented
    },
    last_counted_date: {
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
    tableName: 'inventory',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['product_id'] },
      { fields: ['location_id'] },
      { fields: ['batch_number'] },
      { fields: ['expiry_date'] },
      { fields: ['status'] },
    ],
  }
);

export default Inventory;
