/**
 * Metrics routes for API Gateway
 */

const express = require('express');
const { getMetrics, resetMetrics } = require('../utils/metrics');
const { authenticate, authorizeRole } = require('../middlewares/auth');

const router = express.Router();

/**
 * @route GET /api/v1/metrics
 * @desc Get API Gateway metrics
 * @access Private (Admin only)
 */
router.get('/', authenticate(), authorizeRole('admin'), (req, res) => {
  res.json(getMetrics());
});

/**
 * @route POST /api/v1/metrics/reset
 * @desc Reset API Gateway metrics
 * @access Private (Admin only)
 */
router.post('/reset', authenticate(), authorizeRole('admin'), (req, res) => {
  resetMetrics();
  res.json({ message: 'Metrics reset successfully' });
});

module.exports = router;
