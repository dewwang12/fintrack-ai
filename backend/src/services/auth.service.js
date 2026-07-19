const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const AppError = require('../utils/AppError');

/**
 * Sign an Access Token (short-lived)
 */
const signAccessToken = (userId, role) => {
  const secret = process.env.ACCESS_TOKEN_SECRET;
  if (!secret) {
    throw new Error('ACCESS_TOKEN_SECRET environment variable is missing.');
  }
  return jwt.sign({ id: userId, role }, secret, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRE || '15m',
  });
};

/**
 * Sign a Refresh Token (long-lived)
 */
const signRefreshToken = (userId) => {
  const secret = process.env.REFRESH_TOKEN_SECRET;
  if (!secret) {
    throw new Error('REFRESH_TOKEN_SECRET environment variable is missing.');
  }
  return jwt.sign({ id: userId }, secret, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRE || '7d',
  });
};

/**
 * Register user business logic
 */
const registerUser = async (name, email, password) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('A user with this email already exists', 400);
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  // Exclude password from the returned object
  const userResponse = user.toObject();
  delete userResponse.password;

  return userResponse;
};

/**
 * Login user business logic
 */
const loginUser = async (email, password) => {
  // Explicitly select password since it defaults to select: false
  const user = await User.findOne({ email }).select('+password');
  
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Incorrect email or password', 401);
  }

  const userResponse = user.toObject();
  delete userResponse.password;

  const accessToken = signAccessToken(user._id, user.role);
  const refreshToken = signRefreshToken(user._id);

  return {
    user: userResponse,
    accessToken,
    refreshToken,
  };
};

/**
 * Refresh Access Token logic
 */
const refreshAccessToken = async (token) => {
  const secret = process.env.REFRESH_TOKEN_SECRET;
  if (!secret) {
    throw new Error('REFRESH_TOKEN_SECRET environment variable is missing.');
  }

  try {
    const decoded = jwt.verify(token, secret);
    const user = await User.findById(decoded.id);
    if (!user) {
      throw new AppError('User belonging to this token no longer exists', 401);
    }

    const accessToken = signAccessToken(user._id, user.role);
    return {
      accessToken,
      user,
    };
  } catch (err) {
    throw new AppError('Invalid or expired refresh token', 401);
  }
};

module.exports = {
  signAccessToken,
  signRefreshToken,
  registerUser,
  loginUser,
  refreshAccessToken,
};
