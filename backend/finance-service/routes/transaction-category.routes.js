/**
 * Transaction Category routes for Finance Service
 */

const express = require('express');
const { body, param, query } = require('express-validator');
const validator = require('../middlewares/validator');
const auth = require('../middlewares/auth');

/**
 * Create transaction category routes
 * @param {Object} transactionCategoryController - Transaction Category controller
 * @returns {Object} Router
 */
const createTransactionCategoryRoutes = (transactionCategoryController) => {
  const router = express.Router();

  /**
   * @route GET /api/transaction-categories
   * @description Get all transaction categories with optional filtering
   * @access Private
   */
  router.get(
    '/',
    auth(['admin', 'finance_manager', 'finance_viewer']),
    [
      query('type').optional().isIn(['income', 'expense']).withMessage('Type must be income or expense'),
      query('includeInactive').optional().isBoolean().withMessage('includeInactive must be a boolean'),
      query('parentId').optional().isUUID().withMessage('Parent ID must be a UUID'),
      query('search').optional().isString().withMessage('Search must be a string'),
      validator,
    ],
    transactionCategoryController.getCategories
  );

  /**
   * @route GET /api/transaction-categories/:id
   * @description Get transaction category by ID
   * @access Private
   */
  router.get(
    '/:id',
    auth(['admin', 'finance_manager', 'finance_viewer']),
    [
      param('id').isUUID().withMessage('Category ID must be a UUID'),
      query('includeTransactions').optional().isBoolean().withMessage('includeTransactions must be a boolean'),
      query('includeSubcategories').optional().isBoolean().withMessage('includeSubcategories must be a boolean'),
      validator,
    ],
    transactionCategoryController.getCategoryById
  );

  /**
   * @route POST /api/transaction-categories
   * @description Create a new transaction category
   * @access Private
   */
  router.post(
    '/',
    auth(['admin', 'finance_manager']),
    [
      body('name').notEmpty().withMessage('Name is required').isString().withMessage('Name must be a string'),
      body('type').notEmpty().withMessage('Type is required').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
      body('description').optional().isString().withMessage('Description must be a string'),
      body('parent_id').optional().isUUID().withMessage('Parent ID must be a UUID'),
      body('is_active').optional().isBoolean().withMessage('is_active must be a boolean'),
      body('color').optional().isString().withMessage('Color must be a string'),
      body('icon').optional().isString().withMessage('Icon must be a string'),
      validator,
    ],
    transactionCategoryController.createCategory
  );

  /**
   * @route PUT /api/transaction-categories/:id
   * @description Update a transaction category
   * @access Private
   */
  router.put(
    '/:id',
    auth(['admin', 'finance_manager']),
    [
      param('id').isUUID().withMessage('Category ID must be a UUID'),
      body('name').optional().isString().withMessage('Name must be a string'),
      body('type').optional().isIn(['income', 'expense']).withMessage('Type must be income or expense'),
      body('description').optional().isString().withMessage('Description must be a string'),
      body('parent_id').optional().isUUID().withMessage('Parent ID must be a UUID'),
      body('is_active').optional().isBoolean().withMessage('is_active must be a boolean'),
      body('color').optional().isString().withMessage('Color must be a string'),
      body('icon').optional().isString().withMessage('Icon must be a string'),
      validator,
    ],
    transactionCategoryController.updateCategory
  );

  /**
   * @route DELETE /api/transaction-categories/:id
   * @description Delete a transaction category
   * @access Private
   */
  router.delete(
    '/:id',
    auth(['admin', 'finance_manager']),
    [
      param('id').isUUID().withMessage('Category ID must be a UUID'),
      validator,
    ],
    transactionCategoryController.deleteCategory
  );

  /**
   * @route GET /api/transaction-categories/tree
   * @description Get transaction category tree
   * @access Private
   */
  router.get(
    '/tree',
    auth(['admin', 'finance_manager', 'finance_viewer']),
    [
      query('type').optional().isIn(['income', 'expense']).withMessage('Type must be income or expense'),
      validator,
    ],
    transactionCategoryController.getCategoryTree
  );

  /**
   * @route GET /api/transaction-categories/stats
   * @description Get transaction category statistics
   * @access Private
   */
  router.get(
    '/stats',
    auth(['admin', 'finance_manager', 'finance_viewer']),
    [
      query('startDate').notEmpty().withMessage('Start date is required').isISO8601().withMessage('Start date must be a valid ISO8601 date'),
      query('endDate').notEmpty().withMessage('End date is required').isISO8601().withMessage('End date must be a valid ISO8601 date'),
      query('type').optional().isIn(['income', 'expense']).withMessage('Type must be income or expense'),
      validator,
    ],
    transactionCategoryController.getCategoryStats
  );

  return router;
};

module.exports = createTransactionCategoryRoutes;
