import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import bcrypt from 'bcryptjs';
import config from '../config';

interface UserAttributes {
  user_id: number;
  username: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  role_id: number;
  location_id?: number;
  pharmacist_registration_number?: string;
  license_number?: string;
  is_active: boolean;
  last_login_at?: Date;
  created_at?: Date;
  updated_at?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'user_id' | 'is_active' | 'created_at' | 'updated_at'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public user_id!: number;
  public username!: string;
  public password_hash!: string;
  public first_name!: string;
  public last_name!: string;
  public email!: string;
  public phone_number?: string;
  public role_id!: number;
  public location_id?: number;
  public pharmacist_registration_number?: string;
  public license_number?: string;
  public is_active!: boolean;
  public last_login_at?: Date;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Virtual field
  public get full_name(): string {
    return `${this.first_name} ${this.last_name}`;
  }

  // Instance methods
  public async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password_hash);
  }

  public static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, config.security.bcryptRounds);
  }

  // Remove password from JSON output
  public toJSON(): object {
    const values = { ...this.get() };
    delete values.password_hash;
    return values;
  }
}

User.init(
  {
    user_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    first_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    phone_number: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'roles',
        key: 'role_id',
      },
    },
    location_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'locations',
        key: 'location_id',
      },
    },
    pharmacist_registration_number: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    license_number: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    last_login_at: {
      type: DataTypes.DATE,
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
    tableName: 'users',
    timestamps: true,
    underscored: true,
  }
);

export default User;
