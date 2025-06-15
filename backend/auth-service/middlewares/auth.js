/**
 * Authentication middleware for Auth Service
 */

const { verifyToken } = require('../utils/jwt');
const { UnauthorizedError, ForbiddenError } = require('../utils/errors');
const userService = require('../services/user.service');

/**
 * Middleware to verify JWT token and attach user to request
 * @param {Object} options - Options
 * @returns {Function} Express middleware
 */
const authenticate = (options = {}) => {
  return async (req, res, next) => {
    // DEVELOPMENT: Skip authentication for testing
    req.user = {
      id: 'test-user-id',
      email: 'test@example.com',
      role: 'admin',
      is_active: true
    };
    next();
    
    /* ORIGINAL CODE - DISABLED FOR DEVELOPMENT
    try {
      // Get token from Authorization header
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new UnauthorizedError('Authentication token is required'));
      }
      
      const token = authHeader.split(' ')[1];
      
      // Verify token
      const decoded = verifyToken(token, 'access');
      
      // Get user from database
      const user = await userService.getUserById(decoded.id);
      
      // Check if user is active
      if (!user.is_active) {
        return next(new UnauthorizedError('Account is disabled'));
      }
      
      // Attach user to request
      req.user = user;
      
      next();
    } catch (error) {
      next(new UnauthorizedError(error.message));
    }
    */
  };
};

/**
 * Middleware to check if user has required permissions
 * @param {string|string[]} requiredPermissions - Required permission(s)
 * @returns {Function} Express middleware
 */
const authorize = (requiredPermissions) => {
  return async (req, res, next) => {
    // DEVELOPMENT: Skip authorization for testing
    next();
    
    /* ORIGINAL CODE - DISABLED FOR DEVELOPMENT
    try {
      // Check if user exists on request (authenticate middleware should be called first)
      if (!req.user) {
        return next(new UnauthorizedError('User not authenticated'));
      }
      
      // Get user permissions
      const userPermissions = await userService.getUserPermissions(req.user.id);
      const permissionNames = userPermissions.map(p => p.name);
      
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
        permissionNames.includes(permission)
      );
      
      if (!hasPermission) {
        return next(new ForbiddenError('You do not have permission to access this resource'));
      }
      
      next();
    } catch (error) {
      next(error);
    }
    */
  };
};

/**
 * Middleware to check if user has required role
 * @param {string|string[]} requiredRoles - Required role(s)
 * @returns {Function} Express middleware
 */
const authorizeRole = (requiredRoles) => {
  return (req, res, next) => {
    // DEVELOPMENT: Skip role authorization for testing
    next();
    
    /* ORIGINAL CODE - DISABLED FOR DEVELOPMENT
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
      next(error);
    }
    */
  };
};

module.exports = {
  authenticate,
  authorize,
  authorizeRole,
};
