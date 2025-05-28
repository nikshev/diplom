/**
 * Request validation middleware for Finance Service
 */

const { validationResult } = require('express-validator');
const { ValidationError } = require('../utils/errors');

/**
 * Validate request
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
const validator = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const validationErrors = {};
    
    errors.array().forEach((error) => {
      validationErrors[error.param] = error.msg;
    });
    
    return next(new ValidationError('Validation failed', validationErrors));
  }
  
  next();
};

module.exports = validator;
