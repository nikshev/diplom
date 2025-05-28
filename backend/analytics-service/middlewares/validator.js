/**
 * Request validator middleware for Analytics Service
 */

const { ValidationError } = require('../utils/errors');
const logger = require('../config/logger');

/**
 * Validate request against schema
 * @param {Object} schema - Validation schema
 * @returns {Function} Middleware function
 */
function validate(schema) {
  return (req, res, next) => {
    try {
      // Determine which part of the request to validate
      const toValidate = {};
      
      if (schema.params) {
        toValidate.params = req.params;
      }
      
      if (schema.query) {
        toValidate.query = req.query;
      }
      
      if (schema.body) {
        toValidate.body = req.body;
      }
      
      // Validate each part
      Object.keys(toValidate).forEach((key) => {
        if (schema[key]) {
          const { error, value } = schema[key].validate(toValidate[key], {
            abortEarly: false,
            stripUnknown: true,
          });
          
          if (error) {
            const errors = error.details.reduce((acc, detail) => {
              acc[detail.path.join('.')] = detail.message;
              return acc;
            }, {});
            
            throw new ValidationError('Validation error', errors);
          }
          
          // Replace request values with validated values
          req[key] = value;
        }
      });
      
      next();
    } catch (error) {
      if (error instanceof ValidationError) {
        logger.warn('Validation error', { errors: error.errors });
        next(error);
      } else {
        logger.error('Unexpected validation error', { error: error.message });
        next(new ValidationError('Validation error'));
      }
    }
  };
}

module.exports = validate;
