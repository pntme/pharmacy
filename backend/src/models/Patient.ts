import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface PatientAttributes {
  patient_id: number;
  patient_code: string;
  first_name: string;
  last_name: string;
  date_of_birth?: Date;
  gender?: string;
  phone_number: string;
  alternate_phone?: string;
  email?: string;
  address_id?: number;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relation?: string;
  blood_group?: string;
  allergies?: object;
  chronic_conditions?: object;
  preferred_language?: string;
  communication_preference?: string;
  preferred_location_id?: number;
  insurance_provider?: string;
  insurance_number?: string;
  loyalty_points?: number;
  total_purchases?: number;
  consent_for_communication?: boolean;
  consent_date?: Date;
  is_active?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

interface PatientCreationAttributes extends Optional<PatientAttributes, 'patient_id' | 'is_active' | 'created_at' | 'updated_at'> {}

class Patient extends Model<PatientAttributes, PatientCreationAttributes> implements PatientAttributes {
  public patient_id!: number;
  public patient_code!: string;
  public first_name!: string;
  public last_name!: string;
  public date_of_birth?: Date;
  public gender?: string;
  public phone_number!: string;
  public alternate_phone?: string;
  public email?: string;
  public address_id?: number;
  public emergency_contact_name?: string;
  public emergency_contact_phone?: string;
  public emergency_contact_relation?: string;
  public blood_group?: string;
  public allergies?: object;
  public chronic_conditions?: object;
  public preferred_language?: string;
  public communication_preference?: string;
  public preferred_location_id?: number;
  public insurance_provider?: string;
  public insurance_number?: string;
  public loyalty_points?: number;
  public total_purchases?: number;
  public consent_for_communication?: boolean;
  public consent_date?: Date;
  public is_active?: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  public get full_name(): string {
    return `${this.first_name} ${this.last_name}`;
  }
}

Patient.init(
  {
    patient_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    patient_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    first_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    date_of_birth: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    gender: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        isIn: [['Male', 'Female', 'Other']],
      },
    },
    phone_number: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    alternate_phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },
    address_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    emergency_contact_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    emergency_contact_phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    emergency_contact_relation: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    blood_group: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    allergies: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    chronic_conditions: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    preferred_language: {
      type: DataTypes.STRING(50),
      defaultValue: 'English',
    },
    communication_preference: {
      type: DataTypes.STRING(50),
      allowNull: true,
      validate: {
        isIn: [['SMS', 'Email', 'WhatsApp', 'Call']],
      },
    },
    preferred_location_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    insurance_provider: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    insurance_number: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    loyalty_points: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    total_purchases: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
    },
    consent_for_communication: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    consent_date: {
      type: DataTypes.DATE,
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
    tableName: 'patients',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['patient_code'] },
      { fields: ['phone_number'] },
      { fields: ['first_name', 'last_name'] },
    ],
  }
);

export default Patient;
