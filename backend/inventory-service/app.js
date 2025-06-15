/**
 * Main application file for Inventory Service
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
const CategoryService = require('./services/category.service');
const ProductService = require('./services/product.service');
const InventoryService = require('./services/inventory.service');
const WarehouseService = require('./services/warehouse.service');
const InventoryTransactionService = require('./services/inventory-transaction.service');

// Import controllers
const CategoryController = require('./controllers/category.controller');
const ProductController = require('./controllers/product.controller');
const InventoryController = require('./controllers/inventory.controller');
const WarehouseController = require('./controllers/warehouse.controller');
const InventoryTransactionController = require('./controllers/inventory-transaction.controller');

/**
 * Initialize Express application
 * @returns {Object} Express application
 */
const initApp = async () => {
  const app = express();

  // Connect to database
  const sequelize = new Sequelize(
    config.database.name,
    config.database.user,
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
  const db = await models.init(sequelize);

  // Initialize services
  const services = {
    categoryService: new CategoryService(db),
    productService: new ProductService(db),
    inventoryService: new InventoryService(db),
    warehouseService: new WarehouseService(db),
    inventoryTransactionService: new InventoryTransactionService(db),
  };

  // Initialize controllers
  const controllers = {
    categoryController: new CategoryController(services.categoryService),
    productController: new ProductController(services.productService),
    inventoryController: new InventoryController(services.inventoryService),
    warehouseController: new WarehouseController(services.warehouseService),
    inventoryTransactionController: new InventoryTransactionController(services.inventoryTransactionService),
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
