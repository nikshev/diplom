/**
 * Main router for Auth Service
 */

const express = require('express');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const roleRoutes = require('./role.routes');
const permissionRoutes = require('./permission.routes');

const router = express.Router();

// Routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/roles', roleRoutes);
router.use('/permissions', permissionRoutes);

// API documentation route
router.get('/', (req, res) => {
  res.json({
    message: 'Auth Service API',
    version: '1.0.0',
    endpoints: [
      '/api/v1/auth',
      '/api/v1/users',
      '/api/v1/roles',
      '/api/v1/permissions',
    ],
  });
});

module.exports = router;
