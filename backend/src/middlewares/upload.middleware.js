const multer = require('multer');
const AppError = require('../utils/AppError');

// Memory storage keeps files as buffer streams in memory to avoid writing temporary files to local disk
const storage = multer.memoryStorage();

// File filter restricting types to image files and PDFs
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        'Invalid file type. Only JPG, JPEG, PNG images and PDF documents are allowed.',
        400
      ),
      false
    );
  }
};

// Define limits and initialize Multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

module.exports = upload;
