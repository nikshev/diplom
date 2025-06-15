/**
 * User routes for API Gateway
 * Proxies requests to auth-service
 */

const express = require('express');
const { createServiceProxy } = require('../utils/proxy');
const config = require('../config');

const router = express.Router();

// Create proxy for auth service
const authServiceProxy = createServiceProxy('auth-service', config.services.auth.url, {
  timeout: config.services.auth.timeout,
});

// Proxy all user requests to auth-service
router.use('/', authServiceProxy);

module.exports = router;
