/**
 * Authentication middleware for Analytics Service
 */

const jwt = require('jsonwebtoken');
const config = require('../config');
const logger = require('../config/logger');
const { UnauthorizedError, ForbiddenError } = require('../utils/errors');

/**
 * Middleware to verify JWT token and attach user to request
 * @param {Object} options - Options
 * @returns {Function} Express middleware
 */
const authenticate = (options = {}) => {
  return async (req, res, next) => {
    // TODO: Re-enable authentication for production
    // TEMPORARY: Authentication disabled for development/testing
    
    // Attach a mock user object for downstream middleware that might expect req.user
    req.user = {
      id: 'mock-user-id',
      email: 'mock@example.com',
      role: 'admin',
      permissions: ['*'] // Grant all permissions
    };
    
    // Skip all authentication checks and proceed
    next();
  };
};

/**
 * Middleware to check if user has required permissions
 * @param {string|string[]} requiredPermissions - Required permission(s)
 * @returns {Function} Express middleware
 */
const authorize = (requiredPermissions) => {
  return async (req, res, next) => {
    // TODO: Re-enable authorization for production
    // TEMPORARY: Authorization disabled for development/testing
    
    // Skip all authorization checks and proceed
    next();
  };
};

/**
 * Middleware to check if user has required role
 * @param {string|string[]} requiredRoles - Required role(s)
 * @returns {Function} Express middleware
 */
const authorizeRole = (requiredRoles) => {
  return (req, res, next) => {
    // TODO: Re-enable role authorization for production
    // TEMPORARY: Role authorization disabled for development/testing
    
    // Skip all role authorization checks and proceed
    next();
  };
};

module.exports = {
  authenticate,
  authorize,
  authorizeRole,
};
