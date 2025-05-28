/**
 * CRM Service Entry Point
 */

require('dotenv').config();
const { models } = require('./models');
const app = require('./app');
const config = require('./config');
const logger = require('./config/logger');
const db = require('./models');

// Initialize database and start server
async function start() {
  try {
    // Initialize database
    const models = await db.init();
    logger.info('Database initialized');

    // Initialize services
    const CustomerService = require('./services/customer.service');
    const ContactService = require('./services/contact.service');
    const InteractionService = require('./services/interaction.service');

    const customerService = new CustomerService(models);
    const contactService = new ContactService(models);
    const interactionService = new InteractionService(models);

    // Initialize controllers
    const CustomerController = require('./controllers/customer.controller');
    const ContactController = require('./controllers/contact.controller');
    const InteractionController = require('./controllers/interaction.controller');

    const customerController = new CustomerController(customerService);
    const contactController = new ContactController(contactService);
    const interactionController = new InteractionController(interactionService);

    // Initialize routes
    const routes = require('./routes')({
      customerController,
      contactController,
      interactionController,
    });

    // Apply routes to app
    app.use(routes);

    // Start server
    const PORT = config.server.port;
    app.listen(PORT, () => {
      logger.info(`CRM Service running on port ${PORT} in ${config.server.env} mode`);
    });
  } catch (error) {
    logger.error('Error starting CRM Service:', error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start the application
start();
