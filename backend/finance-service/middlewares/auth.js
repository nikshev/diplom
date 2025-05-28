/**
 * Authentication and authorization middleware for Finance Service
 */

const jwt = require('jsonwebtoken');
const axios = require('axios');
const { StatusCodes } = require('http-status-codes');
const config = require('../config');
const logger = require('../config/logger');
const { UnauthorizedError, ForbiddenError } = require('../utils/errors');

/**
 * Create authentication middleware
 * @param {Array} roles - Allowed roles
 * @returns {Function} Middleware function
 */
const auth = (roles = []) => {
  return async (req, res, next) => {
    try {
      // Get token from header
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedError('No token provided');
      }
      
      const token = authHeader.split(' ')[1];
      
      // Verify token
      try {
        // First try to verify locally
        const decoded = jwt.verify(token, config.jwt.secret);
        req.user = decoded;
        
        // Check if user has required role
        if (roles.length && !roles.some(role => req.user.roles.includes(role))) {
          throw new ForbiddenError('Insufficient permissions');
        }
        
        next();
      } catch (error) {
        // If local verification fails, try to validate with auth service
        try {
          const response = await axios.post(`${config.services.auth}/api/auth/validate-token`, { token });
          
          if (response.data && response.data.valid) {
            req.user = response.data.user;
            
            // Check if user has required role
            if (roles.length && !roles.some(role => req.user.roles.includes(role))) {
              throw new ForbiddenError('Insufficient permissions');
            }
            
            next();
          } else {
            throw new UnauthorizedError('Invalid token');
          }
        } catch (authServiceError) {
          logger.error('Error validating token with auth service:', authServiceError);
          throw new UnauthorizedError('Invalid token');
        }
      }
    } catch (error) {
      next(error);
    }
  };
};

module.exports = auth;
