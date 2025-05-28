/**
 * Configuration file for Analytics Service
 */

require('dotenv').config();

/**
 * Server configuration
 */
const server = {
  port: process.env.PORT || 3004,
  env: process.env.NODE_ENV || 'development',
};

/**
 * Database configuration
 */
const database = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  name: process.env.DB_NAME || 'analytics_db',
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
  file: process.env.LOG_FILE || 'logs/analytics-service.log',
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
  crm: process.env.CRM_SERVICE_URL || 'http://localhost:3002',
  inventory: process.env.INVENTORY_SERVICE_URL || 'http://localhost:3003',
  finance: process.env.FINANCE_SERVICE_URL || 'http://localhost:3005',
  order: process.env.ORDER_SERVICE_URL || 'http://localhost:3006',
};

/**
 * Data collection configuration
 */
const dataCollection = {
  interval: process.env.DATA_COLLECTION_INTERVAL || 3600000, // 1 hour in milliseconds
  retention: process.env.DATA_RETENTION_DAYS || 90, // 90 days
};

/**
 * KPI configuration
 */
const kpi = {
  refreshInterval: process.env.KPI_REFRESH_INTERVAL || 86400000, // 24 hours in milliseconds
  defaultTimeframe: process.env.KPI_DEFAULT_TIMEFRAME || 'month', // day, week, month, quarter, year
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
  dataCollection,
  kpi,
};
