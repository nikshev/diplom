/**
 * Proxy utilities for API Gateway
 */

const httpProxy = require('express-http-proxy');
const { URL } = require('url');
const logger = require('../config/logger');
const { ServiceUnavailableError, GatewayTimeoutError } = require('./errors');
const { getCircuitBreaker, STATES } = require('./circuit-breaker');

/**
 * Create proxy middleware for a service
 * @param {string} serviceName - Name of the service
 * @param {string} serviceUrl - URL of the service
 * @param {Object} options - Additional proxy options
 * @returns {Function} Express middleware
 */
const createServiceProxy = (serviceName, serviceUrl, options = {}) => {
  const url = new URL(serviceUrl);
  
  // Create circuit breaker for this service
  const circuitBreaker = getCircuitBreaker(serviceName, {
    failureThreshold: options.failureThreshold || 5,
    resetTimeout: options.resetTimeout || 30000,
  });
  
  // Create proxy instance
  const proxy = httpProxy(url.origin, {
    // Append path from the gateway to the target service
    proxyReqPathResolver: (req) => {
      const path = req.originalUrl;
      logger.debug(`Proxying request to ${serviceName}: ${path}`);
      return path;
    },
    
    // Add service name and correlation ID to request headers
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      proxyReqOpts.headers['x-forwarded-service'] = serviceName;
      
      // Forward correlation ID if present
      if (srcReq.correlationId) {
        proxyReqOpts.headers['x-correlation-id'] = srcReq.correlationId;
      }
      
      return proxyReqOpts;
    },
    
    // Handle proxy errors
    proxyErrorHandler: (err, res, next) => {
      logger.error(`Proxy error for ${serviceName}:`, err);
      
      // Record failure in circuit breaker
      circuitBreaker.recordFailure();
      
      if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
        return next(new ServiceUnavailableError(`${serviceName} service is unavailable`));
      }
      
      if (err.code === 'ETIMEDOUT') {
        return next(new GatewayTimeoutError(`${serviceName} service timed out`));
      }
      
      next(err);
    },
    
    // Default timeout
    timeout: options.timeout || 5000,
    
    // Process response from service
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
      // Reset circuit breaker on successful response
      if (proxyRes.statusCode < 500) {
        if (circuitBreaker.getState() === STATES.HALF_OPEN) {
          circuitBreaker.reset();
          logger.info(`Circuit for ${serviceName} closed after successful response`);
        }
      } else {
        // Record failure for 5xx responses
        circuitBreaker.recordFailure();
        logger.warn(`Received ${proxyRes.statusCode} from ${serviceName}, recording failure`);
      }
      
      return proxyResData;
    },
    
    // Additional options
    ...options,
  });
  
  // Return middleware that checks circuit breaker before proxying
  return (req, res, next) => {
    const state = circuitBreaker.getState();
    
    // If circuit is open, fail fast
    if (state === STATES.OPEN) {
      logger.warn(`Circuit for ${serviceName} is open, rejecting request`);
      return next(new ServiceUnavailableError(`${serviceName} service is temporarily unavailable`));
    }
    
    // If circuit is half-open, only allow one test request
    if (state === STATES.HALF_OPEN && !circuitBreaker.halfOpenAllowed) {
      logger.warn(`Circuit for ${serviceName} is half-open but test request already in progress`);
      return next(new ServiceUnavailableError(`${serviceName} service is temporarily unavailable`));
    }
    
    // Allow request to proceed to proxy
    proxy(req, res, next);
  };
};

module.exports = {
  createServiceProxy,
};
