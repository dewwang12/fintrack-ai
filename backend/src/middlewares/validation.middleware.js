const AppError = require('../utils/AppError');

/**
 * Express middleware to validate request structures against Zod schemas.
 * Throws an operational AppError containing array details on mismatch.
 */
const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    
    // Assign validated/sanitized data back to request object
    req.body = parsed.body || req.body;
    req.query = parsed.query || req.query;
    req.params = parsed.params || req.params;
    
    next();
  } catch (error) {
    // If validation fails, extract clean error messages
    const errorMessages = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`);
    const validationError = new AppError('Validation failed', 400);
    validationError.details = errorMessages;
    
    next(validationError);
  }
};

module.exports = validate;
