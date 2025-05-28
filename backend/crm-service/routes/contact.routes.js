/**
 * Contact routes for CRM Service
 */

const express = require('express');
const { body, param, query } = require('express-validator');
const validate = require('../middlewares/validator');
const { authorize } = require('../middlewares/auth');

const router = express.Router();

/**
 * Initialize contact routes
 * @param {Object} contactController - Contact controller
 */
module.exports = (contactController) => {
  // GET /api/contacts/customer/:customerId - Get contacts by customer ID
  router.get(
    '/customer/:customerId',
    authorize('contacts', 'read'),
    [
      param('customerId').isUUID().withMessage('Customer ID must be a valid UUID'),
    ],
    validate,
    contactController.getContactsByCustomerId
  );

  // GET /api/contacts/search - Search contacts
  router.get(
    '/search',
    authorize('contacts', 'read'),
    [
      query('query').notEmpty().withMessage('Search query is required'),
      query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
      query('customerId').optional().isUUID().withMessage('Customer ID must be a valid UUID'),
    ],
    validate,
    contactController.searchContacts
  );

  // GET /api/contacts/:id - Get contact by ID
  router.get(
    '/:id',
    authorize('contacts', 'read'),
    [
      param('id').isUUID().withMessage('Contact ID must be a valid UUID'),
    ],
    validate,
    contactController.getContactById
  );

  // POST /api/contacts - Create a new contact
  router.post(
    '/',
    authorize('contacts', 'create'),
    [
      body('customer_id').isUUID().withMessage('Customer ID must be a valid UUID'),
      body('first_name').notEmpty().withMessage('First name is required'),
      body('last_name').notEmpty().withMessage('Last name is required'),
      body('email').optional().isEmail().withMessage('Email must be valid'),
      body('phone').optional().isString().withMessage('Phone must be a string'),
      body('position').optional().isString().withMessage('Position must be a string'),
      body('department').optional().isString().withMessage('Department must be a string'),
      body('is_primary').optional().isBoolean().withMessage('Is primary must be a boolean'),
      body('notes').optional().isString().withMessage('Notes must be a string'),
    ],
    validate,
    contactController.createContact
  );

  // PUT /api/contacts/:id - Update contact
  router.put(
    '/:id',
    authorize('contacts', 'update'),
    [
      param('id').isUUID().withMessage('Contact ID must be a valid UUID'),
      body('first_name').optional().notEmpty().withMessage('First name cannot be empty'),
      body('last_name').optional().notEmpty().withMessage('Last name cannot be empty'),
      body('email').optional().isEmail().withMessage('Email must be valid'),
      body('phone').optional().isString().withMessage('Phone must be a string'),
      body('position').optional().isString().withMessage('Position must be a string'),
      body('department').optional().isString().withMessage('Department must be a string'),
      body('is_primary').optional().isBoolean().withMessage('Is primary must be a boolean'),
      body('notes').optional().isString().withMessage('Notes must be a string'),
    ],
    validate,
    contactController.updateContact
  );

  // DELETE /api/contacts/:id - Delete contact
  router.delete(
    '/:id',
    authorize('contacts', 'delete'),
    [
      param('id').isUUID().withMessage('Contact ID must be a valid UUID'),
    ],
    validate,
    contactController.deleteContact
  );

  // PUT /api/contacts/:id/primary - Set contact as primary
  router.put(
    '/:id/primary',
    authorize('contacts', 'update'),
    [
      param('id').isUUID().withMessage('Contact ID must be a valid UUID'),
    ],
    validate,
    contactController.setPrimaryContact
  );

  return router;
};
