const authService = require('../services/auth.service');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

// Cookie options for secure storage
const cookieOptions = {
  httpOnly: true, // Prevents XSS script read access
  secure: process.env.NODE_ENV === 'production', // Sent only over HTTPS in production
  sameSite: 'strict', // Prevents CSRF attacks
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days matching token expiration
};

/**
 * Handle user registration request
 */
const register = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;
  const user = await authService.registerUser(name, email, password);

  res.status(201).json({
    success: true,
    data: { user },
  });
});

/**
 * Handle user login request
 */
const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const { user, accessToken, refreshToken } = await authService.loginUser(email, password);

  // Set refresh token in secure HTTP-only cookie
  res.cookie('refreshToken', refreshToken, cookieOptions);

  res.status(200).json({
    success: true,
    data: {
      user,
      accessToken,
    },
  });
});

/**
 * Handle refresh token request
 */
const refresh = asyncHandler(async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return next(new AppError('No refresh token provided', 401));
  }

  const { accessToken, user } = await authService.refreshAccessToken(refreshToken);

  res.status(200).json({
    success: true,
    data: {
      user,
      accessToken,
    },
  });
});

/**
 * Handle user logout request
 */
const logout = asyncHandler(async (req, res, next) => {
  // Clear the refresh token cookie
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

/**
 * Get details of logged-in user
 */
const getMe = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    success: true,
    data: {
      user: req.user,
    },
  });
});

module.exports = {
  register,
  login,
  refresh,
  logout,
  getMe,
};
