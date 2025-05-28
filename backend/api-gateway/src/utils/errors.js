/**
 * Custom error classes for API Gateway
 */

const { StatusCodes } = require('http-status-codes');

/**
 * Base API Error class
 */
class ApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Bad Request Error (400)
 */
class BadRequestError extends ApiError {
  constructor(message = 'Bad Request') {
    super(message, StatusCodes.BAD_REQUEST);
  }
}

/**
 * Unauthorized Error (401)
 */
class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized') {
    super(message, StatusCodes.UNAUTHORIZED);
  }
}

/**
 * Forbidden Error (403)
 */
class ForbiddenError extends ApiError {
  constructor(message = 'Forbidden') {
    super(message, StatusCodes.FORBIDDEN);
  }
}

/**
 * Not Found Error (404)
 */
class NotFoundError extends ApiError {
  constructor(message = 'Resource not found') {
    super(message, StatusCodes.NOT_FOUND);
  }
}

/**
 * Conflict Error (409)
 */
class ConflictError extends ApiError {
  constructor(message = 'Conflict') {
    super(message, StatusCodes.CONFLICT);
  }
}

/**
 * Validation Error (422)
 */
class ValidationError extends ApiError {
  constructor(message = 'Validation Error', errors = []) {
    super(message, StatusCodes.UNPROCESSABLE_ENTITY);
    this.errors = errors;
  }
}

/**
 * Service Unavailable Error (503)
 */
class ServiceUnavailableError extends ApiError {
  constructor(message = 'Service Unavailable') {
    super(message, StatusCodes.SERVICE_UNAVAILABLE);
  }
}

/**
 * Gateway Timeout Error (504)
 */
class GatewayTimeoutError extends ApiError {
  constructor(message = 'Gateway Timeout') {
    super(message, StatusCodes.GATEWAY_TIMEOUT);
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
  ServiceUnavailableError,
  GatewayTimeoutError,
};
