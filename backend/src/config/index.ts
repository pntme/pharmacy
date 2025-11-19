import dotenv from 'dotenv';
import path from 'path';
import { randomBytes } from 'crypto';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Parse Railway's DATABASE_URL if available
function parseDatabaseUrl(url?: string) {
  if (!url) return null;

  try {
    const parsed = new URL(url);
    return {
      host: parsed.hostname,
      port: parseInt(parsed.port || '5432', 10),
      name: parsed.pathname.slice(1), // Remove leading slash
      user: parsed.username,
      password: parsed.password,
    };
  } catch {
    return null;
  }
}

// Generate a random secret for JWT (demo purposes)
function generateSecret(): string {
  return randomBytes(32).toString('hex');
}

const databaseFromUrl = parseDatabaseUrl(process.env.DATABASE_URL);

// Warn if using default JWT secrets in production
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  console.warn('⚠️  WARNING: Using auto-generated JWT secret. Set JWT_SECRET environment variable for production!');
}

interface Config {
  env: string;
  port: number;
  apiVersion: string;
  database: {
    host: string;
    port: number;
    name: string;
    user: string;
    password: string;
    poolMax: number;
    poolMin: number;
  };
  jwt: {
    secret: string;
    expiry: string;
    refreshSecret: string;
    refreshExpiry: string;
  };
  cors: {
    origin: string;
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
  upload: {
    dir: string;
    maxSize: number;
  };
  logging: {
    level: string;
    dir: string;
  };
  email: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    password: string;
  };
  sms: {
    provider: string;
    apiKey: string;
    senderId: string;
  };
  business: {
    timezone: string;
    currency: string;
    gstEnabled: boolean;
    defaultGstRate: number;
  };
  inventory: {
    lowStockThreshold: number;
    expiryAlertDays: number;
  };
  compliance: {
    scheduleXRetentionYears: number;
    prescriptionRetentionYears: number;
  };
  security: {
    bcryptRounds: number;
    sessionTimeoutMinutes: number;
    passwordMinLength: number;
  };
}

const config: Config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  apiVersion: process.env.API_VERSION || 'v1',

  database: {
    // Use Railway's DATABASE_URL if available, otherwise use individual env vars
    host: databaseFromUrl?.host || process.env.DB_HOST || 'localhost',
    port: databaseFromUrl?.port || parseInt(process.env.DB_PORT || '5432', 10),
    name: databaseFromUrl?.name || process.env.DB_NAME || 'pharmacy_db',
    user: databaseFromUrl?.user || process.env.DB_USER || 'postgres',
    password: databaseFromUrl?.password || process.env.DB_PASSWORD || '',
    poolMax: parseInt(process.env.DB_POOL_MAX || '20', 10),
    poolMin: parseInt(process.env.DB_POOL_MIN || '5', 10),
  },

  jwt: {
    // Generate random secrets if not provided (for demo/testing)
    secret: process.env.JWT_SECRET || generateSecret(),
    expiry: process.env.JWT_EXPIRY || '24h',
    refreshSecret: process.env.JWT_REFRESH_SECRET || generateSecret(),
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  },

  cors: {
    // Allow all origins by default in production for easier demo deployment
    origin: process.env.CORS_ORIGIN || (process.env.NODE_ENV === 'production' ? '*' : 'http://localhost:3000'),
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },

  upload: {
    dir: process.env.UPLOAD_DIR || './uploads',
    maxSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10),
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info',
    dir: process.env.LOG_DIR || './logs',
  },

  email: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASSWORD || '',
  },

  sms: {
    provider: process.env.SMS_PROVIDER || 'msg91',
    apiKey: process.env.SMS_API_KEY || '',
    senderId: process.env.SMS_SENDER_ID || 'PHARMA',
  },

  business: {
    timezone: process.env.DEFAULT_TIMEZONE || 'Asia/Kolkata',
    currency: process.env.DEFAULT_CURRENCY || 'INR',
    gstEnabled: process.env.GST_ENABLED !== 'false',
    defaultGstRate: parseFloat(process.env.DEFAULT_GST_RATE || '12.00'),
  },

  inventory: {
    lowStockThreshold: parseInt(process.env.LOW_STOCK_THRESHOLD || '10', 10),
    expiryAlertDays: parseInt(process.env.EXPIRY_ALERT_DAYS || '90', 10),
  },

  compliance: {
    scheduleXRetentionYears: parseInt(process.env.SCHEDULE_X_RETENTION_YEARS || '10', 10),
    prescriptionRetentionYears: parseInt(process.env.PRESCRIPTION_RETENTION_YEARS || '2', 10),
  },

  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '10', 10),
    sessionTimeoutMinutes: parseInt(process.env.SESSION_TIMEOUT_MINUTES || '120', 10),
    passwordMinLength: parseInt(process.env.PASSWORD_MIN_LENGTH || '8', 10),
  },
};

export default config;
