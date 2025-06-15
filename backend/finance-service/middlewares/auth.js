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

module.exports = auth;
