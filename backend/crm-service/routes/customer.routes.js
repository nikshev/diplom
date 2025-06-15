/**
 * Customer routes for CRM Service
 */

const express = require('express');
const { body, param, query } = require('express-validator');
const validate = require('../middlewares/validator');
const { authorize } = require('../middlewares/auth');
const { transformCustomerData } = require('../middlewares/transform');
const config = require('../config');

const router = express.Router();

/**
 * Initialize customer routes
 * @param {Object} customerController - Customer controller
 */
module.exports = (customerController) => {
  // GET /api/customers - Get all customers with pagination and filtering
  router.get(
    '/',
    authorize('customers', 'read'),
    [
      query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
      query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
      query('status').optional().isIn(Object.values(config.customerStatuses)).withMessage('Invalid status'),
      query('type').optional().isIn(Object.values(config.customerTypes)).withMessage('Invalid type'),
      query('sortBy').optional().isString().withMessage('Sort by must be a string'),
      query('sortOrder').optional().isIn(['ASC', 'DESC']).withMessage('Sort order must be ASC or DESC'),
    ],
    validate,
    customerController.getCustomers
  );

  // GET /api/customers/search - Search customers
  router.get(
    '/search',
    authorize('customers', 'read'),
    [
      query('query').notEmpty().withMessage('Search query is required'),
      query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    ],
    validate,
    customerController.searchCustomers
  );

  // GET /api/customers/segments - Get customer segments
  router.get(
    '/segments',
    authorize('customers', 'read'),
    customerController.getCustomerSegments
  );

  // GET /api/customers/:id - Get customer by ID
  router.get(
    '/:id',
    authorize('customers', 'read'),
    [
      param('id').isUUID().withMessage('Customer ID must be a valid UUID'),
    ],
    validate,
    customerController.getCustomerById
  );

  // POST /api/customers - Create a new customer
  router.post(
    '/',
    authorize('customers', 'create'),
    transformCustomerData,
    [
      body('first_name').notEmpty().withMessage('First name is required'),
      body('last_name').notEmpty().withMessage('Last name is required'),
      body('email').optional().isEmail().withMessage('Email must be valid'),
      body('phone').optional().isString().withMessage('Phone must be a string'),
      body('company_name').optional().isString().withMessage('Company name must be a string'),
      body('tax_id').optional().isString().withMessage('Tax ID must be a string'),
      body('status').optional().isIn(Object.values(config.customerStatuses)).withMessage('Invalid status'),
      body('type').optional().isIn(Object.values(config.customerTypes)).withMessage('Invalid type'),
      body('address').optional().isString().withMessage('Address must be a string'),
      body('notes').optional().isString().withMessage('Notes must be a string'),
      body('contacts').optional().isArray().withMessage('Contacts must be an array'),
      body('contacts.*.first_name').optional().isString().withMessage('Contact first name must be a string'),
      body('contacts.*.last_name').optional().isString().withMessage('Contact last name must be a string'),
      body('contacts.*.email').optional().isEmail().withMessage('Contact email must be valid'),
      body('contacts.*.phone').optional().isString().withMessage('Contact phone must be a string'),
      body('contacts.*.position').optional().isString().withMessage('Contact position must be a string'),
      body('contacts.*.is_primary').optional().isBoolean().withMessage('Contact is_primary must be a boolean'),
    ],
    validate,
    customerController.createCustomer
  );

  // PUT /api/customers/:id - Update customer
  router.put(
    '/:id',
    authorize('customers', 'update'),
    [
      param('id').isUUID().withMessage('Customer ID must be a valid UUID'),
      body('first_name').optional().notEmpty().withMessage('First name cannot be empty'),
      body('last_name').optional().notEmpty().withMessage('Last name cannot be empty'),
      body('email').optional().isEmail().withMessage('Email must be valid'),
      body('phone').optional().isString().withMessage('Phone must be a string'),
      body('status').optional().isIn(Object.values(config.customerStatuses)).withMessage('Invalid status'),
      body('type').optional().isIn(Object.values(config.customerTypes)).withMessage('Invalid type'),
      body('company_name').optional().isString().withMessage('Company name must be a string'),
      body('address').optional().isObject().withMessage('Address must be an object'),
      body('notes').optional().isString().withMessage('Notes must be a string'),
      body('contacts').optional().isArray().withMessage('Contacts must be an array'),
      body('contacts.*.id').optional().isUUID().withMessage('Contact ID must be a valid UUID'),
      body('contacts.*.first_name').optional().isString().withMessage('Contact first name must be a string'),
      body('contacts.*.last_name').optional().isString().withMessage('Contact last name must be a string'),
      body('contacts.*.email').optional().isEmail().withMessage('Contact email must be valid'),
      body('contacts.*.phone').optional().isString().withMessage('Contact phone must be a string'),
      body('contacts.*.position').optional().isString().withMessage('Contact position must be a string'),
      body('contacts.*.is_primary').optional().isBoolean().withMessage('Contact is_primary must be a boolean'),
    ],
    validate,
    customerController.updateCustomer
  );

  // DELETE /api/customers/:id - Delete customer
  router.delete(
    '/:id',
    authorize('customers', 'delete'),
    [
      param('id').isUUID().withMessage('Customer ID must be a valid UUID'),
    ],
    validate,
    customerController.deleteCustomer
  );

  // GET /api/customers/:id/orders - Get customer orders
  router.get(
    '/:id/orders',
    authorize('customers', 'read'),
    [
      param('id').isUUID().withMessage('Customer ID must be a valid UUID'),
      query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
      query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
      query('status').optional().isString().withMessage('Status must be a string'),
      query('sortBy').optional().isString().withMessage('Sort by must be a string'),
      query('sortOrder').optional().isIn(['ASC', 'DESC']).withMessage('Sort order must be ASC or DESC'),
    ],
    validate,
    customerController.getCustomerOrders
  );

  // GET /api/customers/:id/statistics - Get customer statistics
  router.get(
    '/:id/statistics',
    authorize('customers', 'read'),
    [
      param('id').isUUID().withMessage('Customer ID must be a valid UUID'),
    ],
    validate,
    customerController.getCustomerStatistics
  );

  return router;
};
