/**
 * Authentication controller for Auth Service
 */

const authService = require('../services/auth.service');
const { BadRequestError } = require('../utils/errors');

/**
 * Login user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      throw new BadRequestError('Email and password are required');
    }
    
    const result = await authService.login(email, password);
    
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Register new user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;
    
    if (!email || !password || !firstName || !lastName) {
      throw new BadRequestError('Email, password, first name, and last name are required');
    }
    
    const result = await authService.register({
      email,
      password,
      firstName,
      lastName,
      phone,
      role: 'employee', // Default role for new users
    });
    
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh tokens
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const refreshTokens = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      throw new BadRequestError('Refresh token is required');
    }
    
    const tokens = await authService.refreshTokens(refreshToken);
    
    res.status(200).json(tokens);
  } catch (error) {
    next(error);
  }
};

/**
 * Logout user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      throw new BadRequestError('Refresh token is required');
    }
    
    await authService.logout(refreshToken);
    
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

/**
 * Request password reset
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const requestPasswordReset = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      throw new BadRequestError('Email is required');
    }
    
    const result = await authService.requestPasswordReset(email);
    
    // In a real application, you would send the reset token to the user's email
    // For this example, we'll return it in the response
    res.status(200).json({
      message: 'Password reset requested successfully',
      resetToken: result.resetToken,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset password
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      throw new BadRequestError('Token and new password are required');
    }
    
    await authService.resetPassword(token, newPassword);
    
    res.status(200).json({
      message: 'Password reset successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getProfile = async (req, res, next) => {
  try {
    // User is attached to request by auth middleware
    res.status(200).json({
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  register,
  refreshTokens,
  logout,
  requestPasswordReset,
  resetPassword,
  getProfile,
};
