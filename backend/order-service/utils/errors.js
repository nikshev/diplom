/**
 * Custom error classes for Order Service
 */

/**
 * Base API error class
 */
class ApiError extends Error {
  /**
   * Constructor
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {Array|Object} errors - Additional error details
   */
  constructor(message, statusCode, errors = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errors = errors;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 400 Bad Request error
 */
class BadRequestError extends ApiError {
  /**
   * Constructor
   * @param {string} message - Error message
   * @param {Array|Object} errors - Additional error details
   */
  constructor(message = 'Bad Request', errors = null) {
    super(message, 400, errors);
  }
}

/**
 * 401 Unauthorized error
 */
class UnauthorizedError extends ApiError {
  /**
   * Constructor
   * @param {string} message - Error message
   */
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

/**
 * 403 Forbidden error
 */
class ForbiddenError extends ApiError {
  /**
   * Constructor
   * @param {string} message - Error message
   */
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

/**
 * 404 Not Found error
 */
class NotFoundError extends ApiError {
  /**
   * Constructor
   * @param {string} message - Error message
   */
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

/**
 * 409 Conflict error
 */
class ConflictError extends ApiError {
  /**
   * Constructor
   * @param {string} message - Error message
   */
  constructor(message = 'Conflict') {
    super(message, 409);
  }
}

/**
 * 422 Validation error
 */
class ValidationError extends ApiError {
  /**
   * Constructor
   * @param {string} message - Error message
   * @param {Array|Object} errors - Validation errors
   */
  constructor(message = 'Validation failed', errors = null) {
    super(message, 422, errors);
  }
}

/**
 * 500 Internal Server error
 */
class InternalServerError extends ApiError {
  /**
   * Constructor
   * @param {string} message - Error message
   */
  constructor(message = 'Internal Server Error') {
    super(message, 500);
  }
}

/**
 * 503 Service Unavailable error
 */
class ServiceUnavailableError extends ApiError {
  /**
   * Constructor
   * @param {string} message - Error message
   */
  constructor(message = 'Service Unavailable') {
    super(message, 503);
  }
}

module.exports = {
  ApiError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  InternalServerError,
  ServiceUnavailableError,
};
