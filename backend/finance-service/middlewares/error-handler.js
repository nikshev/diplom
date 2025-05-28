/**
 * Error handling middleware for Finance Service
 */

const { StatusCodes } = require('http-status-codes');
const logger = require('../config/logger');
const { BaseError } = require('../utils/errors');

/**
 * Error handler middleware
 * @param {Object} err - Error object
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
const errorHandler = (err, req, res, next) => {
  // Log error
  logger.error(`${err.name}: ${err.message}`, {
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
  });

  // Handle known errors
  if (err instanceof BaseError) {
    const response = {
      status: 'error',
      message: err.message,
      code: err.errorCode,
    };

    // Add validation errors if present
    if (err.errors) {
      response.errors = err.errors;
    }

    return res.status(err.statusCode).json(response);
  }

  // Handle Sequelize errors
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    const errors = {};
    
    err.errors.forEach((error) => {
      errors[error.path] = error.message;
    });
    
    return res.status(StatusCodes.BAD_REQUEST).json({
      status: 'error',
      message: 'Validation error',
      code: 'VALIDATION_ERROR',
      errors,
    });
  }

  // Handle other errors
  const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  
  res.status(statusCode).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message,
    code: 'INTERNAL_ERROR',
  });
};

module.exports = errorHandler;
