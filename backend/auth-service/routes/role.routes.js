/**
 * Role routes for Auth Service
 */

const express = require('express');
const { body, param } = require('express-validator');
const roleController = require('../controllers/role.controller');
const { authenticate, authorize } = require('../middlewares/auth');
const { validate } = require('../middlewares/validator');

const router = express.Router();

// UUID validation rule
const uuidValidation = param('id')
  .isUUID()
  .withMessage('Invalid ID format');

// Role creation/update validation rules
const roleValidation = [
  body('name')
    .isString()
    .notEmpty()
    .withMessage('Role name is required')
    .isLength({ min: 3, max: 50 })
    .withMessage('Role name must be between 3 and 50 characters'),
  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string'),
];

// Permission assignment validation rules
const permissionAssignmentValidation = [
  body('permissionIds')
    .isArray()
    .withMessage('Permission IDs must be an array')
    .notEmpty()
    .withMessage('At least one permission ID is required'),
  body('permissionIds.*')
    .isUUID()
    .withMessage('All permission IDs must be valid UUIDs'),
];

/**
 * @route GET /api/roles
 * @desc Get all roles with pagination and filtering
 * @access Private
 */
router.get(
  '/',
  authenticate(),
  authorize(['roles:read', 'roles:all']),
  roleController.getRoles
);

/**
 * @route GET /api/roles/:id
 * @desc Get role by ID
 * @access Private
 */
router.get(
  '/:id',
  authenticate(),
  authorize(['roles:read', 'roles:all']),
  uuidValidation,
  validate(),
  roleController.getRoleById
);

/**
 * @route POST /api/roles
 * @desc Create a new role
 * @access Private
 */
router.post(
  '/',
  authenticate(),
  authorize(['roles:create', 'roles:all']),
  roleValidation,
  validate(),
  roleController.createRole
);

/**
 * @route PUT /api/roles/:id
 * @desc Update role
 * @access Private
 */
router.put(
  '/:id',
  authenticate(),
  authorize(['roles:update', 'roles:all']),
  uuidValidation,
  roleValidation,
  validate(),
  roleController.updateRole
);

/**
 * @route DELETE /api/roles/:id
 * @desc Delete role
 * @access Private
 */
router.delete(
  '/:id',
  authenticate(),
  authorize(['roles:delete', 'roles:all']),
  uuidValidation,
  validate(),
  roleController.deleteRole
);

/**
 * @route POST /api/roles/:id/permissions
 * @desc Assign permissions to role
 * @access Private
 */
router.post(
  '/:id/permissions',
  authenticate(),
  authorize(['permissions:assign', 'permissions:all']),
  uuidValidation,
  permissionAssignmentValidation,
  validate(),
  roleController.assignPermissions
);

module.exports = router;
