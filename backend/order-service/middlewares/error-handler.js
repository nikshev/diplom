/**
 * Error handling middleware for Order Service
 */

const logger = require('../config/logger');
const { ApiError } = require('../utils/errors');

/**
 * Error handler middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const errorHandler = (err, req, res, next) => {
  // Log error
  logger.error(`${err.name}: ${err.message}`, {
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userId: req.user ? req.user.id : undefined,
  });
  
  // Handle API errors
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      status: 'error',
      statusCode: err.statusCode,
      message: err.message,
      errors: err.errors,
    });
  }
  
  // Handle Sequelize errors
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    const errors = err.errors.map(e => ({
      field: e.path,
      message: e.message,
      value: e.value,
    }));
    
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Validation error',
      errors,
    });
  }
  
  // Handle JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'error',
      statusCode: 401,
      message: 'Invalid or expired token',
    });
  }
  
  // Handle other errors
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? 'Internal server error' : err.message;
  
  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
  });
};

module.exports = errorHandler;
