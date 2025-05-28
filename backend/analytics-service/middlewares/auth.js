/**
 * Authentication middleware for Analytics Service
 */

const jwt = require('jsonwebtoken');
const axios = require('axios');
const { UnauthorizedError, ForbiddenError } = require('../utils/errors');
const config = require('../config');
const logger = require('../config/logger');

/**
 * Check if request is authenticated
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next function
 */
async function checkAuth(req, res, next) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      throw new UnauthorizedError('No token provided');
    }
    
    try {
      // Verify token locally
      const decoded = jwt.verify(token, config.jwt.secret);
      
      // Set user in request
      req.user = decoded;
      
      // If token is about to expire, refresh it
      const now = Math.floor(Date.now() / 1000);
      const tokenExp = decoded.exp;
      const refreshThreshold = 60 * 5; // 5 minutes
      
      if (tokenExp - now < refreshThreshold) {
        // Token is about to expire, refresh it
        try {
          const response = await axios.post(`${config.services.auth}/api/auth/refresh`, {
            token,
          });
          
          if (response.data && response.data.token) {
            // Set new token in response header
            res.setHeader('X-New-Token', response.data.token);
          }
        } catch (error) {
          // Log error but continue with current token
          logger.warn('Failed to refresh token', { error: error.message });
        }
      }
      
      next();
    } catch (error) {
      // Token is invalid or expired
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedError('Token expired');
      } else {
        throw new UnauthorizedError('Invalid token');
      }
    }
  } catch (error) {
    next(error);
  }
}

/**
 * Check if user has required role
 * @param {Array} roles - Required roles
 * @returns {Function} Middleware function
 */
function checkRole(roles) {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }
      
      const userRoles = req.user.roles || [];
      
      // Check if user has any of the required roles
      const hasRole = roles.some(role => userRoles.includes(role));
      
      if (!hasRole) {
        throw new ForbiddenError('Insufficient permissions');
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Check if user has permission for resource
 * @param {String} resource - Resource name
 * @param {String} action - Action name
 * @returns {Function} Middleware function
 */
function checkPermission(resource, action) {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }
      
      // Call auth service to check permission
      try {
        const response = await axios.post(`${config.services.auth}/api/auth/check-permission`, {
          userId: req.user.id,
          resource,
          action,
        }, {
          headers: {
            Authorization: req.headers.authorization,
          },
        });
        
        if (response.data && response.data.hasPermission) {
          next();
        } else {
          throw new ForbiddenError('Insufficient permissions');
        }
      } catch (error) {
        if (error instanceof ForbiddenError) {
          throw error;
        } else {
          logger.error('Failed to check permission', { error: error.message });
          throw new ForbiddenError('Insufficient permissions');
        }
      }
    } catch (error) {
      next(error);
    }
  };
}

module.exports = {
  checkAuth,
  checkRole,
  checkPermission,
};
