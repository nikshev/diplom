/**
 * Authentication middleware for Order Service
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
    try {
      // Get token from Authorization header
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new UnauthorizedError('Authentication token is required'));
      }
      
      const token = authHeader.split(' ')[1];
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here');
      
      // Attach user to request
      req.user = decoded;
      
      next();
    } catch (error) {
      logger.error('Authentication error:', error);
      next(new UnauthorizedError('Invalid or expired token'));
    }
  };
};

/**
 * Middleware to check if user has required permissions
 * @param {string|string[]} requiredPermissions - Required permission(s)
 * @returns {Function} Express middleware
 */
const authorize = (requiredPermissions) => {
  return async (req, res, next) => {
    try {
      // Check if user exists on request (authenticate middleware should be called first)
      if (!req.user) {
        return next(new UnauthorizedError('User not authenticated'));
      }
      
      // Get user permissions from token
      const userPermissions = req.user.permissions || [];
      
      // Convert single permission to array
      const permissionsToCheck = Array.isArray(requiredPermissions) 
        ? requiredPermissions 
        : [requiredPermissions];
      
      // Check if user has admin role (bypass all checks)
      if (req.user.role === 'admin') {
        return next();
      }
      
      // Check if user has any of the required permissions
      const hasPermission = permissionsToCheck.some(permission => 
        userPermissions.includes(permission)
      );
      
      if (!hasPermission) {
        return next(new ForbiddenError('You do not have permission to access this resource'));
      }
      
      next();
    } catch (error) {
      logger.error('Authorization error:', error);
      next(error);
    }
  };
};

/**
 * Middleware to check if user has required role
 * @param {string|string[]} requiredRoles - Required role(s)
 * @returns {Function} Express middleware
 */
const authorizeRole = (requiredRoles) => {
  return (req, res, next) => {
    try {
      // Check if user exists on request (authenticate middleware should be called first)
      if (!req.user) {
        return next(new UnauthorizedError('User not authenticated'));
      }
      
      const { role } = req.user;
      
      // Convert single role to array
      const rolesToCheck = Array.isArray(requiredRoles) 
        ? requiredRoles 
        : [requiredRoles];
      
      // Check if user has admin role (bypass all checks)
      if (role === 'admin') {
        return next();
      }
      
      // Check if user has any of the required roles
      const hasRole = rolesToCheck.includes(role);
      
      if (!hasRole) {
        return next(new ForbiddenError('You do not have permission to access this resource'));
      }
      
      next();
    } catch (error) {
      logger.error('Role authorization error:', error);
      next(error);
    }
  };
};

module.exports = {
  authenticate,
  authorize,
  authorizeRole,
};
