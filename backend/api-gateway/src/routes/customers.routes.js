/**
 * Direct customers routes for API Gateway (for frontend compatibility)
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

// Direct customers routes (without /customers prefix)

/**
 * @route GET /api/v1/customers
 * @desc Get all customers with pagination and filtering
 * @access Private
 */
router.get('/', 
  authenticate(), 
  authorize(['crm:read', 'crm:all']), 
  crmServiceProxy
);

/**
 * @route POST /api/v1/customers
 * @desc Create a new customer
 * @access Private
 */
router.post('/', 
  authenticate(), 
  authorize(['crm:create', 'crm:all']), 
  crmServiceProxy
);

/**
 * @route GET /api/v1/customers/:id
 * @desc Get customer by ID
 * @access Private
 */
router.get('/:id', 
  authenticate(), 
  authorize(['crm:read', 'crm:all']),
  uuidValidation,
  validate(),
  crmServiceProxy
);

/**
 * @route PUT /api/v1/customers/:id
 * @desc Update customer by ID
 * @access Private
 */
router.put('/:id', 
  authenticate(), 
  authorize(['crm:update', 'crm:all']),
  uuidValidation,
  validate(),
  crmServiceProxy
);

/**
 * @route DELETE /api/v1/customers/:id
 * @desc Delete customer by ID
 * @access Private
 */
router.delete('/:id', 
  authenticate(), 
  authorize(['crm:delete', 'crm:all']),
  uuidValidation,
  validate(),
  crmServiceProxy
);

module.exports = router;
