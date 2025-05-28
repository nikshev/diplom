/**
 * Authentication and authorization middleware
 */

const axios = require('axios');
const { StatusCodes } = require('http-status-codes');
const config = require('../config');
const logger = require('../config/logger');
const { UnauthorizedError, ForbiddenError } = require('../utils/errors');

/**
 * Authenticate user using JWT token
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.split(' ')[1];

    // Verify token with Auth Service
    try {
      const response = await axios.post(
        `${config.services.auth.url}/api/auth/verify-token`,
        { token },
        { timeout: config.services.auth.timeout }
      );

      // Set user in request
      req.user = response.data.user;
      next();
    } catch (error) {
      if (error.response) {
        // Auth service responded with an error
        throw new UnauthorizedError(error.response.data.message || 'Invalid token');
      } else {
        // Network error or timeout
        logger.error('Error connecting to Auth Service:', error);
        throw new UnauthorizedError('Authentication service unavailable');
      }
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Authorize user based on resource and action
 * @param {string} resource - Resource name
 * @param {string} action - Action name (create, read, update, delete)
 * @returns {Function} Middleware function
 */
const authorize = (resource, action) => {
  return async (req, res, next) => {
    try {
      // Skip authorization if no user (should not happen due to authenticate middleware)
      if (!req.user) {
        throw new UnauthorizedError('User not authenticated');
      }

      // Check if user has admin role (full access)
      if (req.user.role === 'admin') {
        return next();
      }

      // Verify permission with Auth Service
      try {
        const response = await axios.post(
          `${config.services.auth.url}/api/auth/check-permission`,
          {
            userId: req.user.id,
            resource,
            action,
          },
          { timeout: config.services.auth.timeout }
        );

        if (response.data.hasPermission) {
          next();
        } else {
          throw new ForbiddenError(`You don't have permission to ${action} ${resource}`);
        }
      } catch (error) {
        if (error.response) {
          // Auth service responded with an error
          throw new ForbiddenError(error.response.data.message || `Permission denied for ${action} ${resource}`);
        } else {
          // Network error or timeout
          logger.error('Error connecting to Auth Service:', error);
          throw new ForbiddenError('Authorization service unavailable');
        }
      }
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  authenticate,
  authorize,
};
