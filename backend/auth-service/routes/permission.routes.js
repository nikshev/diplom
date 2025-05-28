/**
 * Permission routes for Auth Service
 */

const express = require('express');
const { body, param } = require('express-validator');
const permissionController = require('../controllers/permission.controller');
const { authenticate, authorize } = require('../middlewares/auth');
const { validate } = require('../middlewares/validator');

const router = express.Router();

// UUID validation rule
const uuidValidation = param('id')
  .isUUID()
  .withMessage('Invalid ID format');

// Permission creation/update validation rules
const permissionValidation = [
  body('name')
    .isString()
    .notEmpty()
    .withMessage('Permission name is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Permission name must be between 3 and 100 characters'),
  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string'),
  body('resource')
    .isString()
    .notEmpty()
    .withMessage('Resource is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Resource must be between 3 and 100 characters'),
  body('action')
    .isString()
    .notEmpty()
    .withMessage('Action is required')
    .isLength({ min: 3, max: 50 })
    .withMessage('Action must be between 3 and 50 characters'),
];

/**
 * @route GET /api/permissions
 * @desc Get all permissions with pagination and filtering
 * @access Private
 */
router.get(
  '/',
  authenticate(),
  authorize(['permissions:read', 'permissions:all']),
  permissionController.getPermissions
);

/**
 * @route GET /api/permissions/:id
 * @desc Get permission by ID
 * @access Private
 */
router.get(
  '/:id',
  authenticate(),
  authorize(['permissions:read', 'permissions:all']),
  uuidValidation,
  validate(),
  permissionController.getPermissionById
);

/**
 * @route POST /api/permissions
 * @desc Create a new permission
 * @access Private
 */
router.post(
  '/',
  authenticate(),
  authorize(['permissions:create', 'permissions:all']),
  permissionValidation,
  validate(),
  permissionController.createPermission
);

/**
 * @route PUT /api/permissions/:id
 * @desc Update permission
 * @access Private
 */
router.put(
  '/:id',
  authenticate(),
  authorize(['permissions:update', 'permissions:all']),
  uuidValidation,
  permissionValidation,
  validate(),
  permissionController.updatePermission
);

/**
 * @route DELETE /api/permissions/:id
 * @desc Delete permission
 * @access Private
 */
router.delete(
  '/:id',
  authenticate(),
  authorize(['permissions:delete', 'permissions:all']),
  uuidValidation,
  validate(),
  permissionController.deletePermission
);

/**
 * @route GET /api/permissions/resources
 * @desc Get unique resources
 * @access Private
 */
router.get(
  '/resources',
  authenticate(),
  authorize(['permissions:read', 'permissions:all']),
  permissionController.getResources
);

/**
 * @route GET /api/permissions/actions
 * @desc Get unique actions
 * @access Private
 */
router.get(
  '/actions',
  authenticate(),
  authorize(['permissions:read', 'permissions:all']),
  permissionController.getActions
);

module.exports = router;
