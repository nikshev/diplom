/**
 * CRM Service Application
 */

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const { StatusCodes } = require('http-status-codes');

const config = require('./config');
const logger = require('./config/logger');
const db = require('./models');
const errorHandler = require('./middlewares/error-handler');
const { authenticate } = require('./middlewares/auth');

// Import services
const CustomerService = require('./services/customer.service');
const ContactService = require('./services/contact.service');
const InteractionService = require('./services/interaction.service');

// Import controllers
const CustomerController = require('./controllers/customer.controller');
const ContactController = require('./controllers/contact.controller');
const InteractionController = require('./controllers/interaction.controller');

// Create Express app
const app = express();

// Initialize services
const customerService = new CustomerService(db);
const contactService = new ContactService(db);
const interactionService = new InteractionService(db);

// Initialize controllers
const customerController = new CustomerController(customerService);
const contactController = new ContactController(contactService);
const interactionController = new InteractionController(interactionService);

// Combine controllers
const controllers = {
  customerController,
  contactController,
  interactionController,
};

// Import routes
const routes = require('./routes')(controllers);

// Middleware
app.use(helmet()); // Security headers
app.use(compression()); // Compress responses
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Logging
if (config.server.env !== 'test') {
  app.use(morgan(config.logging.format, { stream: logger.stream }));
}

// Routes
app.get('/', (req, res) => {
  res.status(StatusCodes.OK).json({
    service: 'CRM Service',
    version: '1.0.0',
    status: 'running',
  });
});

// Apply authentication middleware to API routes
app.use('/api', authenticate);

// Register routes
app.use(routes);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(StatusCodes.NOT_FOUND).json({
    error: {
      name: 'NotFoundError',
      message: 'Resource not found',
      status: StatusCodes.NOT_FOUND,
    },
  });
});

module.exports = app;
