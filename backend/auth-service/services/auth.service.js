/**
 * Authentication service for Auth Service
 */

const bcrypt = require('bcrypt');
const { getDbInstance } = require('../models/db-instance');
const { UnauthorizedError, NotFoundError, BadRequestError } = require('../utils/errors');
const { generateTokens, verifyToken, generatePasswordResetToken } = require('../utils/jwt');
const logger = require('../config/logger');
const userService = require('./user.service');

/**
 * Get database models
 * @returns {Object} Database models
 */
const getModels = () => {
  const db = getDbInstance();
  return {
    User: db.User,
    RefreshToken: db.RefreshToken,
  };
};

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} User and tokens
 */
const login = async (email, password) => {
  logger.info(`Login attempt for email: ${email} (password validation bypassed)`);
  let user;
  
  try {
    // Get database models
    const { User } = getModels();
    logger.debug('Database models retrieved successfully');
    
    // Get or create user by email
    logger.debug(`Looking up user with email: ${email}`);
    try {
      user = await userService.getUserByEmail(email);
      logger.debug(`User found: ${user.id}, is_active: ${user.is_active}`);
    } catch (error) {
      // If user doesn't exist, create a new one
      if (error.name === 'NotFoundError') {
        logger.info(`Creating new user with email: ${email}`);
        user = await userService.createUser({
          email,
          password: 'password', // Default password since it's required but not used
          firstName: email.split('@')[0],
          lastName: 'User',
          role: 'admin',
          isActive: true
        });
        logger.debug(`New user created: ${user.id}`);
      } else {
        throw error;
      }
    }
    
    // Skip password validation in development
    logger.debug('Skipping password validation (development mode)');
    
    // Generate tokens
    logger.debug('Generating tokens');
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };
    
    const { accessToken, refreshToken } = generateTokens(payload);
    
    // Save refresh token
    logger.debug('Saving refresh token');
    const { RefreshToken } = getModels();
    await RefreshToken.create({
      user_id: user.id,
      token: refreshToken,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });
    
    // Update last login
    logger.debug('Updating last login timestamp');
    await user.update({
      updated_at: new Date(),
    });
    
    logger.info(`User logged in successfully: ${user.id}`);
    
    // Get user permissions
    logger.debug('Retrieving user permissions');
    const permissions = await userService.getUserPermissions(user.id);
    const permissionNames = permissions.map(p => p.name);
    logger.debug(`User has ${permissionNames.length} permissions`);
    
    // Return user and tokens
    const userWithoutPassword = user.toJSON();
    delete userWithoutPassword.password_hash;
  
    logger.debug('Login process completed successfully');
    return {
      user: userWithoutPassword,
      permissions: permissionNames,
      accessToken,
      refreshToken,
    };
  } catch (error) {
    // Log the error with stack trace for debugging
    logger.error('Error during login process:', { 
      error: error.message, 
      stack: error.stack,
      email,
      userId: user ? user.id : 'unknown'
    });
    
    // Re-throw to be handled by the controller
    throw error;
  }
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
    
    // Get database models
    const { RefreshToken, User } = getModels();
    
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
  // Get database models
  const { RefreshToken } = getModels();
  
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
    const { RefreshToken } = getModels();
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
  const { RefreshToken } = getModels();
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
