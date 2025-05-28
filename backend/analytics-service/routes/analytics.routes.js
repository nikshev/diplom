/**
 * Analytics routes for Analytics Service
 */

const express = require('express');
const { checkAuth, checkRole } = require('../middlewares/auth');
const validate = require('../middlewares/validator');

/**
 * Initialize analytics routes
 * @param {Object} controllers - Controllers
 * @returns {Object} Router
 */
function initAnalyticsRoutes(controllers) {
  const router = express.Router();
  const { analyticsController } = controllers;

  /**
   * @swagger
   * /api/analytics/overview:
   *   get:
   *     summary: Get business overview
   *     description: Get business overview with key metrics
   *     tags: [Analytics]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: timeframe
   *         schema:
   *           type: string
   *           enum: [today, yesterday, week, month, quarter, year, last7days, last30days, last90days, last12months]
   *         description: Timeframe for metrics
   *     responses:
   *       200:
   *         description: Business overview
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Server error
   */
  router.get('/overview', checkAuth, analyticsController.getBusinessOverview.bind(analyticsController));

  /**
   * @swagger
   * /api/analytics/sales:
   *   get:
   *     summary: Get sales analytics
   *     description: Get sales analytics with trends and breakdowns
   *     tags: [Analytics]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: timeframe
   *         schema:
   *           type: string
   *           enum: [today, yesterday, week, month, quarter, year, last7days, last30days, last90days, last12months]
   *         description: Timeframe for metrics
   *       - in: query
   *         name: includeProducts
   *         schema:
   *           type: boolean
   *         description: Include product breakdown
   *       - in: query
   *         name: includeCategories
   *         schema:
   *           type: boolean
   *         description: Include category breakdown
   *       - in: query
   *         name: includeCustomers
   *         schema:
   *           type: boolean
   *         description: Include customer breakdown
   *     responses:
   *       200:
   *         description: Sales analytics
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Server error
   */
  router.get('/sales', checkAuth, analyticsController.getSalesAnalytics.bind(analyticsController));

  /**
   * @swagger
   * /api/analytics/financial:
   *   get:
   *     summary: Get financial analytics
   *     description: Get financial analytics with trends and breakdowns
   *     tags: [Analytics]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: timeframe
   *         schema:
   *           type: string
   *           enum: [today, yesterday, week, month, quarter, year, last7days, last30days, last90days, last12months]
   *         description: Timeframe for metrics
   *       - in: query
   *         name: includeCategories
   *         schema:
   *           type: boolean
   *         description: Include category breakdown
   *       - in: query
   *         name: includeAccounts
   *         schema:
   *           type: boolean
   *         description: Include accounts breakdown
   *     responses:
   *       200:
   *         description: Financial analytics
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Server error
   */
  router.get('/financial', checkAuth, analyticsController.getFinancialAnalytics.bind(analyticsController));

  /**
   * @swagger
   * /api/analytics/inventory:
   *   get:
   *     summary: Get inventory analytics
   *     description: Get inventory analytics with trends and breakdowns
   *     tags: [Analytics]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: timeframe
   *         schema:
   *           type: string
   *           enum: [today, yesterday, week, month, quarter, year, last7days, last30days, last90days, last12months]
   *         description: Timeframe for metrics
   *       - in: query
   *         name: includeCategories
   *         schema:
   *           type: boolean
   *         description: Include category breakdown
   *       - in: query
   *         name: includeLowStock
   *         schema:
   *           type: boolean
   *         description: Include low stock items
   *     responses:
   *       200:
   *         description: Inventory analytics
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Server error
   */
  router.get('/inventory', checkAuth, analyticsController.getInventoryAnalytics.bind(analyticsController));

  /**
   * @swagger
   * /api/analytics/customers:
   *   get:
   *     summary: Get customer analytics
   *     description: Get customer analytics with trends and breakdowns
   *     tags: [Analytics]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: timeframe
   *         schema:
   *           type: string
   *           enum: [today, yesterday, week, month, quarter, year, last7days, last30days, last90days, last12months]
   *         description: Timeframe for metrics
   *       - in: query
   *         name: includeSegments
   *         schema:
   *           type: boolean
   *         description: Include customer segments
   *       - in: query
   *         name: includeRetention
   *         schema:
   *           type: boolean
   *         description: Include retention data
   *     responses:
   *       200:
   *         description: Customer analytics
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Server error
   */
  router.get('/customers', checkAuth, analyticsController.getCustomerAnalytics.bind(analyticsController));

  /**
   * @swagger
   * /api/analytics/collect:
   *   post:
   *     summary: Collect all metrics data
   *     description: Trigger data collection for all active metrics
   *     tags: [Analytics]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Collection results
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       500:
   *         description: Server error
   */
  router.post('/collect', checkAuth, checkRole(['admin', 'analyst']), analyticsController.collectAllMetrics.bind(analyticsController));

  /**
   * @swagger
   * /api/analytics/collect/{id}:
   *   post:
   *     summary: Collect metric data
   *     description: Trigger data collection for a specific metric
   *     tags: [Analytics]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Metric ID
   *     responses:
   *       200:
   *         description: Collected data point
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Metric not found
   *       500:
   *         description: Server error
   */
  router.post('/collect/:id', checkAuth, checkRole(['admin', 'analyst']), analyticsController.collectMetricData.bind(analyticsController));

  /**
   * @swagger
   * /api/analytics/cleanup:
   *   post:
   *     summary: Clean up old data
   *     description: Clean up old metric data based on retention policy
   *     tags: [Analytics]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Cleanup results
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       500:
   *         description: Server error
   */
  router.post('/cleanup', checkAuth, checkRole(['admin']), analyticsController.cleanupOldData.bind(analyticsController));

  return router;
}

module.exports = initAnalyticsRoutes;
