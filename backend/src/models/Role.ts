import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface RoleAttributes {
  role_id: number;
  role_name: string;
  role_description?: string;
  permissions?: object;
  created_at?: Date;
}

interface RoleCreationAttributes extends Optional<RoleAttributes, 'role_id' | 'created_at'> {}

class Role extends Model<RoleAttributes, RoleCreationAttributes> implements RoleAttributes {
  public role_id!: number;
  public role_name!: string;
  public role_description?: string;
  public permissions?: object;
  public readonly created_at!: Date;
}

Role.init(
  {
    role_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    role_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    role_description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    permissions: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'roles',
    timestamps: false,
  }
);

export default Role;
