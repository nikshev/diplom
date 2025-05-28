/**
 * Authentication service for Auth Service
 */

const bcrypt = require('bcrypt');
const db = require('../models');
const { UnauthorizedError, NotFoundError, BadRequestError } = require('../utils/errors');
const { generateTokens, verifyToken, generatePasswordResetToken } = require('../utils/jwt');
const logger = require('../config/logger');
const userService = require('./user.service');

const User = db.User;
const RefreshToken = db.RefreshToken;

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} User and tokens
 */
const login = async (email, password) => {
  // Get user by email
  const user = await userService.getUserByEmail(email);
  
  // Check if user is active
  if (!user.is_active) {
    throw new UnauthorizedError('Account is disabled');
  }
  
  // Validate password
  const isPasswordValid = await user.validatePassword(password);
  if (!isPasswordValid) {
    throw new UnauthorizedError('Invalid credentials');
  }
  
  // Generate tokens
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };
  
  const { accessToken, refreshToken } = generateTokens(payload);
  
  // Save refresh token
  await RefreshToken.create({
    user_id: user.id,
    token: refreshToken,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  });
  
  // Update last login
  await user.update({
    updated_at: new Date(),
  });
  
  logger.info(`User logged in: ${user.id}`);
  
  // Get user permissions
  const permissions = await userService.getUserPermissions(user.id);
  const permissionNames = permissions.map(p => p.name);
  
  // Return user and tokens
  const userWithoutPassword = user.toJSON();
  delete userWithoutPassword.password_hash;
  
  return {
    user: userWithoutPassword,
    permissions: permissionNames,
    accessToken,
    refreshToken,
  };
};

/**
 * Refresh tokens
 * @param {string} token - Refresh token
 * @returns {Promise<Object>} New tokens
 */
const refreshTokens = async (token) => {
  try {
    // Verify refresh token
    const decoded = verifyToken(token, 'refresh');
    
    // Check if token exists in database
    const refreshToken = await RefreshToken.findOne({
      where: { token },
      include: [{
        model: User,
        as: 'user',
      }],
    });
    
    if (!refreshToken) {
      throw new UnauthorizedError('Invalid refresh token');
    }
    
    // Check if token is expired
    if (new Date(refreshToken.expires_at) < new Date()) {
      await refreshToken.destroy();
      throw new UnauthorizedError('Refresh token expired');
    }
    
    // Check if user is active
    if (!refreshToken.user.is_active) {
      throw new UnauthorizedError('Account is disabled');
    }
    
    // Generate new tokens
    const payload = {
      id: refreshToken.user.id,
      email: refreshToken.user.email,
      role: refreshToken.user.role,
    };
    
    const tokens = generateTokens(payload);
    
    // Delete old refresh token
    await refreshToken.destroy();
    
    // Save new refresh token
    await RefreshToken.create({
      user_id: refreshToken.user.id,
      token: tokens.refreshToken,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });
    
    logger.info(`Tokens refreshed for user: ${refreshToken.user.id}`);
    
    return tokens;
  } catch (error) {
    throw new UnauthorizedError('Invalid refresh token');
  }
};

/**
 * Logout user
 * @param {string} token - Refresh token
 * @returns {Promise<boolean>} Success
 */
const logout = async (token) => {
  // Delete refresh token
  const deleted = await RefreshToken.destroy({
    where: { token },
  });
  
  if (!deleted) {
    throw new NotFoundError('Token not found');
  }
  
  logger.info('User logged out');
  
  return true;
};

/**
 * Request password reset
 * @param {string} email - User email
 * @returns {Promise<Object>} Reset token
 */
const requestPasswordReset = async (email) => {
  // Get user by email
  const user = await userService.getUserByEmail(email);
  
  // Generate reset token
  const payload = {
    id: user.id,
    email: user.email,
  };
  
  const resetToken = generatePasswordResetToken(payload);
  
  logger.info(`Password reset requested for user: ${user.id}`);
  
  return {
    resetToken,
    userId: user.id,
  };
};

/**
 * Reset password
 * @param {string} token - Reset token
 * @param {string} newPassword - New password
 * @returns {Promise<boolean>} Success
 */
const resetPassword = async (token, newPassword) => {
  try {
    // Verify reset token
    const decoded = verifyToken(token, 'password_reset');
    
    // Reset password
    await userService.resetPassword(decoded.id, newPassword);
    
    // Invalidate all refresh tokens for user
    await RefreshToken.destroy({
      where: { user_id: decoded.id },
    });
    
    logger.info(`Password reset completed for user: ${decoded.id}`);
    
    return true;
  } catch (error) {
    throw new BadRequestError('Invalid or expired reset token');
  }
};

/**
 * Register new user
 * @param {Object} userData - User data
 * @returns {Promise<Object>} User and tokens
 */
const register = async (userData) => {
  // Create user
  const user = await userService.createUser(userData);
  
  // Generate tokens
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };
  
  const { accessToken, refreshToken } = generateTokens(payload);
  
  // Save refresh token
  await RefreshToken.create({
    user_id: user.id,
    token: refreshToken,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  });
  
  logger.info(`User registered: ${user.id}`);
  
  // Get user permissions
  const permissions = await userService.getUserPermissions(user.id);
  const permissionNames = permissions.map(p => p.name);
  
  return {
    user,
    permissions: permissionNames,
    accessToken,
    refreshToken,
  };
};

module.exports = {
  login,
  refreshTokens,
  logout,
  requestPasswordReset,
  resetPassword,
  register,
};
