/**
 * Server entry point for Inventory Service
 */

const http = require('http');
const config = require('./config');
const logger = require('./config/logger');
const initApp = require('./app');

/**
 * Start server
 */
const startServer = async () => {
  try {
    const app = await initApp();
    const server = http.createServer(app);

    // Handle server errors
    server.on('error', (error) => {
      if (error.syscall !== 'listen') {
        throw error;
      }

      switch (error.code) {
        case 'EACCES':
          logger.error(`Port ${config.server.port} requires elevated privileges`);
          process.exit(1);
          break;
        case 'EADDRINUSE':
          logger.error(`Port ${config.server.port} is already in use`);
          process.exit(1);
          break;
        default:
          throw error;
      }
    });

    // Start listening
    server.listen(config.server.port, () => {
      logger.info(`Inventory Service running on port ${config.server.port}`);
    });

    // Handle graceful shutdown
    const gracefulShutdown = () => {
      logger.info('Received shutdown signal, closing server...');
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });

      // Force close after timeout
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    // Listen for termination signals
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

    return server;
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server if this file is run directly
if (require.main === module) {
  startServer();
}

module.exports = startServer;
