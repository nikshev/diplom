/**
 * Custom error classes for Analytics Service
 */

/**
 * Base error class
 */
class BaseError extends Error {
  /**
   * Constructor
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {boolean} isOperational - Is this an operational error
   * @param {string} errorCode - Error code for client
   */
  constructor(message, statusCode, isOperational = true, errorCode = 'INTERNAL_ERROR') {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errorCode = errorCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * API error class
 */
class APIError extends BaseError {
  /**
   * Constructor
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {string} errorCode - Error code for client
   */
  constructor(message, statusCode = 500, errorCode = 'API_ERROR') {
    super(message, statusCode, true, errorCode);
  }
}

/**
 * Not found error class
 */
class NotFoundError extends BaseError {
  /**
   * Constructor
   * @param {string} message - Error message
   */
  constructor(message = 'Resource not found') {
    super(message, 404, true, 'NOT_FOUND');
  }
}

/**
 * Bad request error class
 */
class BadRequestError extends BaseError {
  /**
   * Constructor
   * @param {string} message - Error message
   */
  constructor(message = 'Bad request') {
    super(message, 400, true, 'BAD_REQUEST');
  }
}

/**
 * Unauthorized error class
 */
class UnauthorizedError extends BaseError {
  /**
   * Constructor
   * @param {string} message - Error message
   */
  constructor(message = 'Unauthorized') {
    super(message, 401, true, 'UNAUTHORIZED');
  }
}

/**
 * Forbidden error class
 */
class ForbiddenError extends BaseError {
  /**
   * Constructor
   * @param {string} message - Error message
   */
  constructor(message = 'Forbidden') {
    super(message, 403, true, 'FORBIDDEN');
  }
}

/**
 * Validation error class
 */
class ValidationError extends BaseError {
  /**
   * Constructor
   * @param {string} message - Error message
   * @param {Object} errors - Validation errors
   */
  constructor(message = 'Validation error', errors = {}) {
    super(message, 422, true, 'VALIDATION_ERROR');
    this.errors = errors;
  }
}

/**
 * Database error class
 */
class DatabaseError extends BaseError {
  /**
   * Constructor
   * @param {string} message - Error message
   */
  constructor(message = 'Database error') {
    super(message, 500, true, 'DATABASE_ERROR');
  }
}

/**
 * Data collection error class
 */
class DataCollectionError extends BaseError {
  /**
   * Constructor
   * @param {string} message - Error message
   * @param {string} source - Data source
   */
  constructor(message = 'Data collection error', source = 'unknown') {
    super(`${message} (source: ${source})`, 500, true, 'DATA_COLLECTION_ERROR');
    this.source = source;
  }
}

/**
 * Analytics error class
 */
class AnalyticsError extends BaseError {
  /**
   * Constructor
   * @param {string} message - Error message
   * @param {string} metric - Metric name
   */
  constructor(message = 'Analytics error', metric = 'unknown') {
    super(`${message} (metric: ${metric})`, 500, true, 'ANALYTICS_ERROR');
    this.metric = metric;
  }
}

module.exports = {
  BaseError,
  APIError,
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  ValidationError,
  DatabaseError,
  DataCollectionError,
  AnalyticsError,
};
