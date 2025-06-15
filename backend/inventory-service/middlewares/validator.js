/**
 * Request validation middleware
 */

const { validationResult } = require('express-validator');
const { ValidationError } = require('../utils/errors');

/**
 * Validate request using express-validator
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
module.exports = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const validationErrors = errors.array().map(error => ({
      field: error.param,
      message: error.msg,
      value: error.value,
    }));
    
    return next(new ValidationError('Validation failed', validationErrors));
  }
  
  next();
};
