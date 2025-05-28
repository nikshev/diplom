/**
 * Authentication middleware for API Gateway
 */

const { UnauthorizedError, ForbiddenError } = require('../utils/errors');
const { verifyToken, extractTokenFromHeader } = require('../utils/jwt');
const logger = require('../config/logger');

/**
 * Middleware to verify JWT token and attach user to request
 * @returns {Function} Express middleware
 */
const authenticate = () => {
  return (req, res, next) => {
    try {
      // Get token from Authorization header
      const authHeader = req.headers.authorization;
      const token = extractTokenFromHeader(authHeader);
      
      if (!token) {
        return next(new UnauthorizedError('Authentication token is required'));
      }
      
      // Verify token
      const decoded = verifyToken(token, 'access');
      
      // Attach user info to request
      req.user = decoded;
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to check if user has required permissions
 * @param {string|string[]} requiredPermissions - Required permission(s)
 * @returns {Function} Express middleware
 */
const authorize = (requiredPermissions) => {
  return (req, res, next) => {
    try {
      // Check if user exists on request (authenticate middleware should be called first)
      if (!req.user) {
        return next(new UnauthorizedError('User not authenticated'));
      }
      
      const { permissions = [] } = req.user;
      
      // Convert single permission to array
      const permissionsToCheck = Array.isArray(requiredPermissions) 
        ? requiredPermissions 
        : [requiredPermissions];
      
      // Check if user has admin permission (bypass all checks)
      if (permissions.includes('admin:all')) {
        return next();
      }
      
      // Check if user has any of the required permissions
      const hasPermission = permissionsToCheck.some(permission => 
        permissions.includes(permission)
      );
      
      if (!hasPermission) {
        logger.warn(`User ${req.user.id} lacks required permissions: ${permissionsToCheck.join(', ')}`);
        return next(new ForbiddenError('You do not have permission to access this resource'));
      }
      
      next();
    } catch (error) {
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
        logger.warn(`User ${req.user.id} lacks required role: ${rolesToCheck.join(', ')}`);
        return next(new ForbiddenError('You do not have permission to access this resource'));
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  authenticate,
  authorize,
  authorizeRole,
};
