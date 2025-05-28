/**
 * Configuration module for Auth Service
 */

require('dotenv').config();

module.exports = {
  // Server configuration
  server: {
    port: process.env.PORT || 3001,
    env: process.env.NODE_ENV || 'development',
  },

  // Database configuration
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    name: process.env.DB_NAME || 'erp_system',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    dialect: 'postgres',
    schema: 'auth_service',
    logging: process.env.DB_LOGGING === 'true' ? console.log : false,
  },

  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-should-be-in-env',
    accessTokenExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  },

  // Password reset configuration
  passwordReset: {
    tokenExpiry: parseInt(process.env.PASSWORD_RESET_EXPIRY || '3600', 10), // 1 hour in seconds
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'combined',
  },

  // Default admin user
  defaultAdmin: {
    email: process.env.ADMIN_EMAIL || 'admin@example.com',
    password: process.env.ADMIN_PASSWORD || 'Admin123!',
    firstName: process.env.ADMIN_FIRST_NAME || 'Admin',
    lastName: process.env.ADMIN_LAST_NAME || 'User',
  },

  // Default roles and permissions
  defaultRoles: [
    {
      name: 'admin',
      description: 'Administrator with full access to all resources',
    },
    {
      name: 'manager',
      description: 'Manager with access to most resources',
    },
    {
      name: 'employee',
      description: 'Regular employee with limited access',
    },
  ],

  // Default permissions by resource and action
  defaultPermissions: [
    // User permissions
    { name: 'users:read', resource: 'users', action: 'read', description: 'View users' },
    { name: 'users:create', resource: 'users', action: 'create', description: 'Create users' },
    { name: 'users:update', resource: 'users', action: 'update', description: 'Update users' },
    { name: 'users:delete', resource: 'users', action: 'delete', description: 'Delete users' },
    
    // Role permissions
    { name: 'roles:read', resource: 'roles', action: 'read', description: 'View roles' },
    { name: 'roles:create', resource: 'roles', action: 'create', description: 'Create roles' },
    { name: 'roles:update', resource: 'roles', action: 'update', description: 'Update roles' },
    { name: 'roles:delete', resource: 'roles', action: 'delete', description: 'Delete roles' },
    
    // Permission permissions
    { name: 'permissions:read', resource: 'permissions', action: 'read', description: 'View permissions' },
    { name: 'permissions:assign', resource: 'permissions', action: 'assign', description: 'Assign permissions to roles' },
  ],

  // Role-permission mappings
  rolePermissions: {
    'admin': [
      'users:read', 'users:create', 'users:update', 'users:delete',
      'roles:read', 'roles:create', 'roles:update', 'roles:delete',
      'permissions:read', 'permissions:assign',
    ],
    'manager': [
      'users:read', 'users:create', 'users:update',
      'roles:read',
      'permissions:read',
    ],
    'employee': [
      'users:read',
    ],
  },
};
