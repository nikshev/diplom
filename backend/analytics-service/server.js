/**
 * Server entry point for Analytics Service
 */

const initApp = require('./app');
const config = require('./config');
const logger = require('./config/logger');
const db = require('./models');

// Initialize Express application
const app = initApp();

/**
 * Start server
 */
async function startServer() {
  try {
    // Sync database models
    await db.sequelize.sync({ alter: config.database.alter });
    logger.info('Database synchronized');

    // Start server
    const server = app.listen(config.server.port, () => {
      logger.info(`Server started on port ${config.server.port}`);
      logger.info(`Environment: ${config.server.env}`);
      logger.info(`API documentation available at http://localhost:${config.server.port}/api-docs`);
    });

    // Handle shutdown gracefully
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down gracefully');
      server.close(() => {
        logger.info('Server closed');
        db.sequelize.close().then(() => {
          logger.info('Database connection closed');
          process.exit(0);
        });
      });
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT received, shutting down gracefully');
      server.close(() => {
        logger.info('Server closed');
        db.sequelize.close().then(() => {
          logger.info('Database connection closed');
          process.exit(0);
        });
      });
    });

    return server;
  } catch (error) {
    logger.error('Failed to start server', { error: error.message, stack: error.stack });
    process.exit(1);
  }
}

// Start server if this file is run directly
if (require.main === module) {
  startServer();
}

module.exports = { startServer };
