import { Sequelize } from 'sequelize';
import config from './index';
import logger from '../utils/logger';

const sequelize = new Sequelize({
  host: config.database.host,
  port: config.database.port,
  database: config.database.name,
  username: config.database.user,
  password: config.database.password,
  dialect: 'postgres',
  logging: config.env === 'development' ? (msg) => logger.debug(msg) : false,
  pool: {
    max: config.database.poolMax,
    min: config.database.poolMin,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
  timezone: '+05:30', // India timezone
});

export const connectDatabase = async (): Promise<void> => {
  try {
    console.log('Testing database authentication...');
    await sequelize.authenticate();
    console.log('✅ Database authentication successful');
    logger.info('✅ Database connection established successfully');

    // Auto-create tables from Sequelize models
    // This will create tables if they don't exist, but won't drop existing data
    await sequelize.sync({ alter: false });
    logger.info('✅ Database tables synchronized');
    console.log('✅ Database tables created/verified');

    // Seed default roles
    // Dynamic import to avoid circular dependencies
    const { seedDefaultRoles } = await import('../utils/seed');
    await seedDefaultRoles();
  } catch (error) {
    console.error('❌ Database connection failed!');
    console.error('Connection details:', {
      host: config.database.host,
      port: config.database.port,
      database: config.database.name,
      user: config.database.user,
    });
    console.error('Error:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
    }
    logger.error('❌ Unable to connect to the database:', error);
    throw error; // Re-throw instead of process.exit to let server.ts handle it
  }
};

export default sequelize;
