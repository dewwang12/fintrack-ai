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

const PORT = process.env.PORT || 5000;

// Start server after successful DB connection
const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(PORT, () => {
      logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });

    // Catch asynchronous promise rejections
    process.on('unhandledRejection', (err) => {
      logger.error('UNHANDLED REJECTION! 💥 Shutting down gracefully...');
      logger.error(err.name, err.message, err.stack);
      server.close(() => {
        process.exit(1);
      });
    });
  } catch (err) {
    logger.error('Failed to start server due to DB connection error:', err);
    process.exit(1);
  }
};

startServer();
