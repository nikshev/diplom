/**
 * User routes for Auth Service
 */

const express = require('express');
const { body, param } = require('express-validator');
const userController = require('../controllers/user.controller');
const { authenticate, authorize, authorizeRole } = require('../middlewares/auth');
const { validate } = require('../middlewares/validator');

const router = express.Router();

// UUID validation rule
const uuidValidation = param('id')
  .isUUID()
  .withMessage('Invalid ID format');

// User creation validation rules
const createUserValidation = [
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
  body('role')
    .optional()
    .isIn(['admin', 'manager', 'employee'])
    .withMessage('Role must be one of: admin, manager, employee'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];

// User update validation rules
const updateUserValidation = [
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('firstName')
    .optional()
    .isString()
    .notEmpty()
    .withMessage('First name cannot be empty'),
  body('lastName')
    .optional()
    .isString()
    .notEmpty()
    .withMessage('Last name cannot be empty'),
  body('role')
    .optional()
    .isIn(['admin', 'manager', 'employee'])
    .withMessage('Role must be one of: admin, manager, employee'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];

// Password change validation rules
const changePasswordValidation = [
  body('currentPassword')
    .isString()
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long'),
];

/**
 * @route GET /api/users
 * @desc Get all users with pagination and filtering
 * @access Private (Admin, Manager)
 */
router.get(
  '/',
  authenticate(),
  authorize(['users:read', 'users:all']),
  userController.getUsers
);

/**
 * @route GET /api/users/:id
 * @desc Get user by ID
 * @access Private (Admin, Manager, or Self)
 */
router.get(
  '/:id',
  authenticate(),
  uuidValidation,
  validate(),
  (req, res, next) => {
    // Allow users to access their own profile
    if (req.user.id === req.params.id) {
      return next();
    }
    // Otherwise, check permissions
    authorize(['users:read', 'users:all'])(req, res, next);
  },
  userController.getUserById
);

/**
 * @route POST /api/users
 * @desc Create a new user
 * @access Private (Admin)
 */
router.post(
  '/',
  authenticate(),
  authorize(['users:create', 'users:all']),
  createUserValidation,
  validate(),
  userController.createUser
);

/**
 * @route PUT /api/users/:id
 * @desc Update user
 * @access Private (Admin, or Self with limited fields)
 */
router.put(
  '/:id',
  authenticate(),
  uuidValidation,
  updateUserValidation,
  validate(),
  (req, res, next) => {
    // Allow users to update their own profile with limited fields
    if (req.user.id === req.params.id) {
      // Restrict fields that users can update for themselves
      const allowedFields = ['firstName', 'lastName', 'phone'];
      const requestedFields = Object.keys(req.body);
      
      const hasDisallowedFields = requestedFields.some(field => !allowedFields.includes(field));
      
      if (hasDisallowedFields) {
        return authorize(['users:update', 'users:all'])(req, res, next);
      }
      
      return next();
    }
    
    // Otherwise, check permissions
    authorize(['users:update', 'users:all'])(req, res, next);
  },
  userController.updateUser
);

/**
 * @route DELETE /api/users/:id
 * @desc Delete user
 * @access Private (Admin)
 */
router.delete(
  '/:id',
  authenticate(),
  authorize(['users:delete', 'users:all']),
  uuidValidation,
  validate(),
  userController.deleteUser
);

/**
 * @route PUT /api/users/:id/change-password
 * @desc Change user password
 * @access Private (Admin, or Self)
 */
router.put(
  '/:id/change-password',
  authenticate(),
  uuidValidation,
  changePasswordValidation,
  validate(),
  (req, res, next) => {
    // Allow users to change their own password
    if (req.user.id === req.params.id) {
      return next();
    }
    // Otherwise, check permissions
    authorize(['users:update', 'users:all'])(req, res, next);
  },
  userController.changePassword
);

/**
 * @route GET /api/users/:id/permissions
 * @desc Get user permissions
 * @access Private (Admin, Manager, or Self)
 */
router.get(
  '/:id/permissions',
  authenticate(),
  uuidValidation,
  validate(),
  (req, res, next) => {
    // Allow users to view their own permissions
    if (req.user.id === req.params.id) {
      return next();
    }
    // Otherwise, check permissions
    authorize(['users:read', 'users:all'])(req, res, next);
  },
  userController.getUserPermissions
);

module.exports = router;
