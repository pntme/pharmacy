import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import config from './config';
import { connectDatabase } from './config/database';
import routes from './routes';
import logger from './utils/logger';
import path from 'path';

// Initialize express app
const app: Application = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: config.cors.origin,
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiter to API routes
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (config.env === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(
    morgan('combined', {
      stream: {
        write: (message: string) => logger.info(message.trim()),
      },
    })
  );
}

// Serve static files (uploads, images, etc.)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API routes
app.use(`/api/${config.apiVersion}`, routes);

// Root route
app.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Pharmacy Management System API',
    version: '1.0.0',
    environment: config.env,
    apiDocs: `/api/${config.apiVersion}`,
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
  });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Global error handler:', err);

  res.status(500).json({
    success: false,
    message: config.env === 'development' ? err.message : 'Internal server error',
    ...(config.env === 'development' && { stack: err.stack }),
  });
});

// Start server
const startServer = async (): Promise<void> => {
  try {
    // Debug: Log environment and database config
    console.log('=== Starting Pharmacy Management System ===');
    console.log('Environment:', config.env);
    console.log('Port:', config.port);
    console.log('DATABASE_URL set:', !!process.env.DATABASE_URL);
    console.log('Database config:', {
      host: config.database.host,
      port: config.database.port,
      name: config.database.name,
      user: config.database.user,
      hasPassword: !!config.database.password,
    });

    // Connect to database
    console.log('Attempting to connect to database...');
    await connectDatabase();
    console.log('✅ Database connected successfully!');

    // Start listening
    app.listen(config.port, () => {
      logger.info(`
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   🏥 Pharmacy Management System API                    │
│                                                         │
│   Environment: ${config.env.padEnd(35)}    │
│   Port:        ${config.port.toString().padEnd(35)}    │
│   API Version: ${config.apiVersion.padEnd(35)}    │
│                                                         │
│   API URL:     http://localhost:${config.port}/api/${config.apiVersion.padEnd(12)}│
│   Health:      http://localhost:${config.port}/api/${config.apiVersion}/health  │
│                                                         │
│   Database:    PostgreSQL                              │
│   Host:        ${config.database.host.padEnd(35)}    │
│   Database:    ${config.database.name.padEnd(35)}    │
│                                                         │
└─────────────────────────────────────────────────────────┘
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server!');
    console.error('Error details:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

// Start the server
startServer();

export default app;
