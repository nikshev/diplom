/**
 * Configuration module for API Gateway
 */

require('dotenv').config();

module.exports = {
  // Server configuration
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
    corsOrigins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : '*',
  },

  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-should-be-in-env',
    accessTokenExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  },

  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'combined',
  },

  // Services configuration
  services: {
    auth: {
      url: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
      timeout: parseInt(process.env.AUTH_SERVICE_TIMEOUT || '5000', 10),
    },
    order: {
      url: process.env.ORDER_SERVICE_URL || 'http://localhost:3002',
      timeout: parseInt(process.env.ORDER_SERVICE_TIMEOUT || '5000', 10),
    },
    crm: {
      url: process.env.CRM_SERVICE_URL || 'http://localhost:3003',
      timeout: parseInt(process.env.CRM_SERVICE_TIMEOUT || '5000', 10),
    },
    inventory: {
      url: process.env.INVENTORY_SERVICE_URL || 'http://localhost:3004',
      timeout: parseInt(process.env.INVENTORY_SERVICE_TIMEOUT || '5000', 10),
    },
    finance: {
      url: process.env.FINANCE_SERVICE_URL || 'http://localhost:3005',
      timeout: parseInt(process.env.FINANCE_SERVICE_TIMEOUT || '5000', 10),
    },
    analytics: {
      url: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:3006',
      timeout: parseInt(process.env.ANALYTICS_SERVICE_TIMEOUT || '5000', 10),
    },
  },
};
