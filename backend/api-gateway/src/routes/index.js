/**
 * Main router for API Gateway
 */

const express = require('express');
const authRoutes = require('./auth.routes');
const orderRoutes = require('./order.routes');
const crmRoutes = require('./crm.routes');
const inventoryRoutes = require('./inventory.routes');
const financeRoutes = require('./finance.routes');
const analyticsRoutes = require('./analytics.routes');
const metricsRoutes = require('./metrics.routes');
const cacheRoutes = require('./cache.routes');
const customersRoutes = require('./customers.routes');
const productsRoutes = require('./products.routes');
const usersRoutes = require('./users.routes');

const router = express.Router();

// API version
const API_VERSION = 'v1';

// Routes
router.use(`/${API_VERSION}/auth`, authRoutes);
// Add non-versioned route for auth to handle requests at /api/auth/login
router.use('/auth', authRoutes);
router.use(`/${API_VERSION}/orders`, orderRoutes);
router.use(`/${API_VERSION}/crm`, crmRoutes);
router.use(`/${API_VERSION}/inventory`, inventoryRoutes);
router.use(`/${API_VERSION}/finance`, financeRoutes);
router.use(`/${API_VERSION}/analytics`, analyticsRoutes);
router.use(`/${API_VERSION}/metrics`, metricsRoutes);
router.use(`/${API_VERSION}/cache`, cacheRoutes);

// Direct routes for frontend compatibility
router.use(`/${API_VERSION}/customers`, customersRoutes);
router.use(`/${API_VERSION}/products`, productsRoutes);
router.use(`/${API_VERSION}/users`, usersRoutes);

// API documentation route
router.get('/', (req, res) => {
  res.json({
    message: 'Business Activity Management Information System API',
    version: API_VERSION,
    endpoints: [
      `/api/${API_VERSION}/auth`,
      `/api/${API_VERSION}/orders`,
      `/api/${API_VERSION}/crm`,
      `/api/${API_VERSION}/inventory`,
      `/api/${API_VERSION}/finance`,
      `/api/${API_VERSION}/analytics`,
      `/api/${API_VERSION}/metrics`,
      `/api/${API_VERSION}/cache`,
      `/api/${API_VERSION}/customers`,
      `/api/${API_VERSION}/products`,
      `/api/${API_VERSION}/users`,
    ],
  });
});

module.exports = router;
