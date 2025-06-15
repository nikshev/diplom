/**
 * Analytics service routes for API Gateway
 */

const express = require('express');
const { param } = require('express-validator');
const config = require('../config');
const { createServiceProxy } = require('../utils/proxy');
const { authenticate, authorize } = require('../middlewares/auth');
const { validate } = require('../middlewares/validator');
const { endpointThrottle, userThrottle } = require('../middlewares/throttle');
const { cacheMiddleware } = require('../utils/cache');

const router = express.Router();

// Create proxy to analytics service
const analyticsServiceProxy = createServiceProxy(
  'analytics-service',
  config.services.analytics.url,
  { timeout: config.services.analytics.timeout }
);

// UUID validation rule
const uuidValidation = param('id')
  .isUUID()
  .withMessage('Invalid ID format');

// Routes

/**
 * @route GET /api/v1/analytics/overview
 * @desc Get business overview analytics data
 * @access Private
 */
router.get('/overview', 
  authenticate(), 
  authorize(['analytics:read', 'analytics:all']), 
  // Apply throttling to overview requests (aggregates multiple data points)
  userThrottle({ windowMs: 60 * 1000, max: 20 }), // 20 requests per minute per user
  // Cache overview data for 5 minutes (300 seconds)
  cacheMiddleware({ 
    ttl: 300,
    keyGenerator: (req) => `overview:${req.user.id}:${JSON.stringify(req.query)}` // Cache per user and query params
  }),
  analyticsServiceProxy
);

/**
 * @route GET /api/v1/analytics/dashboard
 * @desc Get dashboard analytics data
 * @access Private
 */
router.get('/dashboard', 
  authenticate(), 
  authorize(['analytics:read', 'analytics:all']), 
  // Apply throttling to dashboard requests (aggregates multiple data points)
  userThrottle({ windowMs: 60 * 1000, max: 20 }), // 20 requests per minute per user
  // Cache dashboard data for 5 minutes (300 seconds)
  cacheMiddleware({ 
    ttl: 300,
    keyGenerator: (req) => `dashboard:${req.user.id}` // Cache per user
  }),
  analyticsServiceProxy
);

/**
 * @route GET /api/v1/analytics/reports
 * @desc Get all reports with pagination and filtering
 * @access Private
 */
router.get('/reports', 
  authenticate(), 
  authorize(['analytics:read', 'analytics:all']), 
  analyticsServiceProxy
);

/**
 * @route POST /api/v1/analytics/reports
 * @desc Create a new report
 * @access Private
 */
router.post('/reports', 
  authenticate(), 
  authorize(['analytics:create', 'analytics:all']), 
  analyticsServiceProxy
);

/**
 * @route GET /api/v1/analytics/reports/:id
 * @desc Get report by ID
 * @access Private
 */
router.get('/reports/:id', 
  authenticate(), 
  authorize(['analytics:read', 'analytics:all']),
  uuidValidation,
  validate(),
  analyticsServiceProxy
);

/**
 * @route PUT /api/v1/analytics/reports/:id
 * @desc Update report by ID
 * @access Private
 */
router.put('/reports/:id', 
  authenticate(), 
  authorize(['analytics:update', 'analytics:all']),
  uuidValidation,
  validate(),
  analyticsServiceProxy
);

/**
 * @route DELETE /api/v1/analytics/reports/:id
 * @desc Delete report by ID
 * @access Private
 */
router.delete('/reports/:id', 
  authenticate(), 
  authorize(['analytics:delete', 'analytics:all']),
  uuidValidation,
  validate(),
  analyticsServiceProxy
);

/**
 * @route POST /api/v1/analytics/reports/:id/execute
 * @desc Execute report by ID
 * @access Private
 */
router.post('/reports/:id/execute', 
  authenticate(), 
  authorize(['analytics:execute', 'analytics:all']),
  uuidValidation,
  validate(),
  // Apply throttling to report execution (resource-intensive operation)
  userThrottle({ windowMs: 60 * 1000, max: 5 }), // 5 requests per minute per user
  analyticsServiceProxy
);

/**
 * @route GET /api/v1/analytics/reports/:id/executions
 * @desc Get report executions by report ID
 * @access Private
 */
router.get('/reports/:id/executions', 
  authenticate(), 
  authorize(['analytics:read', 'analytics:all']),
  uuidValidation,
  validate(),
  analyticsServiceProxy
);

/**
 * @route GET /api/v1/analytics/executions/:id
 * @desc Get report execution by ID
 * @access Private
 */
router.get('/executions/:id', 
  authenticate(), 
  authorize(['analytics:read', 'analytics:all']),
  uuidValidation,
  validate(),
  analyticsServiceProxy
);

/**
 * @route GET /api/v1/analytics/kpi
 * @desc Get all KPI metrics
 * @access Private
 */
router.get('/kpi', 
  authenticate(), 
  authorize(['analytics:read', 'analytics:all']), 
  // Cache KPI data for 5 minutes (300 seconds)
  cacheMiddleware({ ttl: 300 }),
  analyticsServiceProxy
);

/**
 * @route POST /api/v1/analytics/kpi
 * @desc Create a new KPI metric
 * @access Private
 */
router.post('/kpi', 
  authenticate(), 
  authorize(['analytics:create', 'analytics:all']), 
  analyticsServiceProxy
);

/**
 * @route GET /api/v1/analytics/kpi/:id
 * @desc Get KPI metric by ID
 * @access Private
 */
router.get('/kpi/:id', 
  authenticate(), 
  authorize(['analytics:read', 'analytics:all']),
  uuidValidation,
  validate(),
  analyticsServiceProxy
);

/**
 * @route PUT /api/v1/analytics/kpi/:id
 * @desc Update KPI metric by ID
 * @access Private
 */
router.put('/kpi/:id', 
  authenticate(), 
  authorize(['analytics:update', 'analytics:all']),
  uuidValidation,
  validate(),
  analyticsServiceProxy
);

/**
 * @route DELETE /api/v1/analytics/kpi/:id
 * @desc Delete KPI metric by ID
 * @access Private
 */
router.delete('/kpi/:id', 
  authenticate(), 
  authorize(['analytics:delete', 'analytics:all']),
  uuidValidation,
  validate(),
  analyticsServiceProxy
);

/**
 * @route GET /api/v1/analytics/kpi/:id/values
 * @desc Get KPI values by KPI ID
 * @access Private
 */
router.get('/kpi/:id/values', 
  authenticate(), 
  authorize(['analytics:read', 'analytics:all']),
  uuidValidation,
  validate(),
  analyticsServiceProxy
);

/**
 * @route POST /api/v1/analytics/kpi/:id/values
 * @desc Add KPI value to KPI metric
 * @access Private
 */
router.post('/kpi/:id/values', 
  authenticate(), 
  authorize(['analytics:create', 'analytics:all']),
  uuidValidation,
  validate(),
  analyticsServiceProxy
);

/**
 * @route GET /api/v1/analytics/sales
 * @desc Get sales analytics
 * @access Private
 */
router.get('/sales', 
  authenticate(), 
  authorize(['analytics:read', 'analytics:all']), 
  // Apply throttling to sales analytics (potentially complex queries)
  userThrottle({ windowMs: 60 * 1000, max: 15 }), // 15 requests per minute per user
  // Cache sales data for 5 minutes (300 seconds)
  cacheMiddleware({ 
    ttl: 300,
    keyGenerator: (req) => `sales:${req.originalUrl}:${JSON.stringify(req.query)}` // Cache based on query parameters
  }),
  analyticsServiceProxy
);

/**
 * @route GET /api/v1/analytics/inventory
 * @desc Get inventory analytics
 * @access Private
 */
router.get('/inventory', 
  authenticate(), 
  authorize(['analytics:read', 'analytics:all']), 
  // Apply throttling to inventory analytics (potentially complex queries)
  userThrottle({ windowMs: 60 * 1000, max: 15 }), // 15 requests per minute per user
  // Cache inventory data for 5 minutes (300 seconds)
  cacheMiddleware({ 
    ttl: 300,
    keyGenerator: (req) => `inventory:${req.originalUrl}:${JSON.stringify(req.query)}` // Cache based on query parameters
  }),
  analyticsServiceProxy
);

/**
 * @route GET /api/v1/analytics/customers
 * @desc Get customer analytics
 * @access Private
 */
router.get('/customers', 
  authenticate(), 
  authorize(['analytics:read', 'analytics:all']), 
  // Apply throttling to customer analytics (potentially complex queries)
  userThrottle({ windowMs: 60 * 1000, max: 15 }), // 15 requests per minute per user
  // Cache customer data for 5 minutes (300 seconds)
  cacheMiddleware({ 
    ttl: 300,
    keyGenerator: (req) => `customers:${req.originalUrl}:${JSON.stringify(req.query)}` // Cache based on query parameters
  }),
  analyticsServiceProxy
);

/**
 * @route GET /api/v1/analytics/finances
 * @desc Get finance analytics
 * @access Private
 */
router.get('/finances', 
  authenticate(), 
  authorize(['analytics:read', 'analytics:all']), 
  // Apply throttling to finance analytics (potentially complex queries)
  userThrottle({ windowMs: 60 * 1000, max: 15 }), // 15 requests per minute per user
  // Cache finance data for 5 minutes (300 seconds)
  cacheMiddleware({ 
    ttl: 300,
    keyGenerator: (req) => `finances:${req.originalUrl}:${JSON.stringify(req.query)}` // Cache based on query parameters
  }),
  analyticsServiceProxy
);

module.exports = router;
