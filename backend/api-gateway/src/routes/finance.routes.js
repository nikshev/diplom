/**
 * Finance service routes for API Gateway
 */

const express = require('express');
const { param } = require('express-validator');
const config = require('../config');
const { createServiceProxy } = require('../utils/proxy');
const { authenticate, authorize } = require('../middlewares/auth');
const { validate } = require('../middlewares/validator');

const router = express.Router();

// Create proxy to finance service
const financeServiceProxy = createServiceProxy(
  'finance-service',
  config.services.finance.url,
  { timeout: config.services.finance.timeout }
);

// UUID validation rule
const uuidValidation = param('id')
  .isUUID()
  .withMessage('Invalid ID format');

// Routes

/**
 * @route GET /api/v1/finance/accounts
 * @desc Get all accounts with pagination and filtering
 * @access Private
 */
router.get('/accounts', 
  authenticate(), 
  authorize(['finance:read', 'finance:all']), 
  financeServiceProxy
);

/**
 * @route POST /api/v1/finance/accounts
 * @desc Create a new account
 * @access Private
 */
router.post('/accounts', 
  authenticate(), 
  authorize(['finance:create', 'finance:all']), 
  financeServiceProxy
);

/**
 * @route GET /api/v1/finance/accounts/:id
 * @desc Get account by ID
 * @access Private
 */
router.get('/accounts/:id', 
  authenticate(), 
  authorize(['finance:read', 'finance:all']),
  uuidValidation,
  validate(),
  financeServiceProxy
);

/**
 * @route PUT /api/v1/finance/accounts/:id
 * @desc Update account by ID
 * @access Private
 */
router.put('/accounts/:id', 
  authenticate(), 
  authorize(['finance:update', 'finance:all']),
  uuidValidation,
  validate(),
  financeServiceProxy
);

/**
 * @route DELETE /api/v1/finance/accounts/:id
 * @desc Delete account by ID
 * @access Private
 */
router.delete('/accounts/:id', 
  authenticate(), 
  authorize(['finance:delete', 'finance:all']),
  uuidValidation,
  validate(),
  financeServiceProxy
);

/**
 * @route GET /api/v1/finance/transactions
 * @desc Get all transactions with pagination and filtering
 * @access Private
 */
router.get('/transactions', 
  authenticate(), 
  authorize(['finance:read', 'finance:all']), 
  financeServiceProxy
);

/**
 * @route POST /api/v1/finance/transactions
 * @desc Create a new transaction
 * @access Private
 */
router.post('/transactions', 
  authenticate(), 
  authorize(['finance:create', 'finance:all']), 
  financeServiceProxy
);

/**
 * @route GET /api/v1/finance/transactions/:id
 * @desc Get transaction by ID
 * @access Private
 */
router.get('/transactions/:id', 
  authenticate(), 
  authorize(['finance:read', 'finance:all']),
  uuidValidation,
  validate(),
  financeServiceProxy
);

/**
 * @route GET /api/v1/finance/transaction-categories
 * @desc Get all transaction categories
 * @access Private
 */
router.get('/transaction-categories', 
  authenticate(), 
  authorize(['finance:read', 'finance:all']), 
  financeServiceProxy
);

/**
 * @route POST /api/v1/finance/transaction-categories
 * @desc Create a new transaction category
 * @access Private
 */
router.post('/transaction-categories', 
  authenticate(), 
  authorize(['finance:create', 'finance:all']), 
  financeServiceProxy
);

/**
 * @route GET /api/v1/finance/transaction-categories/:id
 * @desc Get transaction category by ID
 * @access Private
 */
router.get('/transaction-categories/:id', 
  authenticate(), 
  authorize(['finance:read', 'finance:all']),
  uuidValidation,
  validate(),
  financeServiceProxy
);

/**
 * @route PUT /api/v1/finance/transaction-categories/:id
 * @desc Update transaction category by ID
 * @access Private
 */
router.put('/transaction-categories/:id', 
  authenticate(), 
  authorize(['finance:update', 'finance:all']),
  uuidValidation,
  validate(),
  financeServiceProxy
);

/**
 * @route DELETE /api/v1/finance/transaction-categories/:id
 * @desc Delete transaction category by ID
 * @access Private
 */
router.delete('/transaction-categories/:id', 
  authenticate(), 
  authorize(['finance:delete', 'finance:all']),
  uuidValidation,
  validate(),
  financeServiceProxy
);

/**
 * @route GET /api/v1/finance/invoices
 * @desc Get all invoices with pagination and filtering
 * @access Private
 */
router.get('/invoices', 
  authenticate(), 
  authorize(['finance:read', 'finance:all']), 
  financeServiceProxy
);

/**
 * @route POST /api/v1/finance/invoices
 * @desc Create a new invoice
 * @access Private
 */
router.post('/invoices', 
  authenticate(), 
  authorize(['finance:create', 'finance:all']), 
  financeServiceProxy
);

/**
 * @route GET /api/v1/finance/invoices/:id
 * @desc Get invoice by ID
 * @access Private
 */
router.get('/invoices/:id', 
  authenticate(), 
  authorize(['finance:read', 'finance:all']),
  uuidValidation,
  validate(),
  financeServiceProxy
);

/**
 * @route PUT /api/v1/finance/invoices/:id
 * @desc Update invoice by ID
 * @access Private
 */
router.put('/invoices/:id', 
  authenticate(), 
  authorize(['finance:update', 'finance:all']),
  uuidValidation,
  validate(),
  financeServiceProxy
);

/**
 * @route DELETE /api/v1/finance/invoices/:id
 * @desc Delete invoice by ID
 * @access Private
 */
router.delete('/invoices/:id', 
  authenticate(), 
  authorize(['finance:delete', 'finance:all']),
  uuidValidation,
  validate(),
  financeServiceProxy
);

/**
 * @route POST /api/v1/finance/invoices/:id/payments
 * @desc Add payment to invoice
 * @access Private
 */
router.post('/invoices/:id/payments', 
  authenticate(), 
  authorize(['finance:create', 'finance:all']),
  uuidValidation,
  validate(),
  financeServiceProxy
);

/**
 * @route GET /api/v1/finance/invoices/:id/payments
 * @desc Get invoice payments by invoice ID
 * @access Private
 */
router.get('/invoices/:id/payments', 
  authenticate(), 
  authorize(['finance:read', 'finance:all']),
  uuidValidation,
  validate(),
  financeServiceProxy
);

/**
 * @route GET /api/v1/finance/reports/balance
 * @desc Get balance report
 * @access Private
 */
router.get('/reports/balance', 
  authenticate(), 
  authorize(['finance:read', 'finance:all']), 
  financeServiceProxy
);

/**
 * @route GET /api/v1/finance/reports/income
 * @desc Get income report
 * @access Private
 */
router.get('/reports/income', 
  authenticate(), 
  authorize(['finance:read', 'finance:all']), 
  financeServiceProxy
);

/**
 * @route GET /api/v1/finance/reports/expenses
 * @desc Get expenses report
 * @access Private
 */
router.get('/reports/expenses', 
  authenticate(), 
  authorize(['finance:read', 'finance:all']), 
  financeServiceProxy
);

module.exports = router;
