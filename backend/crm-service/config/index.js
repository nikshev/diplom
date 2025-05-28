/**
 * Configuration for CRM Service
 */

require('dotenv').config();

const config = {
  server: {
    port: process.env.PORT || 3004,
    env: process.env.NODE_ENV || 'development',
  },
  
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    name: process.env.DB_NAME || 'erp_crm',
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
  
  customerStatuses: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    LEAD: 'lead',
    PROSPECT: 'prospect',
    CUSTOMER: 'customer',
  },
  
  customerTypes: {
    INDIVIDUAL: 'individual',
    BUSINESS: 'business',
    GOVERNMENT: 'government',
    NONPROFIT: 'nonprofit',
  },
  
  interactionTypes: {
    CALL: 'call',
    EMAIL: 'email',
    MEETING: 'meeting',
    NOTE: 'note',
    TASK: 'task',
  },
};

module.exports = config;
