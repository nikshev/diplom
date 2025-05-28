/**
 * Error handling middleware
 */

const { StatusCodes } = require('http-status-codes');
const logger = require('../config/logger');
const { ApiError } = require('../utils/errors');

/**
 * Handle errors
 * @param {Error} err - Error object
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
module.exports = (err, req, res, next) => {
  // Log error
  logger.error(`${err.name}: ${err.message}`, {
    error: err,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    user: req.user ? req.user.id : 'anonymous',
  });

  // Handle API errors
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      error: {
        name: err.name,
        message: err.message,
        status: err.statusCode,
        errors: err.errors,
      },
    });
  }

  // Handle Sequelize errors
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    const errors = err.errors.map(e => ({
      field: e.path,
      message: e.message,
      value: e.value,
    }));

    return res.status(StatusCodes.BAD_REQUEST).json({
      error: {
        name: 'ValidationError',
        message: 'Validation failed',
        status: StatusCodes.BAD_REQUEST,
        errors,
      },
    });
  }

  // Handle other known errors
  if (err.name === 'SyntaxError' && err.message.includes('JSON')) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: {
        name: 'SyntaxError',
        message: 'Invalid JSON',
        status: StatusCodes.BAD_REQUEST,
      },
    });
  }

  // Handle unknown errors
  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    error: {
      name: 'InternalServerError',
      message: 'Something went wrong',
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    },
  });
};
