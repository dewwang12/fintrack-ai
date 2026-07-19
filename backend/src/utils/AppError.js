/**
 * Custom Error Class to handle operational errors in the application.
 * Operational errors are expected runtime errors (e.g., validation failures, resource not found, unauthorized operations).
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    // Status is fail for client errors (4xx) and error for server errors (5xx)
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    
    // Identifies this error as operational (known type), so we can send clean JSON messages to the client
    this.isOperational = true;

    // Capture the stack trace, excluding the constructor call itself
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
