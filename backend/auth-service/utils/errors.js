/**
 * Custom error classes for Auth Service
 */

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
    super(message, 400);
  }
}

/**
 * Unauthorized Error (401)
 */
class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

/**
 * Forbidden Error (403)
 */
class ForbiddenError extends ApiError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

/**
 * Not Found Error (404)
 */
class NotFoundError extends ApiError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

/**
 * Conflict Error (409)
 */
class ConflictError extends ApiError {
  constructor(message = 'Conflict') {
    super(message, 409);
  }
}

/**
 * Validation Error (422)
 */
class ValidationError extends ApiError {
  constructor(message = 'Validation Error', errors = []) {
    super(message, 422);
    this.errors = errors;
  }
}

/**
 * Internal Server Error (500)
 */
class InternalServerError extends ApiError {
  constructor(message = 'Internal Server Error') {
    super(message, 500);
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
};
