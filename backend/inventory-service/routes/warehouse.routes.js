/**
 * Warehouse routes for Inventory Service
 */

const express = require('express');
const { body, param, query } = require('express-validator');
const validator = require('../middlewares/validator');
const auth = require('../middlewares/auth');

/**
 * Create warehouse routes
 * @param {Object} warehouseController - Warehouse controller
 * @returns {Object} Router
 */
const createWarehouseRoutes = (warehouseController) => {
  const router = express.Router();

  /**
   * @route GET /api/warehouses
   * @description Get all warehouses with optional filtering
   * @access Private
   */
  router.get(
    '/',
    auth(['admin', 'inventory_manager', 'inventory_viewer']),
    [
      query('includeInactive').optional().isBoolean().withMessage('includeInactive must be a boolean'),
      query('search').optional().isString().withMessage('search must be a string'),
      query('includeStats').optional().isBoolean().withMessage('includeStats must be a boolean'),
      validator,
    ],
    warehouseController.getWarehouses
  );

  /**
   * @route GET /api/warehouses/:id
   * @description Get warehouse by ID
   * @access Private
   */
  router.get(
    '/:id',
    auth(['admin', 'inventory_manager', 'inventory_viewer']),
    [
      param('id').isInt().withMessage('Warehouse ID must be an integer'),
      query('includeInventory').optional().isBoolean().withMessage('includeInventory must be a boolean'),
      query('includeStats').optional().isBoolean().withMessage('includeStats must be a boolean'),
      validator,
    ],
    warehouseController.getWarehouseById
  );

  /**
   * @route POST /api/warehouses
   * @description Create a new warehouse
   * @access Private
   */
  router.post(
    '/',
    auth(['admin', 'inventory_manager']),
    [
      body('name').notEmpty().withMessage('Name is required').isString().withMessage('Name must be a string'),
      body('description').optional().isString().withMessage('Description must be a string'),
      body('address').optional().isObject().withMessage('Address must be an object'),
      body('address.street').optional().isString().withMessage('Street must be a string'),
      body('address.city').optional().isString().withMessage('City must be a string'),
      body('address.state').optional().isString().withMessage('State must be a string'),
      body('address.country').optional().isString().withMessage('Country must be a string'),
      body('address.postal_code').optional().isString().withMessage('Postal code must be a string'),
      body('contact_info').optional().isObject().withMessage('Contact info must be an object'),
      body('contact_info.phone').optional().isString().withMessage('Phone must be a string'),
      body('contact_info.email').optional().isString().isEmail().withMessage('Email must be a valid email'),
      body('contact_info.contact_person').optional().isString().withMessage('Contact person must be a string'),
      body('is_active').optional().isBoolean().withMessage('is_active must be a boolean'),
      validator,
    ],
    warehouseController.createWarehouse
  );

  /**
   * @route PUT /api/warehouses/:id
   * @description Update a warehouse
   * @access Private
   */
  router.put(
    '/:id',
    auth(['admin', 'inventory_manager']),
    [
      param('id').isInt().withMessage('Warehouse ID must be an integer'),
      body('name').optional().isString().withMessage('Name must be a string'),
      body('description').optional().isString().withMessage('Description must be a string'),
      body('address').optional().isObject().withMessage('Address must be an object'),
      body('address.street').optional().isString().withMessage('Street must be a string'),
      body('address.city').optional().isString().withMessage('City must be a string'),
      body('address.state').optional().isString().withMessage('State must be a string'),
      body('address.country').optional().isString().withMessage('Country must be a string'),
      body('address.postal_code').optional().isString().withMessage('Postal code must be a string'),
      body('contact_info').optional().isObject().withMessage('Contact info must be an object'),
      body('contact_info.phone').optional().isString().withMessage('Phone must be a string'),
      body('contact_info.email').optional().isString().isEmail().withMessage('Email must be a valid email'),
      body('contact_info.contact_person').optional().isString().withMessage('Contact person must be a string'),
      body('is_active').optional().isBoolean().withMessage('is_active must be a boolean'),
      validator,
    ],
    warehouseController.updateWarehouse
  );

  /**
   * @route DELETE /api/warehouses/:id
   * @description Delete a warehouse
   * @access Private
   */
  router.delete(
    '/:id',
    auth(['admin']),
    [
      param('id').isInt().withMessage('Warehouse ID must be an integer'),
      validator,
    ],
    warehouseController.deleteWarehouse
  );

  /**
   * @route GET /api/warehouses/:id/inventory
   * @description Get warehouse inventory
   * @access Private
   */
  router.get(
    '/:id/inventory',
    auth(['admin', 'inventory_manager', 'inventory_viewer']),
    [
      param('id').isInt().withMessage('Warehouse ID must be an integer'),
      query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
      query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
      query('categoryId').optional().isInt().withMessage('Category ID must be an integer'),
      query('lowStock').optional().isBoolean().withMessage('lowStock must be a boolean'),
      query('sortBy').optional().isString().withMessage('Sort by must be a string'),
      query('sortOrder').optional().isIn(['ASC', 'DESC']).withMessage('Sort order must be ASC or DESC'),
      validator,
    ],
    warehouseController.getWarehouseInventory
  );

  /**
   * @route GET /api/warehouses/:id/stats
   * @description Get warehouse statistics
   * @access Private
   */
  router.get(
    '/:id/stats',
    auth(['admin', 'inventory_manager', 'inventory_viewer']),
    [
      param('id').isInt().withMessage('Warehouse ID must be an integer'),
      validator,
    ],
    warehouseController.getWarehouseStats
  );

  return router;
};

module.exports = createWarehouseRoutes;
