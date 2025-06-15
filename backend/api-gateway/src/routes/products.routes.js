/**
 * Direct products routes for API Gateway (for frontend compatibility)
 */

const express = require('express');
const { param } = require('express-validator');
const config = require('../config');
const { createServiceProxy } = require('../utils/proxy');
const { authenticate, authorize } = require('../middlewares/auth');
const { validate } = require('../middlewares/validator');

const router = express.Router();

// Create proxy to Inventory service
const inventoryServiceProxy = createServiceProxy(
  'inventory-service',
  config.services.inventory.url,
  { timeout: config.services.inventory.timeout }
);

// UUID validation rule
const uuidValidation = param('id')
  .isUUID()
  .withMessage('Invalid ID format');

// Direct products routes (without /products prefix)

/**
 * @route GET /api/v1/products
 * @desc Get all products with pagination and filtering
 * @access Private
 */
router.get('/', 
  authenticate(), 
  authorize(['inventory:read', 'inventory:all']), 
  inventoryServiceProxy
);

/**
 * @route POST /api/v1/products
 * @desc Create a new product
 * @access Private
 */
router.post('/', 
  authenticate(), 
  authorize(['inventory:create', 'inventory:all']), 
  inventoryServiceProxy
);

/**
 * @route GET /api/v1/products/:id
 * @desc Get product by ID
 * @access Private
 */
router.get('/:id', 
  authenticate(), 
  authorize(['inventory:read', 'inventory:all']),
  uuidValidation,
  validate(),
  inventoryServiceProxy
);

/**
 * @route PUT /api/v1/products/:id
 * @desc Update product by ID
 * @access Private
 */
router.put('/:id', 
  authenticate(), 
  authorize(['inventory:update', 'inventory:all']),
  uuidValidation,
  validate(),
  inventoryServiceProxy
);

/**
 * @route DELETE /api/v1/products/:id
 * @desc Delete product by ID
 * @access Private
 */
router.delete('/:id', 
  authenticate(), 
  authorize(['inventory:delete', 'inventory:all']),
  uuidValidation,
  validate(),
  inventoryServiceProxy
);

/**
 * @route GET /api/v1/products/search
 * @desc Search products
 * @access Private
 */
router.get('/search', 
  authenticate(), 
  authorize(['inventory:read', 'inventory:all']), 
  inventoryServiceProxy
);

/**
 * @route GET /api/v1/products/low-stock
 * @desc Get low stock products
 * @access Private
 */
router.get('/low-stock', 
  authenticate(), 
  authorize(['inventory:read', 'inventory:all']), 
  inventoryServiceProxy
);

/**
 * @route GET /api/v1/products/:id/stock
 * @desc Get product stock information
 * @access Private
 */
router.get('/:id/stock', 
  authenticate(), 
  authorize(['inventory:read', 'inventory:all']),
  uuidValidation,
  validate(),
  inventoryServiceProxy
);

/**
 * @route POST /api/v1/products/:id/stock
 * @desc Update product stock
 * @access Private
 */
router.post('/:id/stock', 
  authenticate(), 
  authorize(['inventory:update', 'inventory:all']),
  uuidValidation,
  validate(),
  inventoryServiceProxy
);

module.exports = router;
