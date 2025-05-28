/**
 * Auth Service entry point
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { StatusCodes } = require('http-status-codes');

const config = require('./config');
const logger = require('./config/logger');
const routes = require('./routes');
const errorHandler = require('./middlewares/error-handler');
const db = require('./models');
const seedService = require('./services/seed.service');

// Create Express app
const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Request parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan(config.logging.format, { stream: logger.stream }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(StatusCodes.OK).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    environment: config.server.env,
  });
});

// API routes
app.use('/api', routes);

// 404 handler
app.use((req, res) => {
  res.status(StatusCodes.NOT_FOUND).json({
    status: 'error',
    statusCode: StatusCodes.NOT_FOUND,
    message: 'Resource not found',
  });
});

// Error handler
app.use(errorHandler);

// Initialize database and start server
const startServer = async () => {
  try {
    // Test database connection
    await db.sequelize.authenticate();
    logger.info('Database connection established successfully');
    
    // Seed default data
    await seedService.seedData();
    
    // Start server
    const PORT = config.server.port;
    app.listen(PORT, () => {
      logger.info(`Auth Service running in ${config.server.env} mode on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Unable to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

// Start server
startServer();

module.exports = app;
