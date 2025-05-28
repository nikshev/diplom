/**
 * API Gateway entry point
 */

const app = require('./app');
const config = require('./config');
const logger = require('./config/logger');

// Create HTTP server
const server = app.listen(config.server.port, () => {
  logger.info(`API Gateway running in ${config.server.env} mode on port ${config.server.port}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle SIGTERM
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
  });
});

module.exports = server;
