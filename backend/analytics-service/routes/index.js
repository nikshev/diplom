/**
 * Main router for Analytics Service
 */

const express = require('express');
const initMetricRoutes = require('./metric.routes');
const initKPIRoutes = require('./kpi.routes');
const initDashboardRoutes = require('./dashboard.routes');
const initReportRoutes = require('./report.routes');
const initAnalyticsRoutes = require('./analytics.routes');

/**
 * Initialize routes
 * @param {Object} controllers - Controllers
 * @returns {Object} Router
 */
function initRoutes(controllers) {
  const router = express.Router();

  // API routes
  router.use('/api/metrics', initMetricRoutes(controllers));
  router.use('/api/kpis', initKPIRoutes(controllers));
  router.use('/api/dashboards', initDashboardRoutes(controllers));
  router.use('/api/reports', initReportRoutes(controllers));
  router.use('/api/analytics', initAnalyticsRoutes(controllers));

  // Health check route
  router.get('/health', (req, res) => {
    res.status(200).json({
      status: 'ok',
      service: 'analytics-service',
      timestamp: new Date().toISOString(),
    });
  });

  // API documentation route
  router.get('/api-docs', (req, res) => {
    res.redirect('/api-docs/index.html');
  });

  return router;
}

module.exports = initRoutes;
