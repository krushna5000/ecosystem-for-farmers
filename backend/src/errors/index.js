// Domain errors. Services throw these; middleware/errorHandler.js turns them into the HTTP response.
//
// `options.body` is a full response-body override. The ecosystem merged several legacy backends whose
// clients depend on their exact error JSON, so a service may pin the body of a specific failure.
// Without it, the body comes from the router's response style (see middleware/responseStyle.js).

export class AppError extends Error {
  constructor(message, statusCode = 500, { body, isOperational = true } = {}) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.status = statusCode; // Express / body-parser read `status`
    this.isOperational = isOperational;
    this.body = body;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Bad request", options) {
    super(message, 400, options);
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation failed", errors = [], options) {
    super(message, 400, options);
    this.errors = errors;
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Authentication required", options) {
    super(message, 401, options);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Insufficient permissions", options) {
    super(message, 403, options);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found", options) {
    super(message, 404, options);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource already exists", options) {
    super(message, 409, options);
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message = "Too many requests", options) {
    super(message, 429, options);
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message = "Service temporarily unavailable", options) {
    super(message, 503, options);
  }
}
