/**
 * Order routes for Order Service
 */

const express = require('express');
const { body, param, query } = require('express-validator');
const { validate } = require('../middlewares/validator');
const { authenticate, authorize } = require('../middlewares/auth');

/**
 * Initialize order routes
 * @param {Object} controllers - Controller instances
 * @returns {Object} Express router
 */
function initOrderRoutes(controllers) {
  const router = express.Router();
  const { orderController } = controllers;

  // UUID validation rule
  const uuidValidation = param('id')
    .isUUID()
    .withMessage('Invalid ID format');

  // Order creation validation rules
  const createOrderValidation = [
    body('customer_id')
      .isUUID()
      .withMessage('Customer ID must be a valid UUID'),
    body('items')
      .isArray()
      .withMessage('Items must be an array')
      .notEmpty()
      .withMessage('At least one item is required'),
    body('items.*.product_id')
      .isUUID()
      .withMessage('Product ID must be a valid UUID'),
    body('items.*.quantity')
      .isInt({ min: 1 })
      .withMessage('Quantity must be a positive integer'),
    body('items.*.price')
      .isFloat({ min: 0 })
      .withMessage('Price must be a positive number'),
    body('shipping_address')
      .optional()
      .isString()
      .withMessage('Shipping address must be a string'),
    body('shipping_city')
      .optional()
      .isString()
      .withMessage('Shipping city must be a string'),
    body('shipping_postal_code')
      .optional()
      .isString()
      .withMessage('Shipping postal code must be a string'),
    body('shipping_country')
      .optional()
      .isString()
      .withMessage('Shipping country must be a string'),
    body('shipping_method')
      .optional()
      .isString()
      .withMessage('Shipping method must be a string'),
    body('payment_method')
      .optional()
      .isString()
      .withMessage('Payment method must be a string'),
    body('notes')
      .optional()
      .isString()
      .withMessage('Notes must be a string'),
  ];

  // Order update validation rules
  const updateOrderValidation = [
    body('shipping_address')
      .optional()
      .isString()
      .withMessage('Shipping address must be a string'),
    body('shipping_city')
      .optional()
      .isString()
      .withMessage('Shipping city must be a string'),
    body('shipping_postal_code')
      .optional()
      .isString()
      .withMessage('Shipping postal code must be a string'),
    body('shipping_country')
      .optional()
      .isString()
      .withMessage('Shipping country must be a string'),
    body('shipping_method')
      .optional()
      .isString()
      .withMessage('Shipping method must be a string'),
    body('payment_method')
      .optional()
      .isString()
      .withMessage('Payment method must be a string'),
    body('notes')
      .optional()
      .isString()
      .withMessage('Notes must be a string'),
  ];

  // Status update validation rules
  const updateStatusValidation = [
    body('status')
      .isString()
      .notEmpty()
      .withMessage('Status is required')
      .isIn(['new', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'])
      .withMessage('Invalid status'),
    body('comment')
      .optional()
      .isString()
      .withMessage('Comment must be a string'),
  ];

  /**
   * @route GET /api/orders
   * @desc Get all orders with pagination and filtering
   * @access Private
   */
  router.get(
    '/',
    authenticate(),
    authorize(['orders:read', 'orders:all']),
    [
      query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
      query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
      query('status')
        .optional()
        .isIn(['new', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'])
        .withMessage('Invalid status'),
      query('customerId')
        .optional()
        .isUUID()
        .withMessage('Customer ID must be a valid UUID'),
      query('startDate')
        .optional()
        .isISO8601()
        .withMessage('Start date must be a valid ISO 8601 date'),
      query('endDate')
        .optional()
        .isISO8601()
        .withMessage('End date must be a valid ISO 8601 date'),
      query('sortBy')
        .optional()
        .isIn(['created_at', 'updated_at', 'total_amount', 'status'])
        .withMessage('Invalid sort field'),
      query('sortOrder')
        .optional()
        .isIn(['ASC', 'DESC'])
        .withMessage('Sort order must be ASC or DESC'),
    ],
    validate(),
    orderController.getOrders
  );

  /**
   * @route GET /api/orders/:id
   * @desc Get order by ID
   * @access Private
   */
  router.get(
    '/:id',
    authenticate(),
    authorize(['orders:read', 'orders:all']),
    uuidValidation,
    validate(),
    orderController.getOrderById
  );

  /**
   * @route POST /api/orders
   * @desc Create a new order
   * @access Private
   */
  router.post(
    '/',
    authenticate(),
    authorize(['orders:create', 'orders:all']),
    createOrderValidation,
    validate(),
    orderController.createOrder
  );

  /**
   * @route PUT /api/orders/:id
   * @desc Update order
   * @access Private
   */
  router.put(
    '/:id',
    authenticate(),
    authorize(['orders:update', 'orders:all']),
    uuidValidation,
    updateOrderValidation,
    validate(),
    orderController.updateOrder
  );

  /**
   * @route PATCH /api/orders/:id/status
   * @desc Update order status
   * @access Private
   */
  router.patch(
    '/:id/status',
    authenticate(),
    authorize(['orders:update', 'orders:all']),
    uuidValidation,
    updateStatusValidation,
    validate(),
    orderController.updateOrderStatus
  );

  /**
   * @route DELETE /api/orders/:id
   * @desc Delete order
   * @access Private
   */
  router.delete(
    '/:id',
    authenticate(),
    authorize(['orders:delete', 'orders:all']),
    uuidValidation,
    validate(),
    orderController.deleteOrder
  );

  /**
   * @route GET /api/orders/:id/total
   * @desc Calculate order total
   * @access Private
   */
  router.get(
    '/:id/total',
    authenticate(),
    authorize(['orders:read', 'orders:all']),
    uuidValidation,
    validate(),
    orderController.calculateOrderTotal
  );

  return router;
}

module.exports = initOrderRoutes;
