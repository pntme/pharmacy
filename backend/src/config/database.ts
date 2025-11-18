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
    await sequelize.authenticate();
    logger.info('✅ Database connection established successfully');

    if (config.env === 'development') {
      // Sync models in development (be careful in production!)
      // await sequelize.sync({ alter: true });
      // logger.info('✅ Database models synchronized');
    }
  } catch (error) {
    logger.error('❌ Unable to connect to the database:', error);
    process.exit(1);
  }
};

export default sequelize;
