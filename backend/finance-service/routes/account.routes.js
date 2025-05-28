/**
 * Account routes for Finance Service
 */

const express = require('express');
const { body, param, query } = require('express-validator');
const validator = require('../middlewares/validator');
const auth = require('../middlewares/auth');

/**
 * Create account routes
 * @param {Object} accountController - Account controller
 * @returns {Object} Router
 */
const createAccountRoutes = (accountController) => {
  const router = express.Router();

  /**
   * @route GET /api/accounts
   * @description Get all accounts with optional filtering
   * @access Private
   */
  router.get(
    '/',
    auth(['admin', 'finance_manager', 'finance_viewer']),
    [
      query('includeInactive').optional().isBoolean().withMessage('includeInactive must be a boolean'),
      query('type').optional().isString().withMessage('Type must be a string'),
      query('search').optional().isString().withMessage('Search must be a string'),
      query('includeBalance').optional().isBoolean().withMessage('includeBalance must be a boolean'),
      validator,
    ],
    accountController.getAccounts
  );

  /**
   * @route GET /api/accounts/:id
   * @description Get account by ID
   * @access Private
   */
  router.get(
    '/:id',
    auth(['admin', 'finance_manager', 'finance_viewer']),
    [
      param('id').isUUID().withMessage('Account ID must be a UUID'),
      query('includeTransactions').optional().isBoolean().withMessage('includeTransactions must be a boolean'),
      validator,
    ],
    accountController.getAccountById
  );

  /**
   * @route POST /api/accounts
   * @description Create a new account
   * @access Private
   */
  router.post(
    '/',
    auth(['admin', 'finance_manager']),
    [
      body('name').notEmpty().withMessage('Name is required').isString().withMessage('Name must be a string'),
      body('type').notEmpty().withMessage('Type is required').isString().withMessage('Type must be a string'),
      body('currency').notEmpty().withMessage('Currency is required').isString().withMessage('Currency must be a string'),
      body('initial_balance').optional().isFloat({ min: 0 }).withMessage('Initial balance must be a non-negative number'),
      body('description').optional().isString().withMessage('Description must be a string'),
      body('is_active').optional().isBoolean().withMessage('is_active must be a boolean'),
      body('account_number').optional().isString().withMessage('Account number must be a string'),
      body('bank_name').optional().isString().withMessage('Bank name must be a string'),
      body('bank_code').optional().isString().withMessage('Bank code must be a string'),
      validator,
    ],
    accountController.createAccount
  );

  /**
   * @route PUT /api/accounts/:id
   * @description Update an account
   * @access Private
   */
  router.put(
    '/:id',
    auth(['admin', 'finance_manager']),
    [
      param('id').isUUID().withMessage('Account ID must be a UUID'),
      body('name').optional().isString().withMessage('Name must be a string'),
      body('type').optional().isString().withMessage('Type must be a string'),
      body('currency').optional().isString().withMessage('Currency must be a string'),
      body('description').optional().isString().withMessage('Description must be a string'),
      body('is_active').optional().isBoolean().withMessage('is_active must be a boolean'),
      body('account_number').optional().isString().withMessage('Account number must be a string'),
      body('bank_name').optional().isString().withMessage('Bank name must be a string'),
      body('bank_code').optional().isString().withMessage('Bank code must be a string'),
      validator,
    ],
    accountController.updateAccount
  );

  /**
   * @route DELETE /api/accounts/:id
   * @description Delete an account
   * @access Private
   */
  router.delete(
    '/:id',
    auth(['admin']),
    [
      param('id').isUUID().withMessage('Account ID must be a UUID'),
      validator,
    ],
    accountController.deleteAccount
  );

  /**
   * @route GET /api/accounts/:id/balance
   * @description Get account balance
   * @access Private
   */
  router.get(
    '/:id/balance',
    auth(['admin', 'finance_manager', 'finance_viewer']),
    [
      param('id').isUUID().withMessage('Account ID must be a UUID'),
      validator,
    ],
    accountController.getAccountBalance
  );

  /**
   * @route GET /api/accounts/:id/transactions
   * @description Get account transactions
   * @access Private
   */
  router.get(
    '/:id/transactions',
    auth(['admin', 'finance_manager', 'finance_viewer']),
    [
      param('id').isUUID().withMessage('Account ID must be a UUID'),
      query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
      query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
      query('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO8601 date'),
      query('endDate').optional().isISO8601().withMessage('End date must be a valid ISO8601 date'),
      query('type').optional().isIn(['income', 'expense']).withMessage('Type must be income or expense'),
      query('categoryId').optional().isUUID().withMessage('Category ID must be a UUID'),
      query('sortBy').optional().isString().withMessage('Sort by must be a string'),
      query('sortOrder').optional().isIn(['ASC', 'DESC']).withMessage('Sort order must be ASC or DESC'),
      validator,
    ],
    accountController.getAccountTransactions
  );

  /**
   * @route POST /api/accounts/transfer
   * @description Transfer funds between accounts
   * @access Private
   */
  router.post(
    '/transfer',
    auth(['admin', 'finance_manager']),
    [
      body('sourceAccountId').notEmpty().withMessage('Source account ID is required').isUUID().withMessage('Source account ID must be a UUID'),
      body('targetAccountId').notEmpty().withMessage('Target account ID is required').isUUID().withMessage('Target account ID must be a UUID'),
      body('amount').notEmpty().withMessage('Amount is required').isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
      body('description').optional().isString().withMessage('Description must be a string'),
      validator,
    ],
    accountController.transferFunds
  );

  /**
   * @route GET /api/accounts/:id/stats
   * @description Get account statistics
   * @access Private
   */
  router.get(
    '/:id/stats',
    auth(['admin', 'finance_manager', 'finance_viewer']),
    [
      param('id').isUUID().withMessage('Account ID must be a UUID'),
      query('startDate').notEmpty().withMessage('Start date is required').isISO8601().withMessage('Start date must be a valid ISO8601 date'),
      query('endDate').notEmpty().withMessage('End date is required').isISO8601().withMessage('End date must be a valid ISO8601 date'),
      validator,
    ],
    accountController.getAccountStats
  );

  return router;
};

module.exports = createAccountRoutes;
