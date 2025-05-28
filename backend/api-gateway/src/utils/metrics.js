/**
 * Metrics collection utility for API Gateway
 * Collects performance metrics for monitoring and analysis
 */

// In-memory storage for metrics
// In a production environment, this would be replaced with a proper metrics system like Prometheus
const metrics = {
  requestCount: 0,
  responseTimeTotal: 0,
  responseTimeAvg: 0,
  statusCodes: {},
  serviceLatency: {},
  errors: {},
  circuitBreakerTrips: {},
};

/**
 * Increment request count
 * @param {string} method - HTTP method
 * @param {string} path - Request path
 */
const incrementRequestCount = (method, path) => {
  metrics.requestCount++;
  
  // Track by method and path
  const key = `${method}:${path}`;
  metrics.endpoints = metrics.endpoints || {};
  metrics.endpoints[key] = (metrics.endpoints[key] || 0) + 1;
};

/**
 * Record response time
 * @param {number} time - Response time in milliseconds
 * @param {string} service - Service name
 */
const recordResponseTime = (time, service) => {
  metrics.responseTimeTotal += time;
  metrics.responseTimeAvg = metrics.responseTimeTotal / metrics.requestCount;
  
  // Track by service
  if (service) {
    metrics.serviceLatency[service] = metrics.serviceLatency[service] || { total: 0, count: 0, avg: 0 };
    metrics.serviceLatency[service].total += time;
    metrics.serviceLatency[service].count++;
    metrics.serviceLatency[service].avg = metrics.serviceLatency[service].total / metrics.serviceLatency[service].count;
  }
};

/**
 * Record status code
 * @param {number} statusCode - HTTP status code
 */
const recordStatusCode = (statusCode) => {
  metrics.statusCodes[statusCode] = (metrics.statusCodes[statusCode] || 0) + 1;
};

/**
 * Record error
 * @param {string} errorType - Type of error
 * @param {string} service - Service name (optional)
 */
const recordError = (errorType, service) => {
  metrics.errors[errorType] = (metrics.errors[errorType] || 0) + 1;
  
  if (service) {
    metrics.errors[`${service}:${errorType}`] = (metrics.errors[`${service}:${errorType}`] || 0) + 1;
  }
};

/**
 * Record circuit breaker trip
 * @param {string} service - Service name
 */
const recordCircuitBreakerTrip = (service) => {
  metrics.circuitBreakerTrips[service] = (metrics.circuitBreakerTrips[service] || 0) + 1;
};

/**
 * Get current metrics
 * @returns {Object} Current metrics
 */
const getMetrics = () => {
  return {
    ...metrics,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Reset metrics
 */
const resetMetrics = () => {
  metrics.requestCount = 0;
  metrics.responseTimeTotal = 0;
  metrics.responseTimeAvg = 0;
  metrics.statusCodes = {};
  metrics.serviceLatency = {};
  metrics.errors = {};
  metrics.circuitBreakerTrips = {};
  metrics.endpoints = {};
};

module.exports = {
  incrementRequestCount,
  recordResponseTime,
  recordStatusCode,
  recordError,
  recordCircuitBreakerTrip,
  getMetrics,
  resetMetrics,
};
