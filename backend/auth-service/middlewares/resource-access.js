/**
 * Resource-based access control middleware for Auth Service
 */

const { ForbiddenError } = require('../utils/errors');
const userService = require('../services/user.service');

/**
 * Check if user has access to a specific resource
 * @param {string} resource - Resource name
 * @param {string} action - Action name (create, read, update, delete)
 * @returns {Function} Express middleware
 */
const checkResourceAccess = (resource, action) => {
  return async (req, res, next) => {
    try {
      // Skip check for admin users
      if (req.user && req.user.role === 'admin') {
        return next();
      }
      
      // Get user permissions
      const permissions = await userService.getUserPermissions(req.user.id);
      
      // Check if user has permission for this resource and action
      const hasAccess = permissions.some(permission => 
        permission.resource === resource && 
        (permission.action === action || permission.action === 'all')
      );
      
      if (!hasAccess) {
        return next(new ForbiddenError(`You don't have permission to ${action} this ${resource}`));
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Check if user is owner of the resource
 * @param {Function} getResourceOwnerId - Function to get owner ID from request
 * @returns {Function} Express middleware
 */
const checkOwnership = (getResourceOwnerId) => {
  return async (req, res, next) => {
    try {
      // Skip check for admin users
      if (req.user && req.user.role === 'admin') {
        return next();
      }
      
      // Get owner ID
      const ownerId = await getResourceOwnerId(req);
      
      // Check if user is owner
      if (req.user.id === ownerId) {
        return next();
      }
      
      next(new ForbiddenError('You are not authorized to access this resource'));
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Combine multiple access checks with OR logic
 * @param {Function[]} middlewares - Array of middleware functions
 * @returns {Function} Express middleware
 */
const anyOf = (middlewares) => {
  return async (req, res, next) => {
    // Create a copy of the original response methods
    const originalSend = res.send;
    const originalJson = res.json;
    const originalEnd = res.end;
    
    // Store errors from each middleware
    const errors = [];
    
    // Counter for processed middlewares
    let processed = 0;
    
    // Override response methods to prevent actual response
    res.send = res.json = res.end = () => res;
    
    // Process each middleware
    for (const middleware of middlewares) {
      try {
        await new Promise((resolve, reject) => {
          // Call middleware with custom next function
          middleware(req, res, (err) => {
            if (err) {
              errors.push(err);
              resolve();
            } else {
              // If any middleware passes, restore response methods and proceed
              res.send = originalSend;
              res.json = originalJson;
              res.end = originalEnd;
              reject({ success: true });
            }
          });
        });
      } catch (result) {
        if (result.success) {
          return next();
        }
      }
      
      processed++;
      
      // If all middlewares were processed and none passed
      if (processed === middlewares.length) {
        // Restore response methods
        res.send = originalSend;
        res.json = originalJson;
        res.end = originalEnd;
        
        // Return the most relevant error
        return next(errors[0] || new ForbiddenError('Access denied'));
      }
    }
  };
};

module.exports = {
  checkResourceAccess,
  checkOwnership,
  anyOf,
};
