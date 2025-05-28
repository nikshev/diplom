/**
 * JWT utilities for Auth Service
 */

const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');

/**
 * Generate access token
 * @param {Object} payload - Token payload
 * @returns {string} JWT token
 */
const generateAccessToken = (payload) => {
  return jwt.sign(
    {
      ...payload,
      type: 'access',
      jti: uuidv4(), // JWT ID for token uniqueness
    },
    config.jwt.secret,
    { expiresIn: config.jwt.accessTokenExpiry }
  );
};

/**
 * Generate refresh token
 * @param {Object} payload - Token payload
 * @returns {string} JWT token
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(
    {
      ...payload,
      type: 'refresh',
      jti: uuidv4(), // JWT ID for token uniqueness
    },
    config.jwt.secret,
    { expiresIn: config.jwt.refreshTokenExpiry }
  );
};

/**
 * Generate token pair (access and refresh)
 * @param {Object} payload - Token payload
 * @returns {Object} Object with access and refresh tokens
 */
const generateTokens = (payload) => {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  
  return {
    accessToken,
    refreshToken,
  };
};

/**
 * Generate password reset token
 * @param {Object} payload - Token payload
 * @returns {string} JWT token
 */
const generatePasswordResetToken = (payload) => {
  return jwt.sign(
    {
      ...payload,
      type: 'password_reset',
      jti: uuidv4(), // JWT ID for token uniqueness
    },
    config.jwt.secret,
    { expiresIn: config.passwordReset.tokenExpiry }
  );
};

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @param {string} type - Token type ('access', 'refresh', or 'password_reset')
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
const verifyToken = (token, type = 'access') => {
  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    
    // Check if token type matches
    if (decoded.type !== type) {
      throw new Error(`Invalid token type: expected ${type}`);
    }
    
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expired');
    }
    
    throw new Error('Invalid token');
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateTokens,
  generatePasswordResetToken,
  verifyToken,
};
