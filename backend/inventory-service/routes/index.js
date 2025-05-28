/**
 * Main routes file for Inventory Service
 */

const express = require('express');
const createCategoryRoutes = require('./category.routes');
const createProductRoutes = require('./product.routes');
const createInventoryRoutes = require('./inventory.routes');
const createWarehouseRoutes = require('./warehouse.routes');
const createInventoryTransactionRoutes = require('./inventory-transaction.routes');

/**
 * Initialize routes
 * @param {Object} controllers - Controllers object
 * @returns {Object} Router
 */
const initRoutes = (controllers) => {
  const router = express.Router();

  // Health check route
  router.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', service: 'inventory-service' });
  });

  // API routes
  router.use('/api/categories', createCategoryRoutes(controllers.categoryController));
  router.use('/api/products', createProductRoutes(controllers.productController));
  router.use('/api/inventory', createInventoryRoutes(controllers.inventoryController));
  router.use('/api/warehouses', createWarehouseRoutes(controllers.warehouseController));
  router.use('/api/inventory-transactions', createInventoryTransactionRoutes(controllers.inventoryTransactionController));

  return router;
};

module.exports = initRoutes;
