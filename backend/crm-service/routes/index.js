/**
 * Main router for CRM Service
 */

const express = require('express');
const customerRoutes = require('./customer.routes');
const contactRoutes = require('./contact.routes');
const interactionRoutes = require('./interaction.routes');

const router = express.Router();

/**
 * Initialize routes
 * @param {Object} controllers - Controllers
 */
module.exports = (controllers) => {
  // Health check route
  router.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', service: 'crm-service' });
  });

  // API routes
  router.use('/api/customers', customerRoutes(controllers.customerController));
  router.use('/api/contacts', contactRoutes(controllers.contactController));
  router.use('/api/interactions', interactionRoutes(controllers.interactionController));

  return router;
};
