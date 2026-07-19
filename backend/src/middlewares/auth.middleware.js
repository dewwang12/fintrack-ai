const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Middleware to verify Access Token in Authorization header
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1. Get token from authorization headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in. Please log in to get access.', 401)
    );
  }

  // 2. Verify token
  const secret = process.env.ACCESS_TOKEN_SECRET;
  if (!secret) {
    return next(new Error('ACCESS_TOKEN_SECRET environment variable is missing.'));
  }

  try {
    const decoded = jwt.verify(token, secret);

    // 3. Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(
        new AppError('The user belonging to this token no longer exists.', 401)
      );
    }

    // 4. Grant access to protected route by attaching user to request
    req.user = currentUser;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Your access token has expired.', 401));
    }
    return next(new AppError('Invalid access token.', 401));
  }
});

/**
 * Authorization role restriction guard
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    // req.user is populated by protect middleware
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

module.exports = {
  protect,
  restrictTo,
};
