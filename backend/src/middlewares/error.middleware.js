const logger = require('../utils/logger');

// Handles Mongoose Database Cast Errors (e.g. invalid ObjectIds)
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  const AppError = require('../utils/AppError');
  return new AppError(message, 400);
};

// Handles duplicate fields index errors in MongoDB
const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  const AppError = require('../utils/AppError');
  return new AppError(message, 400);
};

// Handles Mongoose validation errors
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  const AppError = require('../utils/AppError');
  return new AppError(message, 400);
};

// Handles Invalid JWT error
const handleJWTError = () => {
  const AppError = require('../utils/AppError');
  return new AppError('Invalid token. Please log in again.', 401);
};

// Handles Expired JWT error
const handleJWTExpiredError = () => {
  const AppError = require('../utils/AppError');
  return new AppError('Your token has expired! Please log in again.', 401);
};

// Send full detailed error in development environment
const sendErrorDev = (err, req, res) => {
  res.status(err.statusCode).json({
    success: false,
    status: err.status,
    error: err,
    message: err.message,
    details: err.details || null,
    stack: err.stack,
  });
};

// Send clean minimal error in production to secure server details
const sendErrorProd = (err, req, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message,
      details: err.details || null,
    });
  } else {
    // Programming or other unknown error: don't leak details
    logger.error('ERROR 💥', err);
    res.status(500).json({
      success: false,
      status: 'error',
      message: 'Something went wrong on the server',
    });
  }
};

/**
 * Global Express Error Handling Middleware
 */
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else {
    let error = Object.create(err);
    error.message = err.message;
    error.statusCode = err.statusCode;
    error.status = err.status;
    error.details = err.details;
    error.isOperational = err.isOperational;

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  }
};
