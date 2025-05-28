/**
 * Authentication routes for Auth Service
 */

const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth');
const { validate } = require('../middlewares/validator');

const router = express.Router();

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

// Password reset validation rules
const resetPasswordValidation = [
  body('token')
    .isString()
    .notEmpty()
    .withMessage('Token is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long'),
];

/**
 * @route POST /api/auth/login
 * @desc Login user and get tokens
 * @access Public
 */
router.post('/login', loginValidation, validate(), authController.login);

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', registerValidation, validate(), authController.register);

/**
 * @route POST /api/auth/refresh-token
 * @desc Refresh access token using refresh token
 * @access Public
 */
router.post('/refresh-token', authController.refreshTokens);

/**
 * @route POST /api/auth/logout
 * @desc Logout user and invalidate tokens
 * @access Public
 */
router.post('/logout', authController.logout);

/**
 * @route POST /api/auth/request-password-reset
 * @desc Request password reset
 * @access Public
 */
router.post('/request-password-reset', authController.requestPasswordReset);

/**
 * @route POST /api/auth/reset-password
 * @desc Reset password using token
 * @access Public
 */
router.post('/reset-password', resetPasswordValidation, validate(), authController.resetPassword);

/**
 * @route GET /api/auth/me
 * @desc Get current user profile
 * @access Private
 */
router.get('/me', authenticate(), authController.getProfile);

module.exports = router;
