/**
 * Inventory routes for Inventory Service
 */

const express = require('express');
const { body, param, query } = require('express-validator');
const validator = require('../middlewares/validator');
const auth = require('../middlewares/auth');

/**
 * Create inventory routes
 * @param {Object} inventoryController - Inventory controller
 * @returns {Object} Router
 */
const createInventoryRoutes = (inventoryController) => {
  const router = express.Router();

  /**
   * @route GET /api/inventory
   * @description Get all inventory items with pagination and filtering
   * @access Private
   */
  router.get(
    '/',
    auth.authorize(['admin', 'inventory_manager', 'inventory_viewer']),
    [
      query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
      query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
      query('productId').optional().isInt().withMessage('Product ID must be an integer'),
      query('warehouseId').optional().isInt().withMessage('Warehouse ID must be an integer'),
      query('lowStock').optional().isBoolean().withMessage('lowStock must be a boolean'),
      query('sortBy').optional().isString().withMessage('Sort by must be a string'),
      query('sortOrder').optional().isIn(['ASC', 'DESC']).withMessage('Sort order must be ASC or DESC'),
      validator,
    ],
    inventoryController.getInventoryItems
  );

  /**
   * @route GET /api/inventory/:id
   * @description Get inventory by ID
   * @access Private
   */
  router.get(
    '/:id',
    auth.authorize(['admin', 'inventory_manager', 'inventory_viewer']),
    [
      param('id').isInt().withMessage('Inventory ID must be an integer'),
      validator,
    ],
    inventoryController.getInventoryById
  );

  /**
   * @route GET /api/inventory/product/:productId/warehouse/:warehouseId
   * @description Get inventory by product and warehouse
   * @access Private
   */
  router.get(
    '/product/:productId/warehouse/:warehouseId',
    auth.authorize(['admin', 'inventory_manager', 'inventory_viewer']),
    [
      param('productId').isInt().withMessage('Product ID must be an integer'),
      param('warehouseId').isInt().withMessage('Warehouse ID must be an integer'),
      validator,
    ],
    inventoryController.getInventoryByProductAndWarehouse
  );

  /**
   * @route POST /api/inventory
   * @description Create a new inventory item
   * @access Private
   */
  router.post(
    '/',
    auth.authorize(['admin', 'inventory_manager']),
    [
      body('product_id').notEmpty().withMessage('Product ID is required').isInt().withMessage('Product ID must be an integer'),
      body('warehouse_id').notEmpty().withMessage('Warehouse ID is required').isInt().withMessage('Warehouse ID must be an integer'),
      body('quantity').notEmpty().withMessage('Quantity is required').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
      body('notes').optional().isString().withMessage('Notes must be a string'),
      validator,
    ],
    inventoryController.createInventory
  );

  /**
   * @route PUT /api/inventory/:id
   * @description Update an inventory item
   * @access Private
   */
  router.put(
    '/:id',
    auth.authorize(['admin', 'inventory_manager']),
    [
      param('id').isInt().withMessage('Inventory ID must be an integer'),
      body('quantity').optional().isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
      body('min_stock_level').optional().isInt({ min: 0 }).withMessage('Min stock level must be a non-negative integer'),
      body('max_stock_level').optional().isInt({ min: 0 }).withMessage('Max stock level must be a non-negative integer'),
      body('location').optional().isString().withMessage('Location must be a string'),
      body('notes').optional().isString().withMessage('Notes must be a string'),
      validator,
    ],
    inventoryController.updateInventory
  );

  /**
   * @route PATCH /api/inventory/:id/adjust
   * @description Adjust inventory quantity
   * @access Private
   */
  router.patch(
    '/:id/adjust',
    auth.authorize(['admin', 'inventory_manager']),
    [
      param('id').isInt().withMessage('Inventory ID must be an integer'),
      body('quantity').notEmpty().withMessage('Quantity is required').isInt().withMessage('Quantity must be an integer'),
      body('notes').optional().isString().withMessage('Notes must be a string'),
      validator,
    ],
    inventoryController.adjustInventory
  );

  /**
   * @route POST /api/inventory/:id/transfer
   * @description Transfer inventory between warehouses
   * @access Private
   */
  router.post(
    '/:id/transfer',
    auth.authorize(['admin', 'inventory_manager']),
    [
      param('id').isInt().withMessage('Inventory ID must be an integer'),
      body('targetWarehouseId').notEmpty().withMessage('Target warehouse ID is required').isInt().withMessage('Target warehouse ID must be an integer'),
      body('quantity').notEmpty().withMessage('Quantity is required').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
      body('notes').optional().isString().withMessage('Notes must be a string'),
      validator,
    ],
    inventoryController.transferInventory
  );

  /**
   * @route POST /api/inventory/:id/reserve
   * @description Reserve inventory for an order
   * @access Private
   */
  router.post(
    '/:id/reserve',
    auth.authorize(['admin', 'inventory_manager', 'order_manager']),
    [
      param('id').isInt().withMessage('Inventory ID must be an integer'),
      body('quantity').notEmpty().withMessage('Quantity is required').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
      body('orderId').notEmpty().withMessage('Order ID is required').isString().withMessage('Order ID must be a string'),
      validator,
    ],
    inventoryController.reserveInventory
  );

  /**
   * @route POST /api/inventory/:id/release
   * @description Release reserved inventory
   * @access Private
   */
  router.post(
    '/:id/release',
    auth.authorize(['admin', 'inventory_manager', 'order_manager']),
    [
      param('id').isInt().withMessage('Inventory ID must be an integer'),
      body('quantity').notEmpty().withMessage('Quantity is required').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
      body('orderId').notEmpty().withMessage('Order ID is required').isString().withMessage('Order ID must be a string'),
      validator,
    ],
    inventoryController.releaseInventory
  );

  /**
   * @route POST /api/inventory/:id/fulfill
   * @description Fulfill order (convert reserved to shipped)
   * @access Private
   */
  router.post(
    '/:id/fulfill',
    auth.authorize(['admin', 'inventory_manager', 'order_manager']),
    [
      param('id').isInt().withMessage('Inventory ID must be an integer'),
      body('quantity').notEmpty().withMessage('Quantity is required').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
      body('orderId').notEmpty().withMessage('Order ID is required').isString().withMessage('Order ID must be a string'),
      validator,
    ],
    inventoryController.fulfillOrder
  );

  /**
   * @route GET /api/inventory/:id/transactions
   * @description Get inventory transactions
   * @access Private
   */
  router.get(
    '/:id/transactions',
    auth.authorize(['admin', 'inventory_manager', 'inventory_viewer']),
    [
      param('id').isInt().withMessage('Inventory ID must be an integer'),
      query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
      query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
      query('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO8601 date'),
      query('endDate').optional().isISO8601().withMessage('End date must be a valid ISO8601 date'),
      query('type').optional().isString().withMessage('Type must be a string'),
      validator,
    ],
    inventoryController.getInventoryTransactions
  );

  /**
   * @route GET /api/inventory/low-stock
   * @description Get low stock items
   * @access Private
   */
  router.get(
    '/low-stock',
    auth.authorize(['admin', 'inventory_manager', 'inventory_viewer']),
    [
      query('warehouseId').optional().isInt().withMessage('Warehouse ID must be an integer'),
      query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
      validator,
    ],
    inventoryController.getLowStockItems
  );

  /**
   * @route GET /api/inventory/summary
   * @description Get inventory summary
   * @access Private
   */
  router.get(
    '/summary',
    auth.authorize(['admin', 'inventory_manager', 'inventory_viewer']),
    inventoryController.getInventorySummary
  );

  return router;
};

module.exports = createInventoryRoutes;
