/**
 * CRM Service Server
 */

const http = require('http');
const app = require('./app');
const config = require('./config');
const logger = require('./config/logger');
const db = require('./models');

// Create HTTP server
const server = http.createServer(app);

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle graceful shutdown
const gracefulShutdown = () => {
  logger.info('Shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

// Listen for termination signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server
const startServer = async () => {
  try {
    // Sync database
    if (config.server.env !== 'production') {
      await db.sequelize.sync({ alter: true });
      logger.info('Database synchronized');
    }

    // Start server
    server.listen(config.server.port, () => {
      logger.info(`CRM Service running on port ${config.server.port} in ${config.server.env} mode`);
    });
  } catch (error) {
    logger.error('Error starting server:', error);
    process.exit(1);
  }
};

// Start server
startServer();
