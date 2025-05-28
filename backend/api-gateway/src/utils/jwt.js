/**
 * JWT utilities for API Gateway
 */

const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');
const { UnauthorizedError } = require('./errors');
const { isTokenBlacklisted, blacklistToken } = require('./token-blacklist');

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
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @param {string} type - Token type ('access' or 'refresh')
 * @returns {Object} Decoded token payload
 * @throws {UnauthorizedError} If token is invalid or expired
 */
const verifyToken = (token, type = 'access') => {
  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    
    // Check if token type matches
    if (decoded.type !== type) {
      throw new UnauthorizedError(`Invalid token type: expected ${type}`);
    }
    
    // Check if token is blacklisted
    if (decoded.jti && isTokenBlacklisted(decoded.jti)) {
      throw new UnauthorizedError('Token has been revoked');
    }
    
    return decoded;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw error;
    }
    
    if (error.name === 'TokenExpiredError') {
      throw new UnauthorizedError('Token expired');
    }
    
    throw new UnauthorizedError('Invalid token');
  }
};

/**
 * Extract token from authorization header
 * @param {string} authHeader - Authorization header
 * @returns {string|null} Extracted token or null if not found
 */
const extractTokenFromHeader = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.split(' ')[1];
};

/**
 * Revoke a token by adding it to the blacklist
 * @param {string} token - JWT token to revoke
 * @returns {boolean} True if token was revoked successfully
 */
const revokeToken = (token) => {
  try {
    const decoded = jwt.decode(token);
    
    if (!decoded || !decoded.jti || !decoded.exp) {
      return false;
    }
    
    blacklistToken(decoded.jti, decoded.exp);
    return true;
  } catch (error) {
    return false;
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateTokens,
  verifyToken,
  extractTokenFromHeader,
  revokeToken,
};
