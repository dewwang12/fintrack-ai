const mongoose = require('mongoose');
const winston = require('winston');

// Access logger configured globally (we will define logger.js next)
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI;
    if (!connStr) {
      logger.error('Database connection failed: MONGODB_URI environment variable is missing.');
      process.exit(1);
    }

    const conn = await mongoose.connect(connStr, {
      autoIndex: true, // Auto-build indexes in dev; should be disabled in extreme scale production, but vital for relational integrity here
    });

    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`Database connection error: ${error.message}`);
    process.exit(1);
  }
};

// Monitor connection events
mongoose.connection.on('error', (err) => {
  logger.error(`MongoDB connection runtime error: ${err}`);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB connection lost. Reconnecting...');
});

// If the Node process ends, close the Mongoose connection 
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  logger.info('MongoDB connection closed through app termination.');
  process.exit(0);
});

module.exports = connectDB;
