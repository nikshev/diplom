/**
 * KPI routes for Analytics Service
 */

const express = require('express');
const { checkAuth, checkRole } = require('../middlewares/auth');
const validate = require('../middlewares/validator');

/**
 * Initialize KPI routes
 * @param {Object} controllers - Controllers
 * @returns {Object} Router
 */
function initKPIRoutes(controllers) {
  const router = express.Router();
  const { kpiController } = controllers;

  /**
   * @swagger
   * /api/kpis:
   *   get:
   *     summary: Get all KPIs
   *     description: Get all KPIs with current values
   *     tags: [KPIs]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: timeframe
   *         schema:
   *           type: string
   *           enum: [today, yesterday, week, month, quarter, year, last7days, last30days, last90days, last12months]
   *         description: Timeframe for KPI values
   *       - in: query
   *         name: category
   *         schema:
   *           type: string
   *         description: Filter by category
   *       - in: query
   *         name: includeData
   *         schema:
   *           type: boolean
   *         description: Include historical data
   *     responses:
   *       200:
   *         description: List of KPIs with values
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Server error
   */
  router.get('/', checkAuth, kpiController.getAllKPIs.bind(kpiController));

  /**
   * @swagger
   * /api/kpis/{id}:
   *   get:
   *     summary: Get KPI by ID
   *     description: Get KPI by ID with current value
   *     tags: [KPIs]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: KPI ID
   *       - in: query
   *         name: timeframe
   *         schema:
   *           type: string
   *           enum: [today, yesterday, week, month, quarter, year, last7days, last30days, last90days, last12months]
   *         description: Timeframe for KPI value
   *       - in: query
   *         name: includeData
   *         schema:
   *           type: boolean
   *         description: Include historical data
   *     responses:
   *       200:
   *         description: KPI with value
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: KPI not found
   *       500:
   *         description: Server error
   */
  router.get('/:id', checkAuth, kpiController.getKPIById.bind(kpiController));

  /**
   * @swagger
   * /api/kpis:
   *   post:
   *     summary: Create KPI
   *     description: Create a new KPI
   *     tags: [KPIs]
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
   *               target_value:
   *                 type: number
   *               target_period:
   *                 type: string
   *               visualization_type:
   *                 type: string
   *     responses:
   *       201:
   *         description: Created KPI
   *       400:
   *         description: Bad request
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       500:
   *         description: Server error
   */
  router.post('/', checkAuth, checkRole(['admin', 'analyst']), kpiController.createKPI.bind(kpiController));

  /**
   * @swagger
   * /api/kpis/{id}:
   *   put:
   *     summary: Update KPI
   *     description: Update an existing KPI
   *     tags: [KPIs]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: KPI ID
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
   *               target_value:
   *                 type: number
   *               target_period:
   *                 type: string
   *               visualization_type:
   *                 type: string
   *     responses:
   *       200:
   *         description: Updated KPI
   *       400:
   *         description: Bad request
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: KPI not found
   *       500:
   *         description: Server error
   */
  router.put('/:id', checkAuth, checkRole(['admin', 'analyst']), kpiController.updateKPI.bind(kpiController));

  /**
   * @swagger
   * /api/kpis/{id}:
   *   delete:
   *     summary: Delete KPI
   *     description: Delete an existing KPI
   *     tags: [KPIs]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: KPI ID
   *     responses:
   *       204:
   *         description: No content
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: KPI not found
   *       500:
   *         description: Server error
   */
  router.delete('/:id', checkAuth, checkRole(['admin']), kpiController.deleteKPI.bind(kpiController));

  /**
   * @swagger
   * /api/kpis/categories:
   *   get:
   *     summary: Get KPI categories
   *     description: Get all KPI categories
   *     tags: [KPIs]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: List of KPI categories
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Server error
   */
  router.get('/categories', checkAuth, kpiController.getKPICategories.bind(kpiController));

  /**
   * @swagger
   * /api/kpis/{id}/target:
   *   put:
   *     summary: Update KPI target
   *     description: Update target value for a KPI
   *     tags: [KPIs]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: KPI ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - target_value
   *             properties:
   *               target_value:
   *                 type: number
   *               target_period:
   *                 type: string
   *     responses:
   *       200:
   *         description: Updated KPI
   *       400:
   *         description: Bad request
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: KPI not found
   *       500:
   *         description: Server error
   */
  router.put('/:id/target', checkAuth, checkRole(['admin', 'analyst']), kpiController.updateKPITarget.bind(kpiController));

  /**
   * @swagger
   * /api/kpis/scorecard:
   *   get:
   *     summary: Get KPI scorecard
   *     description: Get KPI scorecard with overall performance
   *     tags: [KPIs]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: timeframe
   *         schema:
   *           type: string
   *           enum: [today, yesterday, week, month, quarter, year, last7days, last30days, last90days, last12months]
   *         description: Timeframe for KPI values
   *       - in: query
   *         name: category
   *         schema:
   *           type: string
   *         description: Filter by category
   *     responses:
   *       200:
   *         description: KPI scorecard
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Server error
   */
  router.get('/scorecard', checkAuth, kpiController.getKPIScorecard.bind(kpiController));

  /**
   * @swagger
   * /api/kpis/trends:
   *   get:
   *     summary: Get KPI trends
   *     description: Get KPI trends over time
   *     tags: [KPIs]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: timeframe
   *         schema:
   *           type: string
   *           enum: [today, yesterday, week, month, quarter, year, last7days, last30days, last90days, last12months]
   *         description: Timeframe for KPI values
   *       - in: query
   *         name: category
   *         schema:
   *           type: string
   *         description: Filter by category
   *       - in: query
   *         name: kpiIds
   *         schema:
   *           type: string
   *         description: Comma-separated list of KPI IDs or JSON array
   *     responses:
   *       200:
   *         description: KPI trends
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Server error
   */
  router.get('/trends', checkAuth, kpiController.getKPITrends.bind(kpiController));

  /**
   * @swagger
   * /api/kpis/refresh:
   *   post:
   *     summary: Refresh all KPI data
   *     description: Refresh data for all active KPIs
   *     tags: [KPIs]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Refresh results
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       500:
   *         description: Server error
   */
  router.post('/refresh', checkAuth, checkRole(['admin', 'analyst']), kpiController.refreshAllKPIData.bind(kpiController));

  return router;
}

module.exports = initKPIRoutes;
