/**
 * Main application file for Finance Service
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const { Sequelize } = require('sequelize');
const config = require('./config');
const logger = require('./config/logger');
const errorHandler = require('./middlewares/error-handler');
const initRoutes = require('./routes');

// Import models
const models = require('./models');

// Import services
const TransactionService = require('./services/transaction.service');
const TransactionCategoryService = require('./services/transaction-category.service');
const AccountService = require('./services/account.service');
const InvoiceService = require('./services/invoice.service');

// Import controllers
const TransactionController = require('./controllers/transaction.controller');
const TransactionCategoryController = require('./controllers/transaction-category.controller');
const AccountController = require('./controllers/account.controller');
const InvoiceController = require('./controllers/invoice.controller');

/**
 * Initialize Express application
 * @returns {Object} Express application
 */
const initApp = async () => {
  const app = express();

  // Connect to database
  const sequelize = new Sequelize(
    config.database.name,
    config.database.username,
    config.database.password,
    {
      host: config.database.host,
      port: config.database.port,
      dialect: 'postgres',
      logging: (msg) => logger.debug(msg),
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    }
  );

  try {
    await sequelize.authenticate();
    logger.info('Database connection has been established successfully.');
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
    throw error;
  }

  // Initialize models with sequelize
  const db = models(sequelize);

  // Initialize services
  const services = {
    transactionService: new TransactionService(db),
    transactionCategoryService: new TransactionCategoryService(db),
    accountService: new AccountService(db),
    invoiceService: new InvoiceService(db),
  };

  // Initialize controllers
  const controllers = {
    transactionController: new TransactionController(services.transactionService),
    transactionCategoryController: new TransactionCategoryController(services.transactionCategoryService),
    accountController: new AccountController(services.accountService),
    invoiceController: new InvoiceController(services.invoiceService),
  };

  // Middleware
  app.use(helmet()); // Security headers
  app.use(cors()); // CORS
  app.use(compression()); // Compress responses
  app.use(express.json()); // Parse JSON bodies
  app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
  
  // Logging
  app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

  // Routes
  app.use('/', initRoutes(controllers));

  // Error handling
  app.use(errorHandler);

  // Sync database models
  if (config.database.sync) {
    await sequelize.sync({ alter: config.database.alter });
    logger.info('Database models synchronized successfully.');
  }

  return app;
};

module.exports = initApp;
