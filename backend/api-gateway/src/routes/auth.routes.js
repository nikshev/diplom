/**
 * Authentication routes for API Gateway
 */

const express = require('express');
const { body } = require('express-validator');
const config = require('../config');
const { createServiceProxy } = require('../utils/proxy');
const { authenticate } = require('../middlewares/auth');
const { validate } = require('../middlewares/validator');

const router = express.Router();

// Create proxy to auth service
const authServiceProxy = createServiceProxy(
  'auth-service',
  config.services.auth.url,
  { timeout: config.services.auth.timeout }
);

// Login validation rules
const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
];

// Register validation rules
const registerValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('firstName')
    .isString()
    .notEmpty()
    .withMessage('First name is required'),
  body('lastName')
    .isString()
    .notEmpty()
    .withMessage('Last name is required'),
];

// Routes

/**
 * @route POST /api/v1/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', registerValidation, validate(), authServiceProxy);

/**
 * @route POST /api/v1/auth/login
 * @desc Login user and get tokens
 * @access Public
 */
router.post('/login', loginValidation, validate(), authServiceProxy);

/**
 * @route POST /api/v1/auth/refresh-token
 * @desc Refresh access token using refresh token
 * @access Public
 */
router.post('/refresh-token', authServiceProxy);

/**
 * @route POST /api/v1/auth/logout
 * @desc Logout user and invalidate tokens
 * @access Private
 */
router.post('/logout', authenticate(), (req, res, next) => {
  // Get token from request
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token) {
    // Import revokeToken function
    const { revokeToken } = require('../utils/jwt');
    
    // Revoke the token by adding it to blacklist
    revokeToken(token);
    
    // Log the logout
    const logger = require('../config/logger');
    logger.info(`User ${req.user.id} logged out, token revoked`);
  }
  
  // Forward to auth service to handle any additional logout logic
  authServiceProxy(req, res, next);
});

/**
 * @route GET /api/v1/auth/me
 * @desc Get current user profile
 * @access Private
 */
router.get('/me', authenticate(), authServiceProxy);

/**
 * @route PUT /api/v1/auth/me
 * @desc Update current user profile
 * @access Private
 */
router.put('/me', authenticate(), authServiceProxy);

/**
 * @route PUT /api/v1/auth/change-password
 * @desc Change user password
 * @access Private
 */
router.put('/change-password', authenticate(), authServiceProxy);

module.exports = router;
