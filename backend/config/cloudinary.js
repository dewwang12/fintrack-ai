const cloudinary = require('cloudinary').v2;
const logger = require('../src/utils/logger');

// Configure Cloudinary credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

logger.info('Cloudinary SDK initialized successfully.');

module.exports = cloudinary;
