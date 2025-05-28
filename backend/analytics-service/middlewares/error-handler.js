/**
 * Error handler middleware for Analytics Service
 */

const { BaseError } = require('../utils/errors');
const logger = require('../config/logger');

/**
 * Error handler middleware
 * @param {Object} err - Error object
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next function
 */
function errorHandler(err, req, res, next) {
  // Log error
  logger.error(err.message, {
    error: err,
    stack: err.stack,
    path: req.path,
    method: req.method,
    requestId: req.id,
  });

  // Handle known errors
  if (err instanceof BaseError) {
    const response = {
      error: {
        code: err.errorCode,
        message: err.message,
      },
    };

    // Add validation errors if available
    if (err.errors) {
      response.error.details = err.errors;
    }

    return res.status(err.statusCode).json(response);
  }

  // Handle Sequelize errors
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    const errors = {};
    
    err.errors.forEach((error) => {
      errors[error.path] = error.message;
    });
    
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation error',
        details: errors,
      },
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid token',
      },
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Token expired',
      },
    });
  }

  // Handle unknown errors
  return res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
    },
  });
}

module.exports = errorHandler;
