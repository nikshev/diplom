/**
 * Report routes for Analytics Service
 */

const express = require('express');
const { checkAuth, checkRole } = require('../middlewares/auth');
const validate = require('../middlewares/validator');

/**
 * Initialize report routes
 * @param {Object} controllers - Controllers
 * @returns {Object} Router
 */
function initReportRoutes(controllers) {
  const router = express.Router();
  const { reportController } = controllers;

  /**
   * @swagger
   * /api/reports:
   *   get:
   *     summary: Get reports
   *     description: Get reports with pagination and filtering
   *     tags: [Reports]
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
   *         name: type
   *         schema:
   *           type: string
   *         description: Filter by report type
   *       - in: query
   *         name: isScheduled
   *         schema:
   *           type: boolean
   *         description: Filter by scheduled status
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
   *         description: Reports list with pagination
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Server error
   */
  router.get('/', checkAuth, reportController.getReports.bind(reportController));

  /**
   * @swagger
   * /api/reports/{id}:
   *   get:
   *     summary: Get report by ID
   *     description: Get report by ID
   *     tags: [Reports]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Report ID
   *       - in: query
   *         name: includeExecutions
   *         schema:
   *           type: boolean
   *         description: Include recent executions
   *     responses:
   *       200:
   *         description: Report details
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Report not found
   *       500:
   *         description: Server error
   */
  router.get('/:id', checkAuth, reportController.getReportById.bind(reportController));

  /**
   * @swagger
   * /api/reports:
   *   post:
   *     summary: Create report
   *     description: Create a new report
   *     tags: [Reports]
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
   *               - type
   *               - format
   *             properties:
   *               name:
   *                 type: string
   *               description:
   *                 type: string
   *               type:
   *                 type: string
   *               format:
   *                 type: string
   *                 enum: [pdf, excel, csv]
   *               template:
   *                 type: object
   *               parameters:
   *                 type: object
   *               schedule:
   *                 type: object
   *               is_scheduled:
   *                 type: boolean
   *               recipients:
   *                 type: array
   *                 items:
   *                   type: object
   *     responses:
   *       201:
   *         description: Created report
   *       400:
   *         description: Bad request
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       500:
   *         description: Server error
   */
  router.post('/', checkAuth, checkRole(['admin', 'analyst']), reportController.createReport.bind(reportController));

  /**
   * @swagger
   * /api/reports/{id}:
   *   put:
   *     summary: Update report
   *     description: Update an existing report
   *     tags: [Reports]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Report ID
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
   *               type:
   *                 type: string
   *               format:
   *                 type: string
   *                 enum: [pdf, excel, csv]
   *               template:
   *                 type: object
   *               parameters:
   *                 type: object
   *               schedule:
   *                 type: object
   *               is_scheduled:
   *                 type: boolean
   *               recipients:
   *                 type: array
   *                 items:
   *                   type: object
   *     responses:
   *       200:
   *         description: Updated report
   *       400:
   *         description: Bad request
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Report not found
   *       500:
   *         description: Server error
   */
  router.put('/:id', checkAuth, checkRole(['admin', 'analyst']), reportController.updateReport.bind(reportController));

  /**
   * @swagger
   * /api/reports/{id}:
   *   delete:
   *     summary: Delete report
   *     description: Delete an existing report
   *     tags: [Reports]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Report ID
   *     responses:
   *       204:
   *         description: No content
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Report not found
   *       500:
   *         description: Server error
   */
  router.delete('/:id', checkAuth, checkRole(['admin', 'analyst']), reportController.deleteReport.bind(reportController));

  /**
   * @swagger
   * /api/reports/{id}/executions:
   *   get:
   *     summary: Get report executions
   *     description: Get executions for a report
   *     tags: [Reports]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Report ID
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
   *         name: status
   *         schema:
   *           type: string
   *           enum: [pending, processing, completed, failed]
   *         description: Filter by status
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
   *         description: Report executions with pagination
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Report not found
   *       500:
   *         description: Server error
   */
  router.get('/:id/executions', checkAuth, reportController.getReportExecutions.bind(reportController));

  /**
   * @swagger
   * /api/reports/{id}/generate:
   *   post:
   *     summary: Generate report
   *     description: Generate a report with specified parameters
   *     tags: [Reports]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Report ID
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               startDate:
   *                 type: string
   *                 format: date
   *               endDate:
   *                 type: string
   *                 format: date
   *               filters:
   *                 type: object
   *     responses:
   *       200:
   *         description: Report generation result
   *       400:
   *         description: Bad request
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Report not found
   *       500:
   *         description: Server error
   */
  router.post('/:id/generate', checkAuth, reportController.generateReport.bind(reportController));

  /**
   * @swagger
   * /api/reports/{id}/executions/{executionId}/download:
   *   get:
   *     summary: Download report file
   *     description: Download a generated report file
   *     tags: [Reports]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Report ID
   *       - in: path
   *         name: executionId
   *         required: true
   *         schema:
   *           type: string
   *         description: Execution ID
   *     responses:
   *       200:
   *         description: Report file
   *         content:
   *           application/pdf:
   *             schema:
   *               type: string
   *               format: binary
   *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
   *             schema:
   *               type: string
   *               format: binary
   *           text/csv:
   *             schema:
   *               type: string
   *               format: binary
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Report or execution not found
   *       500:
   *         description: Server error
   */
  router.get('/:id/executions/:executionId/download', checkAuth, reportController.downloadReportFile.bind(reportController));

  /**
   * @swagger
   * /api/reports/{id}/schedule:
   *   post:
   *     summary: Schedule report
   *     description: Schedule a report for automatic generation
   *     tags: [Reports]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Report ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - frequency
   *             properties:
   *               frequency:
   *                 type: string
   *                 enum: [daily, weekly, monthly]
   *               dayOfWeek:
   *                 type: integer
   *                 minimum: 0
   *                 maximum: 6
   *               dayOfMonth:
   *                 type: integer
   *                 minimum: 1
   *                 maximum: 31
   *               hour:
   *                 type: integer
   *                 minimum: 0
   *                 maximum: 23
   *               minute:
   *                 type: integer
   *                 minimum: 0
   *                 maximum: 59
   *               parameters:
   *                 type: object
   *               recipients:
   *                 type: array
   *                 items:
   *                   type: object
   *     responses:
   *       200:
   *         description: Scheduled report
   *       400:
   *         description: Bad request
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Report not found
   *       500:
   *         description: Server error
   */
  router.post('/:id/schedule', checkAuth, checkRole(['admin', 'analyst']), reportController.scheduleReport.bind(reportController));

  /**
   * @swagger
   * /api/reports/{id}/unschedule:
   *   post:
   *     summary: Unschedule report
   *     description: Unschedule a report
   *     tags: [Reports]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Report ID
   *     responses:
   *       200:
   *         description: Unscheduled report
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Report not found
   *       500:
   *         description: Server error
   */
  router.post('/:id/unschedule', checkAuth, checkRole(['admin', 'analyst']), reportController.unscheduleReport.bind(reportController));

  /**
   * @swagger
   * /api/reports/types:
   *   get:
   *     summary: Get report types
   *     description: Get all report types
   *     tags: [Reports]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: List of report types
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Server error
   */
  router.get('/types', checkAuth, reportController.getReportTypes.bind(reportController));

  return router;
}

module.exports = initReportRoutes;
