/**
 * Inventory service routes for API Gateway
 */

const express = require('express');
const { param } = require('express-validator');
const config = require('../config');
const { createServiceProxy } = require('../utils/proxy');
const { authenticate, authorize } = require('../middlewares/auth');
const { validate } = require('../middlewares/validator');

const router = express.Router();

// Create proxy to inventory service
const inventoryServiceProxy = createServiceProxy(
  'inventory-service',
  config.services.inventory.url,
  { timeout: config.services.inventory.timeout }
);

// UUID validation rule
const uuidValidation = param('id')
  .isUUID()
  .withMessage('Invalid ID format');

// Routes

/**
 * @route GET /api/v1/inventory/products
 * @desc Get all products with pagination and filtering
 * @access Private
 */
router.get('/products', 
  authenticate(), 
  authorize(['inventory:read', 'inventory:all']), 
  inventoryServiceProxy
);

/**
 * @route POST /api/v1/inventory/products
 * @desc Create a new product
 * @access Private
 */
router.post('/products', 
  authenticate(), 
  authorize(['inventory:create', 'inventory:all']), 
  inventoryServiceProxy
);

/**
 * @route GET /api/v1/inventory/products/:id
 * @desc Get product by ID
 * @access Private
 */
router.get('/products/:id', 
  authenticate(), 
  authorize(['inventory:read', 'inventory:all']),
  uuidValidation,
  validate(),
  inventoryServiceProxy
);

/**
 * @route PUT /api/v1/inventory/products/:id
 * @desc Update product by ID
 * @access Private
 */
router.put('/products/:id', 
  authenticate(), 
  authorize(['inventory:update', 'inventory:all']),
  uuidValidation,
  validate(),
  inventoryServiceProxy
);

/**
 * @route DELETE /api/v1/inventory/products/:id
 * @desc Delete product by ID
 * @access Private
 */
router.delete('/products/:id', 
  authenticate(), 
  authorize(['inventory:delete', 'inventory:all']),
  uuidValidation,
  validate(),
  inventoryServiceProxy
);

/**
 * @route GET /api/v1/inventory/categories
 * @desc Get all categories
 * @access Private
 */
router.get('/categories', 
  authenticate(), 
  authorize(['inventory:read', 'inventory:all']), 
  inventoryServiceProxy
);

/**
 * @route POST /api/v1/inventory/categories
 * @desc Create a new category
 * @access Private
 */
router.post('/categories', 
  authenticate(), 
  authorize(['inventory:create', 'inventory:all']), 
  inventoryServiceProxy
);

/**
 * @route GET /api/v1/inventory/categories/:id
 * @desc Get category by ID
 * @access Private
 */
router.get('/categories/:id', 
  authenticate(), 
  authorize(['inventory:read', 'inventory:all']),
  uuidValidation,
  validate(),
  inventoryServiceProxy
);

/**
 * @route PUT /api/v1/inventory/categories/:id
 * @desc Update category by ID
 * @access Private
 */
router.put('/categories/:id', 
  authenticate(), 
  authorize(['inventory:update', 'inventory:all']),
  uuidValidation,
  validate(),
  inventoryServiceProxy
);

/**
 * @route DELETE /api/v1/inventory/categories/:id
 * @desc Delete category by ID
 * @access Private
 */
router.delete('/categories/:id', 
  authenticate(), 
  authorize(['inventory:delete', 'inventory:all']),
  uuidValidation,
  validate(),
  inventoryServiceProxy
);

/**
 * @route GET /api/v1/inventory/warehouses
 * @desc Get all warehouses
 * @access Private
 */
router.get('/warehouses', 
  authenticate(), 
  authorize(['inventory:read', 'inventory:all']), 
  inventoryServiceProxy
);

/**
 * @route POST /api/v1/inventory/warehouses
 * @desc Create a new warehouse
 * @access Private
 */
router.post('/warehouses', 
  authenticate(), 
  authorize(['inventory:create', 'inventory:all']), 
  inventoryServiceProxy
);

/**
 * @route GET /api/v1/inventory/warehouses/:id
 * @desc Get warehouse by ID
 * @access Private
 */
router.get('/warehouses/:id', 
  authenticate(), 
  authorize(['inventory:read', 'inventory:all']),
  uuidValidation,
  validate(),
  inventoryServiceProxy
);

/**
 * @route PUT /api/v1/inventory/warehouses/:id
 * @desc Update warehouse by ID
 * @access Private
 */
router.put('/warehouses/:id', 
  authenticate(), 
  authorize(['inventory:update', 'inventory:all']),
  uuidValidation,
  validate(),
  inventoryServiceProxy
);

/**
 * @route DELETE /api/v1/inventory/warehouses/:id
 * @desc Delete warehouse by ID
 * @access Private
 */
router.delete('/warehouses/:id', 
  authenticate(), 
  authorize(['inventory:delete', 'inventory:all']),
  uuidValidation,
  validate(),
  inventoryServiceProxy
);

/**
 * @route GET /api/v1/inventory/stock
 * @desc Get stock levels for all products
 * @access Private
 */
router.get('/stock', 
  authenticate(), 
  authorize(['inventory:read', 'inventory:all']), 
  inventoryServiceProxy
);

/**
 * @route GET /api/v1/inventory/stock/:productId
 * @desc Get stock levels for a specific product
 * @access Private
 */
router.get('/stock/:productId', 
  authenticate(), 
  authorize(['inventory:read', 'inventory:all']),
  uuidValidation,
  validate(),
  inventoryServiceProxy
);

/**
 * @route POST /api/v1/inventory/transactions
 * @desc Create a new inventory transaction (receipt, shipment, etc.)
 * @access Private
 */
router.post('/transactions', 
  authenticate(), 
  authorize(['inventory:create', 'inventory:all']), 
  inventoryServiceProxy
);

/**
 * @route GET /api/v1/inventory/transactions
 * @desc Get all inventory transactions with pagination and filtering
 * @access Private
 */
router.get('/transactions', 
  authenticate(), 
  authorize(['inventory:read', 'inventory:all']), 
  inventoryServiceProxy
);

/**
 * @route GET /api/v1/inventory/transactions/:id
 * @desc Get inventory transaction by ID
 * @access Private
 */
router.get('/transactions/:id', 
  authenticate(), 
  authorize(['inventory:read', 'inventory:all']),
  uuidValidation,
  validate(),
  inventoryServiceProxy
);

module.exports = router;
