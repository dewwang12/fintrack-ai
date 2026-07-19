// Load environment variables as early as possible
require('dotenv').config();

const logger = require('./utils/logger');

// Catch synchronous exceptions that weren't handled anywhere else
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  logger.error(err.name, err.message, err.stack);
  process.exit(1);
});

const app = require('./app');
const connectDB = require('../config/db');

// Connect to Database
connectDB();

const PORT = process.env.PORT || 5000;

// Start server listening
const server = app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Catch asynchronous promise rejections (e.g. database query failures)
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down gracefully...');
  logger.error(err.name, err.message, err.stack);
  
  // Close server first, then exit process to let existing requests finish
  server.close(() => {
    process.exit(1);
  });
});
