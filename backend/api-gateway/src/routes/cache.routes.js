/**
 * Cache management routes for API Gateway
 */

const express = require('express');
const { authenticate, authorizeRole } = require('../middlewares/auth');
const { clear, stats, keys } = require('../utils/cache');

const router = express.Router();

/**
 * @route GET /api/v1/cache/stats
 * @desc Get cache statistics
 * @access Private (Admin only)
 */
router.get('/stats', authenticate(), authorizeRole('admin'), (req, res) => {
  res.json({
    ...stats(),
    timestamp: new Date().toISOString(),
  });
});

/**
 * @route GET /api/v1/cache/keys
 * @desc Get all cache keys
 * @access Private (Admin only)
 */
router.get('/keys', authenticate(), authorizeRole('admin'), (req, res) => {
  res.json({
    keys: keys(),
    count: keys().length,
    timestamp: new Date().toISOString(),
  });
});

/**
 * @route POST /api/v1/cache/clear
 * @desc Clear all cache
 * @access Private (Admin only)
 */
router.post('/clear', authenticate(), authorizeRole('admin'), (req, res) => {
  clear();
  res.json({
    message: 'Cache cleared successfully',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
