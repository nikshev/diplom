/**
 * Inventory Transaction routes for Inventory Service
 */

const express = require('express');
const { body, param, query } = require('express-validator');
const validator = require('../middlewares/validator');
const auth = require('../middlewares/auth');

/**
 * Create inventory transaction routes
 * @param {Object} inventoryTransactionController - Inventory Transaction controller
 * @returns {Object} Router
 */
const createInventoryTransactionRoutes = (inventoryTransactionController) => {
  const router = express.Router();

  /**
   * @route GET /api/inventory-transactions
   * @description Get all transactions with pagination and filtering
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
      query('inventoryId').optional().isInt().withMessage('Inventory ID must be an integer'),
      query('type').optional().isString().withMessage('Type must be a string'),
      query('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO8601 date'),
      query('endDate').optional().isISO8601().withMessage('End date must be a valid ISO8601 date'),
      query('userId').optional().isInt().withMessage('User ID must be an integer'),
      query('sortBy').optional().isString().withMessage('Sort by must be a string'),
      query('sortOrder').optional().isIn(['ASC', 'DESC']).withMessage('Sort order must be ASC or DESC'),
      validator,
    ],
    inventoryTransactionController.getTransactions
  );

  /**
   * @route GET /api/inventory-transactions/:id
   * @description Get transaction by ID
   * @access Private
   */
  router.get(
    '/:id',
    auth.authorize(['admin', 'inventory_manager', 'inventory_viewer']),
    [
      param('id').isInt().withMessage('Transaction ID must be an integer'),
      validator,
    ],
    inventoryTransactionController.getTransactionById
  );

  /**
   * @route POST /api/inventory-transactions
   * @description Create a new transaction
   * @access Private
   */
  router.post(
    '/',
    auth.authorize(['admin', 'inventory_manager']),
    [
      body('inventory_id').notEmpty().withMessage('Inventory ID is required').isInt().withMessage('Inventory ID must be an integer'),
      body('type').notEmpty().withMessage('Type is required').isString().withMessage('Type must be a string'),
      body('quantity').notEmpty().withMessage('Quantity is required').isInt().withMessage('Quantity must be an integer'),
      body('reference_id').optional().isString().withMessage('Reference ID must be a string'),
      body('reference_type').optional().isString().withMessage('Reference type must be a string'),
      body('notes').optional().isString().withMessage('Notes must be a string'),
      validator,
    ],
    inventoryTransactionController.createTransaction
  );

  /**
   * @route GET /api/inventory-transactions/product/:productId
   * @description Get transactions for a product
   * @access Private
   */
  router.get(
    '/product/:productId',
    auth.authorize(['admin', 'inventory_manager', 'inventory_viewer']),
    [
      param('productId').isInt().withMessage('Product ID must be an integer'),
      query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
      query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
      query('type').optional().isString().withMessage('Type must be a string'),
      query('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO8601 date'),
      query('endDate').optional().isISO8601().withMessage('End date must be a valid ISO8601 date'),
      validator,
    ],
    inventoryTransactionController.getProductTransactions
  );

  /**
   * @route GET /api/inventory-transactions/warehouse/:warehouseId
   * @description Get transactions for a warehouse
   * @access Private
   */
  router.get(
    '/warehouse/:warehouseId',
    auth.authorize(['admin', 'inventory_manager', 'inventory_viewer']),
    [
      param('warehouseId').isInt().withMessage('Warehouse ID must be an integer'),
      query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
      query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
      query('type').optional().isString().withMessage('Type must be a string'),
      query('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO8601 date'),
      query('endDate').optional().isISO8601().withMessage('End date must be a valid ISO8601 date'),
      query('productId').optional().isInt().withMessage('Product ID must be an integer'),
      validator,
    ],
    inventoryTransactionController.getWarehouseTransactions
  );

  /**
   * @route GET /api/inventory-transactions/inventory/:inventoryId
   * @description Get transactions for an inventory item
   * @access Private
   */
  router.get(
    '/inventory/:inventoryId',
    auth.authorize(['admin', 'inventory_manager', 'inventory_viewer']),
    [
      param('inventoryId').isInt().withMessage('Inventory ID must be an integer'),
      query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
      query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
      query('type').optional().isString().withMessage('Type must be a string'),
      query('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO8601 date'),
      query('endDate').optional().isISO8601().withMessage('End date must be a valid ISO8601 date'),
      validator,
    ],
    inventoryTransactionController.getInventoryItemTransactions
  );

  /**
   * @route GET /api/inventory-transactions/type/:type
   * @description Get transactions by type
   * @access Private
   */
  router.get(
    '/type/:type',
    auth.authorize(['admin', 'inventory_manager', 'inventory_viewer']),
    [
      param('type').isString().withMessage('Type must be a string'),
      query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
      query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
      query('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO8601 date'),
      query('endDate').optional().isISO8601().withMessage('End date must be a valid ISO8601 date'),
      query('productId').optional().isInt().withMessage('Product ID must be an integer'),
      query('warehouseId').optional().isInt().withMessage('Warehouse ID must be an integer'),
      validator,
    ],
    inventoryTransactionController.getTransactionsByType
  );

  /**
   * @route GET /api/inventory-transactions/date-range
   * @description Get transactions by date range
   * @access Private
   */
  router.get(
    '/date-range',
    auth.authorize(['admin', 'inventory_manager', 'inventory_viewer']),
    [
      query('startDate').notEmpty().withMessage('Start date is required').isISO8601().withMessage('Start date must be a valid ISO8601 date'),
      query('endDate').notEmpty().withMessage('End date is required').isISO8601().withMessage('End date must be a valid ISO8601 date'),
      query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
      query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
      query('type').optional().isString().withMessage('Type must be a string'),
      query('productId').optional().isInt().withMessage('Product ID must be an integer'),
      query('warehouseId').optional().isInt().withMessage('Warehouse ID must be an integer'),
      validator,
    ],
    inventoryTransactionController.getTransactionsByDateRange
  );

  /**
   * @route GET /api/inventory-transactions/summary
   * @description Get transaction summary
   * @access Private
   */
  router.get(
    '/summary',
    auth.authorize(['admin', 'inventory_manager', 'inventory_viewer']),
    [
      query('startDate').notEmpty().withMessage('Start date is required').isISO8601().withMessage('Start date must be a valid ISO8601 date'),
      query('endDate').notEmpty().withMessage('End date is required').isISO8601().withMessage('End date must be a valid ISO8601 date'),
      query('groupBy').optional().isIn(['type', 'product', 'warehouse', 'day', 'week', 'month']).withMessage('Group by must be one of: type, product, warehouse, day, week, month'),
      query('productId').optional().isInt().withMessage('Product ID must be an integer'),
      query('warehouseId').optional().isInt().withMessage('Warehouse ID must be an integer'),
      validator,
    ],
    inventoryTransactionController.getTransactionSummary
  );

  return router;
};

module.exports = createInventoryTransactionRoutes;
