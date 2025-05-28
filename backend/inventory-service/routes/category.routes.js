/**
 * Category routes for Inventory Service
 */

const express = require('express');
const { body, param, query } = require('express-validator');
const validator = require('../middlewares/validator');
const auth = require('../middlewares/auth');

/**
 * Create category routes
 * @param {Object} categoryController - Category controller
 * @returns {Object} Router
 */
const createCategoryRoutes = (categoryController) => {
  const router = express.Router();

  /**
   * @route GET /api/categories
   * @description Get all categories with optional filtering
   * @access Public
   */
  router.get(
    '/',
    [
      query('includeInactive').optional().isBoolean().withMessage('includeInactive must be a boolean'),
      query('parentId').optional().isInt().withMessage('parentId must be an integer'),
      query('includeProducts').optional().isBoolean().withMessage('includeProducts must be a boolean'),
      query('search').optional().isString().withMessage('search must be a string'),
      validator,
    ],
    categoryController.getCategories
  );

  /**
   * @route GET /api/categories/:id
   * @description Get category by ID
   * @access Public
   */
  router.get(
    '/:id',
    [
      param('id').isInt().withMessage('Category ID must be an integer'),
      query('includeProducts').optional().isBoolean().withMessage('includeProducts must be a boolean'),
      query('includeSubcategories').optional().isBoolean().withMessage('includeSubcategories must be a boolean'),
      validator,
    ],
    categoryController.getCategoryById
  );

  /**
   * @route POST /api/categories
   * @description Create a new category
   * @access Private
   */
  router.post(
    '/',
    auth(['admin', 'inventory_manager']),
    [
      body('name').notEmpty().withMessage('Name is required').isString().withMessage('Name must be a string'),
      body('description').optional().isString().withMessage('Description must be a string'),
      body('parent_id').optional().isInt().withMessage('Parent ID must be an integer'),
      body('is_active').optional().isBoolean().withMessage('is_active must be a boolean'),
      validator,
    ],
    categoryController.createCategory
  );

  /**
   * @route PUT /api/categories/:id
   * @description Update a category
   * @access Private
   */
  router.put(
    '/:id',
    auth(['admin', 'inventory_manager']),
    [
      param('id').isInt().withMessage('Category ID must be an integer'),
      body('name').optional().isString().withMessage('Name must be a string'),
      body('description').optional().isString().withMessage('Description must be a string'),
      body('parent_id').optional().isInt().withMessage('Parent ID must be an integer'),
      body('is_active').optional().isBoolean().withMessage('is_active must be a boolean'),
      validator,
    ],
    categoryController.updateCategory
  );

  /**
   * @route DELETE /api/categories/:id
   * @description Delete a category
   * @access Private
   */
  router.delete(
    '/:id',
    auth(['admin', 'inventory_manager']),
    [
      param('id').isInt().withMessage('Category ID must be an integer'),
      validator,
    ],
    categoryController.deleteCategory
  );

  /**
   * @route GET /api/categories/tree
   * @description Get category tree
   * @access Public
   */
  router.get(
    '/tree',
    [
      query('rootId').optional().isInt().withMessage('rootId must be an integer'),
      validator,
    ],
    categoryController.getCategoryTree
  );

  /**
   * @route GET /api/categories/:id/breadcrumbs
   * @description Get category breadcrumbs
   * @access Public
   */
  router.get(
    '/:id/breadcrumbs',
    [
      param('id').isInt().withMessage('Category ID must be an integer'),
      validator,
    ],
    categoryController.getCategoryBreadcrumbs
  );

  return router;
};

module.exports = createCategoryRoutes;
