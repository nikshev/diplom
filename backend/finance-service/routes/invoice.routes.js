/**
 * Invoice routes for Finance Service
 */

const express = require('express');
const { body, param, query } = require('express-validator');
const validator = require('../middlewares/validator');
const auth = require('../middlewares/auth');

/**
 * Create invoice routes
 * @param {Object} invoiceController - Invoice controller
 * @returns {Object} Router
 */
const createInvoiceRoutes = (invoiceController) => {
  const router = express.Router();

  /**
   * @route GET /api/invoices
   * @description Get all invoices with pagination and filtering
   * @access Private
   */
  router.get(
    '/',
    auth(['admin', 'finance_manager', 'finance_viewer']),
    [
      query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
      query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
      query('status').optional().isString().withMessage('Status must be a string'),
      query('customerId').optional().isUUID().withMessage('Customer ID must be a UUID'),
      query('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO8601 date'),
      query('endDate').optional().isISO8601().withMessage('End date must be a valid ISO8601 date'),
      query('minAmount').optional().isFloat({ min: 0 }).withMessage('Min amount must be a non-negative number'),
      query('maxAmount').optional().isFloat({ min: 0 }).withMessage('Max amount must be a non-negative number'),
      query('sortBy').optional().isString().withMessage('Sort by must be a string'),
      query('sortOrder').optional().isIn(['ASC', 'DESC']).withMessage('Sort order must be ASC or DESC'),
      validator,
    ],
    invoiceController.getInvoices
  );

  /**
   * @route GET /api/invoices/:id
   * @description Get invoice by ID
   * @access Private
   */
  router.get(
    '/:id',
    auth(['admin', 'finance_manager', 'finance_viewer']),
    [
      param('id').isUUID().withMessage('Invoice ID must be a UUID'),
      query('includeItems').optional().isBoolean().withMessage('includeItems must be a boolean'),
      query('includePayments').optional().isBoolean().withMessage('includePayments must be a boolean'),
      query('includeCustomer').optional().isBoolean().withMessage('includeCustomer must be a boolean'),
      validator,
    ],
    invoiceController.getInvoiceById
  );

  /**
   * @route POST /api/invoices
   * @description Create a new invoice
   * @access Private
   */
  router.post(
    '/',
    auth(['admin', 'finance_manager']),
    [
      body('customer_id').notEmpty().withMessage('Customer ID is required').isUUID().withMessage('Customer ID must be a UUID'),
      body('invoice_number').optional().isString().withMessage('Invoice number must be a string'),
      body('status').optional().isString().withMessage('Status must be a string'),
      body('issue_date').optional().isISO8601().withMessage('Issue date must be a valid ISO8601 date'),
      body('due_date').notEmpty().withMessage('Due date is required').isISO8601().withMessage('Due date must be a valid ISO8601 date'),
      body('currency').optional().isString().withMessage('Currency must be a string'),
      body('notes').optional().isString().withMessage('Notes must be a string'),
      body('items').isArray().withMessage('Items must be an array'),
      body('items.*.product_id').optional().isUUID().withMessage('Product ID must be a UUID'),
      body('items.*.description').notEmpty().withMessage('Item description is required').isString().withMessage('Item description must be a string'),
      body('items.*.quantity').notEmpty().withMessage('Item quantity is required').isFloat({ min: 0.01 }).withMessage('Item quantity must be a positive number'),
      body('items.*.unit_price').notEmpty().withMessage('Item unit price is required').isFloat({ min: 0 }).withMessage('Item unit price must be a non-negative number'),
      body('items.*.tax_rate').optional().isFloat({ min: 0 }).withMessage('Item tax rate must be a non-negative number'),
      body('items.*.discount').optional().isFloat({ min: 0 }).withMessage('Item discount must be a non-negative number'),
      validator,
    ],
    invoiceController.createInvoice
  );

  /**
   * @route PUT /api/invoices/:id
   * @description Update an invoice
   * @access Private
   */
  router.put(
    '/:id',
    auth(['admin', 'finance_manager']),
    [
      param('id').isUUID().withMessage('Invoice ID must be a UUID'),
      body('customer_id').optional().isUUID().withMessage('Customer ID must be a UUID'),
      body('invoice_number').optional().isString().withMessage('Invoice number must be a string'),
      body('status').optional().isString().withMessage('Status must be a string'),
      body('issue_date').optional().isISO8601().withMessage('Issue date must be a valid ISO8601 date'),
      body('due_date').optional().isISO8601().withMessage('Due date must be a valid ISO8601 date'),
      body('currency').optional().isString().withMessage('Currency must be a string'),
      body('notes').optional().isString().withMessage('Notes must be a string'),
      body('items').optional().isArray().withMessage('Items must be an array'),
      body('items.*.id').optional().isUUID().withMessage('Item ID must be a UUID'),
      body('items.*.product_id').optional().isUUID().withMessage('Product ID must be a UUID'),
      body('items.*.description').optional().isString().withMessage('Item description must be a string'),
      body('items.*.quantity').optional().isFloat({ min: 0.01 }).withMessage('Item quantity must be a positive number'),
      body('items.*.unit_price').optional().isFloat({ min: 0 }).withMessage('Item unit price must be a non-negative number'),
      body('items.*.tax_rate').optional().isFloat({ min: 0 }).withMessage('Item tax rate must be a non-negative number'),
      body('items.*.discount').optional().isFloat({ min: 0 }).withMessage('Item discount must be a non-negative number'),
      validator,
    ],
    invoiceController.updateInvoice
  );

  /**
   * @route DELETE /api/invoices/:id
   * @description Delete an invoice
   * @access Private
   */
  router.delete(
    '/:id',
    auth(['admin', 'finance_manager']),
    [
      param('id').isUUID().withMessage('Invoice ID must be a UUID'),
      validator,
    ],
    invoiceController.deleteInvoice
  );

  /**
   * @route GET /api/invoices/customer/:customerId
   * @description Get invoices by customer
   * @access Private
   */
  router.get(
    '/customer/:customerId',
    auth(['admin', 'finance_manager', 'finance_viewer']),
    [
      param('customerId').isUUID().withMessage('Customer ID must be a UUID'),
      query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
      query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
      query('status').optional().isString().withMessage('Status must be a string'),
      query('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO8601 date'),
      query('endDate').optional().isISO8601().withMessage('End date must be a valid ISO8601 date'),
      validator,
    ],
    invoiceController.getInvoicesByCustomer
  );

  /**
   * @route GET /api/invoices/status/:status
   * @description Get invoices by status
   * @access Private
   */
  router.get(
    '/status/:status',
    auth(['admin', 'finance_manager', 'finance_viewer']),
    [
      param('status').isString().withMessage('Status must be a string'),
      query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
      query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
      query('customerId').optional().isUUID().withMessage('Customer ID must be a UUID'),
      query('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO8601 date'),
      query('endDate').optional().isISO8601().withMessage('End date must be a valid ISO8601 date'),
      validator,
    ],
    invoiceController.getInvoicesByStatus
  );

  /**
   * @route GET /api/invoices/date-range
   * @description Get invoices by date range
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
      query('status').optional().isString().withMessage('Status must be a string'),
      query('customerId').optional().isUUID().withMessage('Customer ID must be a UUID'),
      validator,
    ],
    invoiceController.getInvoicesByDateRange
  );

  /**
   * @route PATCH /api/invoices/:id/mark-paid
   * @description Mark invoice as paid
   * @access Private
   */
  router.patch(
    '/:id/mark-paid',
    auth(['admin', 'finance_manager']),
    [
      param('id').isUUID().withMessage('Invoice ID must be a UUID'),
      body('paymentMethod').optional().isString().withMessage('Payment method must be a string'),
      body('paymentDate').optional().isISO8601().withMessage('Payment date must be a valid ISO8601 date'),
      body('notes').optional().isString().withMessage('Notes must be a string'),
      validator,
    ],
    invoiceController.markInvoiceAsPaid
  );

  /**
   * @route PATCH /api/invoices/:id/mark-cancelled
   * @description Mark invoice as cancelled
   * @access Private
   */
  router.patch(
    '/:id/mark-cancelled',
    auth(['admin', 'finance_manager']),
    [
      param('id').isUUID().withMessage('Invoice ID must be a UUID'),
      body('reason').optional().isString().withMessage('Reason must be a string'),
      validator,
    ],
    invoiceController.markInvoiceAsCancelled
  );

  /**
   * @route POST /api/invoices/:id/payments
   * @description Add invoice payment
   * @access Private
   */
  router.post(
    '/:id/payments',
    auth(['admin', 'finance_manager']),
    [
      param('id').isUUID().withMessage('Invoice ID must be a UUID'),
      body('amount').notEmpty().withMessage('Amount is required').isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
      body('payment_method').notEmpty().withMessage('Payment method is required').isString().withMessage('Payment method must be a string'),
      body('payment_date').optional().isISO8601().withMessage('Payment date must be a valid ISO8601 date'),
      body('reference').optional().isString().withMessage('Reference must be a string'),
      body('notes').optional().isString().withMessage('Notes must be a string'),
      validator,
    ],
    invoiceController.addInvoicePayment
  );

  /**
   * @route GET /api/invoices/:id/payments
   * @description Get invoice payments
   * @access Private
   */
  router.get(
    '/:id/payments',
    auth(['admin', 'finance_manager', 'finance_viewer']),
    [
      param('id').isUUID().withMessage('Invoice ID must be a UUID'),
      validator,
    ],
    invoiceController.getInvoicePayments
  );

  /**
   * @route GET /api/invoices/:id/pdf
   * @description Generate invoice PDF
   * @access Private
   */
  router.get(
    '/:id/pdf',
    auth(['admin', 'finance_manager', 'finance_viewer']),
    [
      param('id').isUUID().withMessage('Invoice ID must be a UUID'),
      validator,
    ],
    invoiceController.generateInvoicePdf
  );

  /**
   * @route POST /api/invoices/:id/send-email
   * @description Send invoice email
   * @access Private
   */
  router.post(
    '/:id/send-email',
    auth(['admin', 'finance_manager']),
    [
      param('id').isUUID().withMessage('Invoice ID must be a UUID'),
      body('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Email must be valid'),
      body('subject').optional().isString().withMessage('Subject must be a string'),
      body('message').optional().isString().withMessage('Message must be a string'),
      validator,
    ],
    invoiceController.sendInvoiceEmail
  );

  return router;
};

module.exports = createInvoiceRoutes;
