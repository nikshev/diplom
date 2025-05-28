/**
 * Product routes for Inventory Service
 */

const express = require('express');
const { body, param, query } = require('express-validator');
const validator = require('../middlewares/validator');
const auth = require('../middlewares/auth');

/**
 * Create product routes
 * @param {Object} productController - Product controller
 * @returns {Object} Router
 */
const createProductRoutes = (productController) => {
  const router = express.Router();

  /**
   * @route GET /api/products
   * @description Get all products with pagination and filtering
   * @access Public
   */
  router.get(
    '/',
    [
      query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
      query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
      query('categoryId').optional().isInt().withMessage('Category ID must be an integer'),
      query('minPrice').optional().isFloat({ min: 0 }).withMessage('Min price must be a non-negative number'),
      query('maxPrice').optional().isFloat({ min: 0 }).withMessage('Max price must be a non-negative number'),
      query('sortBy').optional().isString().withMessage('Sort by must be a string'),
      query('sortOrder').optional().isIn(['ASC', 'DESC']).withMessage('Sort order must be ASC or DESC'),
      query('includeInactive').optional().isBoolean().withMessage('includeInactive must be a boolean'),
      query('includeInventory').optional().isBoolean().withMessage('includeInventory must be a boolean'),
      validator,
    ],
    productController.getProducts
  );

  /**
   * @route GET /api/products/:id
   * @description Get product by ID
   * @access Public
   */
  router.get(
    '/:id',
    [
      param('id').isInt().withMessage('Product ID must be an integer'),
      query('includeInventory').optional().isBoolean().withMessage('includeInventory must be a boolean'),
      validator,
    ],
    productController.getProductById
  );

  /**
   * @route GET /api/products/sku/:sku
   * @description Get product by SKU
   * @access Public
   */
  router.get(
    '/sku/:sku',
    [
      param('sku').isString().withMessage('SKU must be a string'),
      query('includeInventory').optional().isBoolean().withMessage('includeInventory must be a boolean'),
      validator,
    ],
    productController.getProductBySku
  );

  /**
   * @route POST /api/products
   * @description Create a new product
   * @access Private
   */
  router.post(
    '/',
    auth(['admin', 'inventory_manager']),
    [
      body('name').notEmpty().withMessage('Name is required').isString().withMessage('Name must be a string'),
      body('description').optional().isString().withMessage('Description must be a string'),
      body('sku').notEmpty().withMessage('SKU is required').isString().withMessage('SKU must be a string'),
      body('price').notEmpty().withMessage('Price is required').isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
      body('category_id').notEmpty().withMessage('Category ID is required').isInt().withMessage('Category ID must be an integer'),
      body('is_active').optional().isBoolean().withMessage('is_active must be a boolean'),
      body('min_stock_level').optional().isInt({ min: 0 }).withMessage('Min stock level must be a non-negative integer'),
      body('max_stock_level').optional().isInt({ min: 0 }).withMessage('Max stock level must be a non-negative integer'),
      body('unit').optional().isString().withMessage('Unit must be a string'),
      body('weight').optional().isFloat({ min: 0 }).withMessage('Weight must be a non-negative number'),
      body('dimensions').optional().isObject().withMessage('Dimensions must be an object'),
      body('attributes').optional().isObject().withMessage('Attributes must be an object'),
      validator,
    ],
    productController.createProduct
  );

  /**
   * @route PUT /api/products/:id
   * @description Update a product
   * @access Private
   */
  router.put(
    '/:id',
    auth(['admin', 'inventory_manager']),
    [
      param('id').isInt().withMessage('Product ID must be an integer'),
      body('name').optional().isString().withMessage('Name must be a string'),
      body('description').optional().isString().withMessage('Description must be a string'),
      body('sku').optional().isString().withMessage('SKU must be a string'),
      body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
      body('category_id').optional().isInt().withMessage('Category ID must be an integer'),
      body('is_active').optional().isBoolean().withMessage('is_active must be a boolean'),
      body('min_stock_level').optional().isInt({ min: 0 }).withMessage('Min stock level must be a non-negative integer'),
      body('max_stock_level').optional().isInt({ min: 0 }).withMessage('Max stock level must be a non-negative integer'),
      body('unit').optional().isString().withMessage('Unit must be a string'),
      body('weight').optional().isFloat({ min: 0 }).withMessage('Weight must be a non-negative number'),
      body('dimensions').optional().isObject().withMessage('Dimensions must be an object'),
      body('attributes').optional().isObject().withMessage('Attributes must be an object'),
      validator,
    ],
    productController.updateProduct
  );

  /**
   * @route DELETE /api/products/:id
   * @description Delete a product
   * @access Private
   */
  router.delete(
    '/:id',
    auth(['admin', 'inventory_manager']),
    [
      param('id').isInt().withMessage('Product ID must be an integer'),
      validator,
    ],
    productController.deleteProduct
  );

  /**
   * @route PATCH /api/products/:id/price
   * @description Update product price
   * @access Private
   */
  router.patch(
    '/:id/price',
    auth(['admin', 'inventory_manager']),
    [
      param('id').isInt().withMessage('Product ID must be an integer'),
      body('price').notEmpty().withMessage('Price is required').isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
      validator,
    ],
    productController.updateProductPrice
  );

  /**
   * @route PATCH /api/products/:id/status
   * @description Update product status
   * @access Private
   */
  router.patch(
    '/:id/status',
    auth(['admin', 'inventory_manager']),
    [
      param('id').isInt().withMessage('Product ID must be an integer'),
      body('isActive').notEmpty().withMessage('isActive is required').isBoolean().withMessage('isActive must be a boolean'),
      validator,
    ],
    productController.updateProductStatus
  );

  /**
   * @route GET /api/products/search
   * @description Search products
   * @access Public
   */
  router.get(
    '/search',
    [
      query('query').notEmpty().withMessage('Search query is required').isString().withMessage('Search query must be a string'),
      query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
      query('includeInactive').optional().isBoolean().withMessage('includeInactive must be a boolean'),
      validator,
    ],
    productController.searchProducts
  );

  /**
   * @route GET /api/products/low-stock
   * @description Get low stock products
   * @access Private
   */
  router.get(
    '/low-stock',
    auth(['admin', 'inventory_manager', 'inventory_viewer']),
    [
      query('warehouseId').optional().isInt().withMessage('Warehouse ID must be an integer'),
      query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
      validator,
    ],
    productController.getLowStockProducts
  );

  /**
   * @route GET /api/products/:id/stock
   * @description Get product stock levels
   * @access Public
   */
  router.get(
    '/:id/stock',
    [
      param('id').isInt().withMessage('Product ID must be an integer'),
      validator,
    ],
    productController.getProductStockLevels
  );

  return router;
};

module.exports = createProductRoutes;
