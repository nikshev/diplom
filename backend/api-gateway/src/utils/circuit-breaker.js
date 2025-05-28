/**
 * Circuit Breaker utility for API Gateway
 * Implements the Circuit Breaker pattern to handle service failures gracefully
 */

const logger = require('../config/logger');

// Circuit breaker states
const STATES = {
  CLOSED: 'CLOSED',     // Normal operation, requests flow through
  OPEN: 'OPEN',         // Service is down, requests are rejected immediately
  HALF_OPEN: 'HALF_OPEN', // Testing if service is back up
};

/**
 * Circuit Breaker class
 */
class CircuitBreaker {
  /**
   * Create a circuit breaker
   * @param {string} serviceName - Name of the service
   * @param {Object} options - Circuit breaker options
   */
  constructor(serviceName, options = {}) {
    this.serviceName = serviceName;
    this.state = STATES.CLOSED;
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 30000; // 30 seconds
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.halfOpenAllowed = false;
  }

  /**
   * Execute a function with circuit breaker protection
   * @param {Function} fn - Function to execute
   * @returns {Promise} Result of the function
   * @throws {Error} If circuit is open or function fails
   */
  async execute(fn) {
    if (this.state === STATES.OPEN) {
      // Check if it's time to try half-open state
      const now = Date.now();
      const timeElapsed = now - this.lastFailureTime;
      
      if (timeElapsed > this.resetTimeout) {
        this.halfOpenAllowed = true;
        this.state = STATES.HALF_OPEN;
        logger.info(`Circuit for ${this.serviceName} entering half-open state`);
      } else {
        // Circuit is still open
        throw new Error(`Service ${this.serviceName} is unavailable (Circuit open)`);
      }
    }

    try {
      // Execute the function
      const result = await fn();
      
      // If successful in half-open state, reset circuit
      if (this.state === STATES.HALF_OPEN) {
        this.reset();
        logger.info(`Circuit for ${this.serviceName} is closed again`);
      }
      
      return result;
    } catch (error) {
      // Handle failure
      this.recordFailure();
      throw error;
    }
  }

  /**
   * Record a failure and potentially open the circuit
   */
  recordFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    // If in half-open state, any failure immediately opens the circuit
    if (this.state === STATES.HALF_OPEN) {
      this.state = STATES.OPEN;
      this.halfOpenAllowed = false;
      logger.warn(`Circuit for ${this.serviceName} reopened after test request failed`);
      return;
    }
    
    // If failure threshold reached, open the circuit
    if (this.state === STATES.CLOSED && this.failureCount >= this.failureThreshold) {
      this.state = STATES.OPEN;
      logger.warn(`Circuit for ${this.serviceName} opened after ${this.failureCount} consecutive failures`);
    }
  }

  /**
   * Reset the circuit breaker to closed state
   */
  reset() {
    this.failureCount = 0;
    this.state = STATES.CLOSED;
    this.halfOpenAllowed = false;
  }

  /**
   * Get current state of the circuit breaker
   * @returns {string} Current state
   */
  getState() {
    return this.state;
  }
}

// Store circuit breakers by service name
const circuitBreakers = new Map();

/**
 * Get or create a circuit breaker for a service
 * @param {string} serviceName - Name of the service
 * @param {Object} options - Circuit breaker options
 * @returns {CircuitBreaker} Circuit breaker instance
 */
const getCircuitBreaker = (serviceName, options = {}) => {
  if (!circuitBreakers.has(serviceName)) {
    circuitBreakers.set(serviceName, new CircuitBreaker(serviceName, options));
  }
  
  return circuitBreakers.get(serviceName);
};

module.exports = {
  getCircuitBreaker,
  STATES,
};
