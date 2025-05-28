/**
 * Configuration for Order Service
 */

require('dotenv').config();

const config = {
  server: {
    port: process.env.PORT || 3002,
    env: process.env.NODE_ENV || 'development',
  },
  
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    name: process.env.DB_NAME || 'erp_orders',
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
    inventory: {
      url: process.env.INVENTORY_SERVICE_URL || 'http://localhost:3003',
      timeout: parseInt(process.env.INVENTORY_SERVICE_TIMEOUT || '5000', 10),
    },
    customer: {
      url: process.env.CUSTOMER_SERVICE_URL || 'http://localhost:3004',
      timeout: parseInt(process.env.CUSTOMER_SERVICE_TIMEOUT || '5000', 10),
    },
  },
  
  orderStatuses: {
    NEW: 'new',
    PROCESSING: 'processing',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
    RETURNED: 'returned',
  },
  
  paymentMethods: {
    CARD: 'card',
    CASH: 'cash',
    BANK_TRANSFER: 'bank_transfer',
    CRYPTO: 'crypto',
  },
  
  shippingMethods: {
    NOVA_POSHTA: 'nova_poshta',
    UKRPOSHTA: 'ukrposhta',
    SELF_PICKUP: 'self_pickup',
    COURIER: 'courier',
  },
};

module.exports = config;
