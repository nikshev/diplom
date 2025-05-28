/**
 * Dashboard routes for Analytics Service
 */

const express = require('express');
const { checkAuth, checkRole } = require('../middlewares/auth');
const validate = require('../middlewares/validator');

/**
 * Initialize dashboard routes
 * @param {Object} controllers - Controllers
 * @returns {Object} Router
 */
function initDashboardRoutes(controllers) {
  const router = express.Router();
  const { dashboardController } = controllers;

  /**
   * @swagger
   * /api/dashboards:
   *   get:
   *     summary: Get dashboards
   *     description: Get dashboards with pagination and filtering
   *     tags: [Dashboards]
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
   *         name: userId
   *         schema:
   *           type: string
   *         description: Filter by user ID
   *       - in: query
   *         name: roleId
   *         schema:
   *           type: string
   *         description: Filter by role ID
   *       - in: query
   *         name: isPublic
   *         schema:
   *           type: boolean
   *         description: Filter by public status
   *       - in: query
   *         name: isDefault
   *         schema:
   *           type: boolean
   *         description: Filter by default status
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
   *         description: Dashboards list with pagination
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Server error
   */
  router.get('/', checkAuth, dashboardController.getDashboards.bind(dashboardController));

  /**
   * @swagger
   * /api/dashboards/{id}:
   *   get:
   *     summary: Get dashboard by ID
   *     description: Get dashboard by ID
   *     tags: [Dashboards]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Dashboard ID
   *       - in: query
   *         name: includeWidgets
   *         schema:
   *           type: boolean
   *         description: Include widgets
   *     responses:
   *       200:
   *         description: Dashboard details
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Dashboard not found
   *       500:
   *         description: Server error
   */
  router.get('/:id', checkAuth, dashboardController.getDashboardById.bind(dashboardController));

  /**
   * @swagger
   * /api/dashboards:
   *   post:
   *     summary: Create dashboard
   *     description: Create a new dashboard
   *     tags: [Dashboards]
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
   *             properties:
   *               name:
   *                 type: string
   *               description:
   *                 type: string
   *               layout:
   *                 type: object
   *               is_default:
   *                 type: boolean
   *               is_public:
   *                 type: boolean
   *               user_id:
   *                 type: string
   *               role_id:
   *                 type: string
   *               widgets:
   *                 type: array
   *                 items:
   *                   type: object
   *     responses:
   *       201:
   *         description: Created dashboard
   *       400:
   *         description: Bad request
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Server error
   */
  router.post('/', checkAuth, dashboardController.createDashboard.bind(dashboardController));

  /**
   * @swagger
   * /api/dashboards/{id}:
   *   put:
   *     summary: Update dashboard
   *     description: Update an existing dashboard
   *     tags: [Dashboards]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Dashboard ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *               description:
   *                 type: string
   *               layout:
   *                 type: object
   *               is_default:
   *                 type: boolean
   *               is_public:
   *                 type: boolean
   *               widgets:
   *                 type: array
   *                 items:
   *                   type: object
   *     responses:
   *       200:
   *         description: Updated dashboard
   *       400:
   *         description: Bad request
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Dashboard not found
   *       500:
   *         description: Server error
   */
  router.put('/:id', checkAuth, dashboardController.updateDashboard.bind(dashboardController));

  /**
   * @swagger
   * /api/dashboards/{id}:
   *   delete:
   *     summary: Delete dashboard
   *     description: Delete an existing dashboard
   *     tags: [Dashboards]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Dashboard ID
   *     responses:
   *       204:
   *         description: No content
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Dashboard not found
   *       500:
   *         description: Server error
   */
  router.delete('/:id', checkAuth, dashboardController.deleteDashboard.bind(dashboardController));

  /**
   * @swagger
   * /api/dashboards/{id}/widgets:
   *   get:
   *     summary: Get dashboard widgets
   *     description: Get widgets for a dashboard
   *     tags: [Dashboards]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Dashboard ID
   *     responses:
   *       200:
   *         description: Dashboard widgets
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Dashboard not found
   *       500:
   *         description: Server error
   */
  router.get('/:id/widgets', checkAuth, dashboardController.getDashboardWidgets.bind(dashboardController));

  /**
   * @swagger
   * /api/dashboards/{id}/widgets:
   *   post:
   *     summary: Add widget to dashboard
   *     description: Add a new widget to a dashboard
   *     tags: [Dashboards]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Dashboard ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - title
   *               - type
   *               - config
   *             properties:
   *               title:
   *                 type: string
   *               type:
   *                 type: string
   *                 enum: [metric, chart, kpi, custom]
   *               size:
   *                 type: string
   *                 enum: [small, medium, large]
   *               position:
   *                 type: integer
   *               config:
   *                 type: object
   *               refresh_interval:
   *                 type: integer
   *     responses:
   *       201:
   *         description: Created widget
   *       400:
   *         description: Bad request
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Dashboard not found
   *       500:
   *         description: Server error
   */
  router.post('/:id/widgets', checkAuth, dashboardController.addDashboardWidget.bind(dashboardController));

  /**
   * @swagger
   * /api/dashboards/{id}/widgets/{widgetId}:
   *   put:
   *     summary: Update dashboard widget
   *     description: Update an existing widget on a dashboard
   *     tags: [Dashboards]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Dashboard ID
   *       - in: path
   *         name: widgetId
   *         required: true
   *         schema:
   *           type: string
   *         description: Widget ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               title:
   *                 type: string
   *               type:
   *                 type: string
   *                 enum: [metric, chart, kpi, custom]
   *               size:
   *                 type: string
   *                 enum: [small, medium, large]
   *               position:
   *                 type: integer
   *               config:
   *                 type: object
   *               refresh_interval:
   *                 type: integer
   *     responses:
   *       200:
   *         description: Updated widget
   *       400:
   *         description: Bad request
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Dashboard or widget not found
   *       500:
   *         description: Server error
   */
  router.put('/:id/widgets/:widgetId', checkAuth, dashboardController.updateDashboardWidget.bind(dashboardController));

  /**
   * @swagger
   * /api/dashboards/{id}/widgets/{widgetId}:
   *   delete:
   *     summary: Delete dashboard widget
   *     description: Delete an existing widget from a dashboard
   *     tags: [Dashboards]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Dashboard ID
   *       - in: path
   *         name: widgetId
   *         required: true
   *         schema:
   *           type: string
   *         description: Widget ID
   *     responses:
   *       204:
   *         description: No content
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Dashboard or widget not found
   *       500:
   *         description: Server error
   */
  router.delete('/:id/widgets/:widgetId', checkAuth, dashboardController.deleteDashboardWidget.bind(dashboardController));

  /**
   * @swagger
   * /api/dashboards/{id}/widgets/{widgetId}/data:
   *   get:
   *     summary: Get widget data
   *     description: Get data for a specific widget
   *     tags: [Dashboards]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Dashboard ID
   *       - in: path
   *         name: widgetId
   *         required: true
   *         schema:
   *           type: string
   *         description: Widget ID
   *     responses:
   *       200:
   *         description: Widget data
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Dashboard or widget not found
   *       500:
   *         description: Server error
   */
  router.get('/:id/widgets/:widgetId/data', checkAuth, dashboardController.getWidgetData.bind(dashboardController));

  /**
   * @swagger
   * /api/dashboards/default:
   *   get:
   *     summary: Get default dashboard
   *     description: Get default dashboard for the current user
   *     tags: [Dashboards]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Default dashboard
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Default dashboard not found
   *       500:
   *         description: Server error
   */
  router.get('/default', checkAuth, dashboardController.getDefaultDashboard.bind(dashboardController));

  return router;
}

module.exports = initDashboardRoutes;
