/**
 * CRM service routes for API Gateway
 */

const express = require('express');
const { param } = require('express-validator');
const config = require('../config');
const { createServiceProxy } = require('../utils/proxy');
const { authenticate, authorize } = require('../middlewares/auth');
const { validate } = require('../middlewares/validator');

const router = express.Router();

// Create proxy to CRM service
const crmServiceProxy = createServiceProxy(
  'crm-service',
  config.services.crm.url,
  { timeout: config.services.crm.timeout }
);

// UUID validation rule
const uuidValidation = param('id')
  .isUUID()
  .withMessage('Invalid ID format');

// Routes

/**
 * @route GET /api/v1/crm/customers
 * @desc Get all customers with pagination and filtering
 * @access Private
 */
router.get('/customers', 
  authenticate(), 
  authorize(['crm:read', 'crm:all']), 
  crmServiceProxy
);

/**
 * @route POST /api/v1/crm/customers
 * @desc Create a new customer
 * @access Private
 */
router.post('/customers', 
  authenticate(), 
  authorize(['crm:create', 'crm:all']), 
  crmServiceProxy
);

/**
 * @route GET /api/v1/crm/customers/:id
 * @desc Get customer by ID
 * @access Private
 */
router.get('/customers/:id', 
  authenticate(), 
  authorize(['crm:read', 'crm:all']),
  uuidValidation,
  validate(),
  crmServiceProxy
);

/**
 * @route PUT /api/v1/crm/customers/:id
 * @desc Update customer by ID
 * @access Private
 */
router.put('/customers/:id', 
  authenticate(), 
  authorize(['crm:update', 'crm:all']),
  uuidValidation,
  validate(),
  crmServiceProxy
);

/**
 * @route DELETE /api/v1/crm/customers/:id
 * @desc Delete customer by ID
 * @access Private
 */
router.delete('/customers/:id', 
  authenticate(), 
  authorize(['crm:delete', 'crm:all']),
  uuidValidation,
  validate(),
  crmServiceProxy
);

/**
 * @route GET /api/v1/crm/customers/:id/contacts
 * @desc Get customer contacts by customer ID
 * @access Private
 */
router.get('/customers/:id/contacts', 
  authenticate(), 
  authorize(['crm:read', 'crm:all']),
  uuidValidation,
  validate(),
  crmServiceProxy
);

/**
 * @route POST /api/v1/crm/customers/:id/contacts
 * @desc Add contact to customer
 * @access Private
 */
router.post('/customers/:id/contacts', 
  authenticate(), 
  authorize(['crm:update', 'crm:all']),
  uuidValidation,
  validate(),
  crmServiceProxy
);

/**
 * @route GET /api/v1/crm/contacts/:id
 * @desc Get contact by ID
 * @access Private
 */
router.get('/contacts/:id', 
  authenticate(), 
  authorize(['crm:read', 'crm:all']),
  uuidValidation,
  validate(),
  crmServiceProxy
);

/**
 * @route PUT /api/v1/crm/contacts/:id
 * @desc Update contact by ID
 * @access Private
 */
router.put('/contacts/:id', 
  authenticate(), 
  authorize(['crm:update', 'crm:all']),
  uuidValidation,
  validate(),
  crmServiceProxy
);

/**
 * @route DELETE /api/v1/crm/contacts/:id
 * @desc Delete contact by ID
 * @access Private
 */
router.delete('/contacts/:id', 
  authenticate(), 
  authorize(['crm:delete', 'crm:all']),
  uuidValidation,
  validate(),
  crmServiceProxy
);

/**
 * @route GET /api/v1/crm/customers/:id/interactions
 * @desc Get customer interactions by customer ID
 * @access Private
 */
router.get('/customers/:id/interactions', 
  authenticate(), 
  authorize(['crm:read', 'crm:all']),
  uuidValidation,
  validate(),
  crmServiceProxy
);

/**
 * @route POST /api/v1/crm/customers/:id/interactions
 * @desc Add interaction to customer
 * @access Private
 */
router.post('/customers/:id/interactions', 
  authenticate(), 
  authorize(['crm:create', 'crm:all']),
  uuidValidation,
  validate(),
  crmServiceProxy
);

/**
 * @route GET /api/v1/crm/interactions/:id
 * @desc Get interaction by ID
 * @access Private
 */
router.get('/interactions/:id', 
  authenticate(), 
  authorize(['crm:read', 'crm:all']),
  uuidValidation,
  validate(),
  crmServiceProxy
);

/**
 * @route PUT /api/v1/crm/interactions/:id
 * @desc Update interaction by ID
 * @access Private
 */
router.put('/interactions/:id', 
  authenticate(), 
  authorize(['crm:update', 'crm:all']),
  uuidValidation,
  validate(),
  crmServiceProxy
);

/**
 * @route DELETE /api/v1/crm/interactions/:id
 * @desc Delete interaction by ID
 * @access Private
 */
router.delete('/interactions/:id', 
  authenticate(), 
  authorize(['crm:delete', 'crm:all']),
  uuidValidation,
  validate(),
  crmServiceProxy
);

module.exports = router;
