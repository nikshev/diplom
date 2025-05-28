/**
 * Interaction routes for CRM Service
 */

const express = require('express');
const { body, param, query } = require('express-validator');
const validate = require('../middlewares/validator');
const { authorize } = require('../middlewares/auth');
const config = require('../config');

const router = express.Router();

/**
 * Initialize interaction routes
 * @param {Object} interactionController - Interaction controller
 */
module.exports = (interactionController) => {
  // GET /api/interactions/customer/:customerId - Get interactions by customer ID
  router.get(
    '/customer/:customerId',
    authorize('interactions', 'read'),
    [
      param('customerId').isUUID().withMessage('Customer ID must be a valid UUID'),
      query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
      query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
      query('type').optional().isIn(Object.values(config.interactionTypes)).withMessage('Invalid type'),
      query('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO date'),
      query('endDate').optional().isISO8601().withMessage('End date must be a valid ISO date'),
      query('sortBy').optional().isString().withMessage('Sort by must be a string'),
      query('sortOrder').optional().isIn(['ASC', 'DESC']).withMessage('Sort order must be ASC or DESC'),
    ],
    validate,
    interactionController.getInteractionsByCustomerId
  );

  // GET /api/interactions/date-range - Get interactions by date range
  router.get(
    '/date-range',
    authorize('interactions', 'read'),
    [
      query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
      query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
      query('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO date'),
      query('endDate').optional().isISO8601().withMessage('End date must be a valid ISO date'),
      query('type').optional().isIn(Object.values(config.interactionTypes)).withMessage('Invalid type'),
      query('userId').optional().isUUID().withMessage('User ID must be a valid UUID'),
      query('sortBy').optional().isString().withMessage('Sort by must be a string'),
      query('sortOrder').optional().isIn(['ASC', 'DESC']).withMessage('Sort order must be ASC or DESC'),
    ],
    validate,
    interactionController.getInteractionsByDateRange
  );

  // GET /api/interactions/statistics - Get interaction statistics
  router.get(
    '/statistics',
    authorize('interactions', 'read'),
    [
      query('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO date'),
      query('endDate').optional().isISO8601().withMessage('End date must be a valid ISO date'),
      query('userId').optional().isUUID().withMessage('User ID must be a valid UUID'),
    ],
    validate,
    interactionController.getInteractionStatistics
  );

  // GET /api/interactions/search - Search interactions
  router.get(
    '/search',
    authorize('interactions', 'read'),
    [
      query('query').notEmpty().withMessage('Search query is required'),
      query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
      query('customerId').optional().isUUID().withMessage('Customer ID must be a valid UUID'),
    ],
    validate,
    interactionController.searchInteractions
  );

  // GET /api/interactions/:id - Get interaction by ID
  router.get(
    '/:id',
    authorize('interactions', 'read'),
    [
      param('id').isUUID().withMessage('Interaction ID must be a valid UUID'),
    ],
    validate,
    interactionController.getInteractionById
  );

  // POST /api/interactions - Create a new interaction
  router.post(
    '/',
    authorize('interactions', 'create'),
    [
      body('customer_id').isUUID().withMessage('Customer ID must be a valid UUID'),
      body('type').isIn(Object.values(config.interactionTypes)).withMessage('Invalid type'),
      body('subject').notEmpty().withMessage('Subject is required'),
      body('description').optional().isString().withMessage('Description must be a string'),
      body('date').optional().isISO8601().withMessage('Date must be a valid ISO date'),
    ],
    validate,
    interactionController.createInteraction
  );

  // PUT /api/interactions/:id - Update interaction
  router.put(
    '/:id',
    authorize('interactions', 'update'),
    [
      param('id').isUUID().withMessage('Interaction ID must be a valid UUID'),
      body('type').optional().isIn(Object.values(config.interactionTypes)).withMessage('Invalid type'),
      body('subject').optional().notEmpty().withMessage('Subject cannot be empty'),
      body('description').optional().isString().withMessage('Description must be a string'),
      body('date').optional().isISO8601().withMessage('Date must be a valid ISO date'),
    ],
    validate,
    interactionController.updateInteraction
  );

  // DELETE /api/interactions/:id - Delete interaction
  router.delete(
    '/:id',
    authorize('interactions', 'delete'),
    [
      param('id').isUUID().withMessage('Interaction ID must be a valid UUID'),
    ],
    validate,
    interactionController.deleteInteraction
  );

  return router;
};
