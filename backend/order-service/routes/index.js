/**
 * Main router for Order Service
 */

const express = require('express');
const initOrderRoutes = require('./order.routes');

/**
 * Initialize routes
 * @param {Object} controllers - Controller instances
 * @returns {Object} Express router
 */
function initRoutes(controllers) {
  const router = express.Router();

  // Order routes
  router.use('/orders', initOrderRoutes(controllers));

  // API documentation route
  router.get('/', (req, res) => {
    res.json({
      message: 'Order Service API',
      version: '1.0.0',
      endpoints: [
        '/api/orders',
      ],
    });
  });

  return router;
}

module.exports = initRoutes;
