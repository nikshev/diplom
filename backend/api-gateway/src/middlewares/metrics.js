/**
 * Metrics middleware for API Gateway
 * Collects performance metrics for each request
 */

const {
  incrementRequestCount,
  recordResponseTime,
  recordStatusCode,
  recordError,
} = require('../utils/metrics');

/**
 * Middleware to collect request metrics
 * @returns {Function} Express middleware
 */
const collectMetrics = () => {
  return (req, res, next) => {
    // Record start time
    const startTime = Date.now();
    
    // Extract service name from path
    const pathParts = req.path.split('/');
    const service = pathParts.length > 2 ? pathParts[2] : 'unknown';
    
    // Increment request count
    incrementRequestCount(req.method, req.path);
    
    // Add response listener to collect metrics when response is sent
    res.on('finish', () => {
      // Calculate response time
      const responseTime = Date.now() - startTime;
      
      // Record metrics
      recordResponseTime(responseTime, service);
      recordStatusCode(res.statusCode);
      
      // Record errors for non-2xx responses
      if (res.statusCode >= 400) {
        recordError(`${res.statusCode}`, service);
      }
    });
    
    next();
  };
};

module.exports = {
  collectMetrics,
};
