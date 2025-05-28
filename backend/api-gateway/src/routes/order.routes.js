/**
 * Order service routes for API Gateway
 */

const express = require('express');
const { param } = require('express-validator');
const config = require('../config');
const { createServiceProxy } = require('../utils/proxy');
const { authenticate, authorize } = require('../middlewares/auth');
const { validate } = require('../middlewares/validator');

const router = express.Router();

// Create proxy to order service
const orderServiceProxy = createServiceProxy(
  'order-service',
  config.services.order.url,
  { timeout: config.services.order.timeout }
);

// UUID validation rule
const uuidValidation = param('id')
  .isUUID()
  .withMessage('Invalid ID format');

// Routes

/**
 * @route GET /api/v1/orders
 * @desc Get all orders with pagination and filtering
 * @access Private
 */
router.get('/', 
  authenticate(), 
  authorize(['orders:read', 'orders:all']), 
  orderServiceProxy
);

/**
 * @route POST /api/v1/orders
 * @desc Create a new order
 * @access Private
 */
router.post('/', 
  authenticate(), 
  authorize(['orders:create', 'orders:all']), 
  orderServiceProxy
);

/**
 * @route GET /api/v1/orders/:id
 * @desc Get order by ID
 * @access Private
 */
router.get('/:id', 
  authenticate(), 
  authorize(['orders:read', 'orders:all']),
  uuidValidation,
  validate(),
  orderServiceProxy
);

/**
 * @route PUT /api/v1/orders/:id
 * @desc Update order by ID
 * @access Private
 */
router.put('/:id', 
  authenticate(), 
  authorize(['orders:update', 'orders:all']),
  uuidValidation,
  validate(),
  orderServiceProxy
);

/**
 * @route DELETE /api/v1/orders/:id
 * @desc Delete order by ID
 * @access Private
 */
router.delete('/:id', 
  authenticate(), 
  authorize(['orders:delete', 'orders:all']),
  uuidValidation,
  validate(),
  orderServiceProxy
);

/**
 * @route GET /api/v1/orders/:id/items
 * @desc Get order items by order ID
 * @access Private
 */
router.get('/:id/items', 
  authenticate(), 
  authorize(['orders:read', 'orders:all']),
  uuidValidation,
  validate(),
  orderServiceProxy
);

/**
 * @route POST /api/v1/orders/:id/items
 * @desc Add item to order
 * @access Private
 */
router.post('/:id/items', 
  authenticate(), 
  authorize(['orders:update', 'orders:all']),
  uuidValidation,
  validate(),
  orderServiceProxy
);

/**
 * @route PUT /api/v1/orders/:id/status
 * @desc Update order status
 * @access Private
 */
router.put('/:id/status', 
  authenticate(), 
  authorize(['orders:update', 'orders:all']),
  uuidValidation,
  validate(),
  orderServiceProxy
);

/**
 * @route GET /api/v1/orders/:id/history
 * @desc Get order status history
 * @access Private
 */
router.get('/:id/history', 
  authenticate(), 
  authorize(['orders:read', 'orders:all']),
  uuidValidation,
  validate(),
  orderServiceProxy
);

module.exports = router;
