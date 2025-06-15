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
    ],
  });
});

module.exports = router;
