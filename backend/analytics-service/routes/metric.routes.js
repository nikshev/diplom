/**
 * Metric routes for Analytics Service
 */

const express = require('express');
const { checkAuth, checkRole } = require('../middlewares/auth');
const validate = require('../middlewares/validator');

/**
 * Initialize metric routes
 * @param {Object} controllers - Controllers
 * @returns {Object} Router
 */
function initMetricRoutes(controllers) {
  const router = express.Router();
  const { metricController } = controllers;

  /**
   * @swagger
   * /api/metrics:
   *   get:
   *     summary: Get metrics
   *     description: Get metrics with pagination and filtering
   *     tags: [Metrics]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *         description: Page number
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *         description: Items per page
   *       - in: query
   *         name: category
   *         schema:
   *           type: string
   *         description: Filter by category
   *       - in: query
   *         name: dataSource
   *         schema:
   *           type: string
   *         description: Filter by data source
   *       - in: query
   *         name: isKpi
   *         schema:
   *           type: boolean
   *         description: Filter by KPI status
   *       - in: query
   *         name: isActive
   *         schema:
   *           type: boolean
   *         description: Filter by active status
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *         description: Search term
   *       - in: query
   *         name: sortBy
   *         schema:
   *           type: string
   *         description: Sort by field
   *       - in: query
   *         name: sortOrder
   *         schema:
   *           type: string
   *           enum: [ASC, DESC]
   *         description: Sort order
   *     responses:
   *       200:
   *         description: Metrics list with pagination
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Server error
   */
  router.get('/', checkAuth, metricController.getMetrics.bind(metricController));

  /**
   * @swagger
   * /api/metrics/{id}:
   *   get:
   *     summary: Get metric by ID
   *     description: Get metric by ID
   *     tags: [Metrics]
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
   *         description: Metric details
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Metric not found
   *       500:
   *         description: Server error
   */
  router.get('/:id', checkAuth, metricController.getMetricById.bind(metricController));

  /**
   * @swagger
   * /api/metrics:
   *   post:
   *     summary: Create metric
   *     description: Create a new metric
   *     tags: [Metrics]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - display_name
   *               - category
   *               - data_source
   *               - data_type
   *               - calculation_method
   *               - aggregation_period
   *             properties:
   *               name:
   *                 type: string
   *               display_name:
   *                 type: string
   *               description:
   *                 type: string
   *               category:
   *                 type: string
   *               data_source:
   *                 type: string
   *               data_type:
   *                 type: string
   *               calculation_method:
   *                 type: string
   *               calculation_formula:
   *                 type: string
   *               aggregation_period:
   *                 type: string
   *               unit:
   *                 type: string
   *               is_active:
   *                 type: boolean
   *               is_kpi:
   *                 type: boolean
   *               target_value:
   *                 type: number
   *               target_period:
   *                 type: string
   *               visualization_type:
   *                 type: string
   *     responses:
   *       201:
   *         description: Created metric
   *       400:
   *         description: Bad request
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       500:
   *         description: Server error
   */
  router.post('/', checkAuth, checkRole(['admin', 'analyst']), metricController.createMetric.bind(metricController));

  /**
   * @swagger
   * /api/metrics/{id}:
   *   put:
   *     summary: Update metric
   *     description: Update an existing metric
   *     tags: [Metrics]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Metric ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *               display_name:
   *                 type: string
   *               description:
   *                 type: string
   *               category:
   *                 type: string
   *               data_source:
   *                 type: string
   *               data_type:
   *                 type: string
   *               calculation_method:
   *                 type: string
   *               calculation_formula:
   *                 type: string
   *               aggregation_period:
   *                 type: string
   *               unit:
   *                 type: string
   *               is_active:
   *                 type: boolean
   *               is_kpi:
   *                 type: boolean
   *               target_value:
   *                 type: number
   *               target_period:
   *                 type: string
   *               visualization_type:
   *                 type: string
   *     responses:
   *       200:
   *         description: Updated metric
   *       400:
   *         description: Bad request
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Metric not found
   *       500:
   *         description: Server error
   */
  router.put('/:id', checkAuth, checkRole(['admin', 'analyst']), metricController.updateMetric.bind(metricController));

  /**
   * @swagger
   * /api/metrics/{id}:
   *   delete:
   *     summary: Delete metric
   *     description: Delete an existing metric
   *     tags: [Metrics]
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
   *       204:
   *         description: No content
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Metric not found
   *       500:
   *         description: Server error
   */
  router.delete('/:id', checkAuth, checkRole(['admin']), metricController.deleteMetric.bind(metricController));

  /**
   * @swagger
   * /api/metrics/{id}/data:
   *   get:
   *     summary: Get metric data
   *     description: Get data points for a metric
   *     tags: [Metrics]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Metric ID
   *       - in: query
   *         name: startDate
   *         schema:
   *           type: string
   *           format: date
   *         description: Start date
   *       - in: query
   *         name: endDate
   *         schema:
   *           type: string
   *           format: date
   *         description: End date
   *       - in: query
   *         name: period
   *         schema:
   *           type: string
   *           enum: [daily, weekly, monthly, quarterly, yearly]
   *         description: Period type
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *         description: Maximum number of data points
   *       - in: query
   *         name: includeForecasts
   *         schema:
   *           type: boolean
   *         description: Include forecasted data
   *     responses:
   *       200:
   *         description: Metric data
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Metric not found
   *       500:
   *         description: Server error
   */
  router.get('/:id/data', checkAuth, metricController.getMetricData.bind(metricController));

  /**
   * @swagger
   * /api/metrics/{id}/data:
   *   post:
   *     summary: Add metric data
   *     description: Add a new data point for a metric
   *     tags: [Metrics]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Metric ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - date
   *               - value
   *               - period
   *               - period_start
   *               - period_end
   *             properties:
   *               date:
   *                 type: string
   *                 format: date
   *               value:
   *                 type: number
   *               period:
   *                 type: string
   *                 enum: [daily, weekly, monthly, quarterly, yearly]
   *               period_start:
   *                 type: string
   *                 format: date
   *               period_end:
   *                 type: string
   *                 format: date
   *               source_data:
   *                 type: object
   *               is_forecasted:
   *                 type: boolean
   *     responses:
   *       201:
   *         description: Created data point
   *       400:
   *         description: Bad request
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Metric not found
   *       500:
   *         description: Server error
   */
  router.post('/:id/data', checkAuth, checkRole(['admin', 'analyst']), metricController.addMetricData.bind(metricController));

  /**
   * @swagger
   * /api/metrics/{id}/data/{dataId}:
   *   put:
   *     summary: Update metric data
   *     description: Update an existing data point for a metric
   *     tags: [Metrics]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Metric ID
   *       - in: path
   *         name: dataId
   *         required: true
   *         schema:
   *           type: string
   *         description: Data point ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               date:
   *                 type: string
   *                 format: date
   *               value:
   *                 type: number
   *               period:
   *                 type: string
   *                 enum: [daily, weekly, monthly, quarterly, yearly]
   *               period_start:
   *                 type: string
   *                 format: date
   *               period_end:
   *                 type: string
   *                 format: date
   *               source_data:
   *                 type: object
   *               is_forecasted:
   *                 type: boolean
   *     responses:
   *       200:
   *         description: Updated data point
   *       400:
   *         description: Bad request
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Metric or data point not found
   *       500:
   *         description: Server error
   */
  router.put('/:id/data/:dataId', checkAuth, checkRole(['admin', 'analyst']), metricController.updateMetricData.bind(metricController));

  /**
   * @swagger
   * /api/metrics/{id}/data/{dataId}:
   *   delete:
   *     summary: Delete metric data
   *     description: Delete an existing data point for a metric
   *     tags: [Metrics]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Metric ID
   *       - in: path
   *         name: dataId
   *         required: true
   *         schema:
   *           type: string
   *         description: Data point ID
   *     responses:
   *       204:
   *         description: No content
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Metric or data point not found
   *       500:
   *         description: Server error
   */
  router.delete('/:id/data/:dataId', checkAuth, checkRole(['admin', 'analyst']), metricController.deleteMetricData.bind(metricController));

  /**
   * @swagger
   * /api/metrics/{id}/value:
   *   get:
   *     summary: Calculate metric value
   *     description: Calculate the value of a metric for a specific period
   *     tags: [Metrics]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Metric ID
   *       - in: query
   *         name: startDate
   *         schema:
   *           type: string
   *           format: date
   *         description: Start date
   *       - in: query
   *         name: endDate
   *         schema:
   *           type: string
   *           format: date
   *         description: End date
   *       - in: query
   *         name: period
   *         schema:
   *           type: string
   *           enum: [daily, weekly, monthly, quarterly, yearly]
   *         description: Period type
   *     responses:
   *       200:
   *         description: Calculated metric value
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Metric not found
   *       500:
   *         description: Server error
   */
  router.get('/:id/value', checkAuth, metricController.calculateMetricValue.bind(metricController));

  /**
   * @swagger
   * /api/metrics/categories:
   *   get:
   *     summary: Get metric categories
   *     description: Get all metric categories
   *     tags: [Metrics]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: List of metric categories
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Server error
   */
  router.get('/categories', checkAuth, metricController.getMetricCategories.bind(metricController));

  /**
   * @swagger
   * /api/metrics/data-sources:
   *   get:
   *     summary: Get metric data sources
   *     description: Get all metric data sources
   *     tags: [Metrics]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: List of metric data sources
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Server error
   */
  router.get('/data-sources', checkAuth, metricController.getMetricDataSources.bind(metricController));

  return router;
}

module.exports = initMetricRoutes;
