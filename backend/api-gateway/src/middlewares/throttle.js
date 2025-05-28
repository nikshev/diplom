/**
 * Request throttling middleware for API Gateway
 * Provides endpoint-specific rate limiting
 */

const rateLimit = require('express-rate-limit');
const { StatusCodes } = require('http-status-codes');
const logger = require('../config/logger');

/**
 * Create throttling middleware for specific endpoints
 * @param {Object} options - Throttling options
 * @returns {Function} Express middleware
 */
const throttle = (options = {}) => {
  const {
    windowMs = 60 * 1000, // 1 minute by default
    max = 60, // 60 requests per minute by default
    message = 'Too many requests from this IP, please try again later',
    keyGenerator = (req) => req.ip, // Use IP as default key
  } = options;
  
  // Create rate limiter
  const limiter = rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator,
    handler: (req, res) => {
      logger.warn(`Rate limit exceeded for ${keyGenerator(req)} on ${req.originalUrl}`);
      
      res.status(StatusCodes.TOO_MANY_REQUESTS).json({
        status: StatusCodes.TOO_MANY_REQUESTS,
        message,
        correlationId: req.correlationId,
      });
    },
  });
  
  return limiter;
};

/**
 * Create throttling middleware with user-based rate limiting
 * @param {Object} options - Throttling options
 * @returns {Function} Express middleware
 */
const userThrottle = (options = {}) => {
  return throttle({
    ...options,
    // Use user ID as key if authenticated, otherwise use IP
    keyGenerator: (req) => (req.user ? `user:${req.user.id}` : `ip:${req.ip}`),
  });
};

/**
 * Create throttling middleware with endpoint-specific rate limiting
 * @param {Object} options - Throttling options
 * @returns {Function} Express middleware
 */
const endpointThrottle = (options = {}) => {
  return throttle({
    ...options,
    // Use endpoint and IP as key
    keyGenerator: (req) => `${req.method}:${req.originalUrl}:${req.ip}`,
  });
};

module.exports = {
  throttle,
  userThrottle,
  endpointThrottle,
};
