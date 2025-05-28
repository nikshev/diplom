/**
 * Configuration for Inventory Service
 */

require('dotenv').config();

const config = {
  server: {
    port: process.env.PORT || 3003,
    env: process.env.NODE_ENV || 'development',
  },
  
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    name: process.env.DB_NAME || 'erp_inventory',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    dialect: 'postgres',
    logging: process.env.DB_LOGGING === 'true',
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
  
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'combined',
    directory: process.env.LOG_DIR || 'logs',
  },
  
  services: {
    order: {
      url: process.env.ORDER_SERVICE_URL || 'http://localhost:3002',
      timeout: parseInt(process.env.ORDER_SERVICE_TIMEOUT || '5000', 10),
    },
    auth: {
      url: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
      timeout: parseInt(process.env.AUTH_SERVICE_TIMEOUT || '5000', 10),
    },
  },
  
  // Константи для статусів товарів
  productStatuses: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    DISCONTINUED: 'discontinued',
    OUT_OF_STOCK: 'out_of_stock',
    LOW_STOCK: 'low_stock',
  },
  
  // Константи для типів операцій з запасами
  stockOperationTypes: {
    PURCHASE: 'purchase',
    SALE: 'sale',
    RETURN: 'return',
    ADJUSTMENT: 'adjustment',
    TRANSFER: 'transfer',
    WRITE_OFF: 'write_off',
  },
  
  // Налаштування для рівнів запасів
  stockLevels: {
    lowStockThreshold: parseInt(process.env.LOW_STOCK_THRESHOLD || '10', 10),
    criticalStockThreshold: parseInt(process.env.CRITICAL_STOCK_THRESHOLD || '5', 10),
  },
};

module.exports = config;
