/**
 * Correlation ID middleware for API Gateway
 * Adds a unique correlation ID to each request for tracing across services
 */

const { v4: uuidv4 } = require('uuid');

/**
 * Middleware to add correlation ID to requests
 * @returns {Function} Express middleware
 */
const correlationId = () => {
  return (req, res, next) => {
    // Check if correlation ID already exists in headers
    const existingCorrelationId = req.headers['x-correlation-id'];
    
    // Use existing correlation ID or generate a new one
    const id = existingCorrelationId || uuidv4();
    
    // Add correlation ID to request object and headers
    req.correlationId = id;
    req.headers['x-correlation-id'] = id;
    
    // Add correlation ID to response headers
    res.setHeader('X-Correlation-ID', id);
    
    next();
  };
};

module.exports = {
  correlationId,
};
