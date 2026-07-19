const winston = require('winston');
const path = require('path');

// Determine log levels based on environment
const level = process.env.NODE_ENV === 'production' ? 'info' : 'debug';

// Define log formatting
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }), // Include error stack traces
  winston.format.splat(),
  winston.format.json()
);

// Create Winston Logger instance
const logger = winston.createLogger({
  level,
  format: logFormat,
  transports: [
    // Write info and higher logs to combined.log
    new winston.transports.File({ 
      filename: path.join(__dirname, '../../logs/combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Write error logs to error.log
    new winston.transports.File({ 
      filename: path.join(__dirname, '../../logs/error.log'), 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// If not in production, log colorized output to console
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, stack }) => {
          return `[${timestamp}] ${level}: ${stack || message}`;
        })
      ),
    })
  );
}

module.exports = logger;
