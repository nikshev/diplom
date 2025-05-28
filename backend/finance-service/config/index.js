/**
 * Configuration file for Finance Service
 */

require('dotenv').config();

/**
 * Server configuration
 */
const server = {
  port: process.env.PORT || 3003,
  env: process.env.NODE_ENV || 'development',
};

/**
 * Database configuration
 */
const database = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  name: process.env.DB_NAME || 'finance_db',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  sync: process.env.DB_SYNC === 'true',
  alter: process.env.DB_ALTER === 'true',
};

/**
 * Logging configuration
 */
const logging = {
  level: process.env.LOG_LEVEL || 'info',
  file: process.env.LOG_FILE || 'logs/finance-service.log',
};

/**
 * JWT configuration
 */
const jwt = {
  secret: process.env.JWT_SECRET || 'your_jwt_secret',
  expiresIn: process.env.JWT_EXPIRES_IN || '1d',
};

/**
 * External services URLs
 */
const services = {
  auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
  order: process.env.ORDER_SERVICE_URL || 'http://localhost:3004',
  inventory: process.env.INVENTORY_SERVICE_URL || 'http://localhost:3002',
};

/**
 * Export configuration
 */
module.exports = {
  server,
  database,
  logging,
  jwt,
  services,
};
