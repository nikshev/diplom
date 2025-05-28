/**
 * Transaction routes for Finance Service
 */

const express = require('express');
const { body, param, query } = require('express-validator');
const validator = require('../middlewares/validator');
const auth = require('../middlewares/auth');

/**
 * Create transaction routes
 * @param {Object} transactionController - Transaction controller
 * @returns {Object} Router
 */
const createTransactionRoutes = (transactionController) => {
  const router = express.Router();

  /**
   * @route GET /api/transactions
   * @description Get all transactions with pagination and filtering
   * @access Private
   */
  router.get(
    '/',
    auth(['admin', 'finance_manager', 'finance_viewer']),
    [
      query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
      query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
      query('type').optional().isIn(['income', 'expense']).withMessage('Type must be income or expense'),
      query('categoryId').optional().isUUID().withMessage('Category ID must be a UUID'),
      query('accountId').optional().isUUID().withMessage('Account ID must be a UUID'),
      query('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO8601 date'),
      query('endDate').optional().isISO8601().withMessage('End date must be a valid ISO8601 date'),
      query('minAmount').optional().isFloat({ min: 0 }).withMessage('Min amount must be a non-negative number'),
      query('maxAmount').optional().isFloat({ min: 0 }).withMessage('Max amount must be a non-negative number'),
      query('sortBy').optional().isString().withMessage('Sort by must be a string'),
      query('sortOrder').optional().isIn(['ASC', 'DESC']).withMessage('Sort order must be ASC or DESC'),
      validator,
    ],
    transactionController.getTransactions
  );

  /**
   * @route GET /api/transactions/:id
   * @description Get transaction by ID
   * @access Private
   */
  router.get(
    '/:id',
    auth(['admin', 'finance_manager', 'finance_viewer']),
    [
      param('id').isUUID().withMessage('Transaction ID must be a UUID'),
      validator,
    ],
    transactionController.getTransactionById
  );

  /**
   * @route POST /api/transactions
   * @description Create a new transaction
   * @access Private
   */
  router.post(
    '/',
    auth(['admin', 'finance_manager']),
    [
      body('type').notEmpty().withMessage('Type is required').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
      body('amount').notEmpty().withMessage('Amount is required').isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
      body('currency').optional().isString().withMessage('Currency must be a string'),
      body('category_id').notEmpty().withMessage('Category ID is required').isUUID().withMessage('Category ID must be a UUID'),
      body('account_id').notEmpty().withMessage('Account ID is required').isUUID().withMessage('Account ID must be a UUID'),
      body('description').optional().isString().withMessage('Description must be a string'),
      body('transaction_date').optional().isISO8601().withMessage('Transaction date must be a valid ISO8601 date'),
      body('order_id').optional().isUUID().withMessage('Order ID must be a UUID'),
      body('reference_id').optional().isString().withMessage('Reference ID must be a string'),
      body('reference_type').optional().isString().withMessage('Reference type must be a string'),
      validator,
    ],
    transactionController.createTransaction
  );

  /**
   * @route PUT /api/transactions/:id
   * @description Update a transaction
   * @access Private
   */
  router.put(
    '/:id',
    auth(['admin', 'finance_manager']),
    [
      param('id').isUUID().withMessage('Transaction ID must be a UUID'),
      body('type').optional().isIn(['income', 'expense']).withMessage('Type must be income or expense'),
      body('amount').optional().isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
      body('currency').optional().isString().withMessage('Currency must be a string'),
      body('category_id').optional().isUUID().withMessage('Category ID must be a UUID'),
      body('account_id').optional().isUUID().withMessage('Account ID must be a UUID'),
      body('description').optional().isString().withMessage('Description must be a string'),
      body('transaction_date').optional().isISO8601().withMessage('Transaction date must be a valid ISO8601 date'),
      body('order_id').optional().isUUID().withMessage('Order ID must be a UUID'),
      body('reference_id').optional().isString().withMessage('Reference ID must be a string'),
      body('reference_type').optional().isString().withMessage('Reference type must be a string'),
      validator,
    ],
    transactionController.updateTransaction
  );

  /**
   * @route DELETE /api/transactions/:id
   * @description Delete a transaction
   * @access Private
   */
  router.delete(
    '/:id',
    auth(['admin', 'finance_manager']),
    [
      param('id').isUUID().withMessage('Transaction ID must be a UUID'),
      validator,
    ],
    transactionController.deleteTransaction
  );

  /**
   * @route GET /api/transactions/category/:categoryId
   * @description Get transactions by category
   * @access Private
   */
  router.get(
    '/category/:categoryId',
    auth(['admin', 'finance_manager', 'finance_viewer']),
    [
      param('categoryId').isUUID().withMessage('Category ID must be a UUID'),
      query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
      query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
      query('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO8601 date'),
      query('endDate').optional().isISO8601().withMessage('End date must be a valid ISO8601 date'),
      query('type').optional().isIn(['income', 'expense']).withMessage('Type must be income or expense'),
      validator,
    ],
    transactionController.getTransactionsByCategory
  );

  /**
   * @route GET /api/transactions/date-range
   * @description Get transactions by date range
   * @access Private
   */
  router.get(
    '/date-range',
    auth(['admin', 'finance_manager', 'finance_viewer']),
    [
      query('startDate').notEmpty().withMessage('Start date is required').isISO8601().withMessage('Start date must be a valid ISO8601 date'),
      query('endDate').notEmpty().withMessage('End date is required').isISO8601().withMessage('End date must be a valid ISO8601 date'),
      query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
      query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
      query('type').optional().isIn(['income', 'expense']).withMessage('Type must be income or expense'),
      query('categoryId').optional().isUUID().withMessage('Category ID must be a UUID'),
      query('accountId').optional().isUUID().withMessage('Account ID must be a UUID'),
      validator,
    ],
    transactionController.getTransactionsByDateRange
  );

  /**
   * @route GET /api/transactions/account/:accountId
   * @description Get transactions by account
   * @access Private
   */
  router.get(
    '/account/:accountId',
    auth(['admin', 'finance_manager', 'finance_viewer']),
    [
      param('accountId').isUUID().withMessage('Account ID must be a UUID'),
      query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
      query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
      query('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO8601 date'),
      query('endDate').optional().isISO8601().withMessage('End date must be a valid ISO8601 date'),
      query('type').optional().isIn(['income', 'expense']).withMessage('Type must be income or expense'),
      query('categoryId').optional().isUUID().withMessage('Category ID must be a UUID'),
      validator,
    ],
    transactionController.getTransactionsByAccount
  );

  /**
   * @route GET /api/transactions/stats
   * @description Get transaction statistics
   * @access Private
   */
  router.get(
    '/stats',
    auth(['admin', 'finance_manager', 'finance_viewer']),
    [
      query('startDate').notEmpty().withMessage('Start date is required').isISO8601().withMessage('Start date must be a valid ISO8601 date'),
      query('endDate').notEmpty().withMessage('End date is required').isISO8601().withMessage('End date must be a valid ISO8601 date'),
      query('groupBy').optional().isIn(['category', 'day', 'week', 'month']).withMessage('Group by must be one of: category, day, week, month'),
      query('type').optional().isIn(['income', 'expense']).withMessage('Type must be income or expense'),
      query('accountId').optional().isUUID().withMessage('Account ID must be a UUID'),
      validator,
    ],
    transactionController.getTransactionStats
  );

  return router;
};

module.exports = createTransactionRoutes;
