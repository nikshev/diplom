/**
 * Request validation middleware for Auth Service
 */

const { validationResult } = require('express-validator');
const { ValidationError } = require('../utils/errors');

/**
 * Middleware to validate request based on validation rules
 * @returns {Function} Express middleware
 */
const validate = () => {
  return (req, res, next) => {
    const errors = validationResult(req);
    
    if (errors.isEmpty()) {
      return next();
    }
    
    // Format validation errors
    const formattedErrors = errors.array().map(error => ({
      field: error.param,
      message: error.msg,
      value: error.value,
    }));
    
    // Throw validation error with formatted errors
    next(new ValidationError('Validation failed', formattedErrors));
  };
};

module.exports = {
  validate,
};
