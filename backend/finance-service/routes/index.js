/**
 * Main routes file for Finance Service
 */

const express = require('express');
const createTransactionRoutes = require('./transaction.routes');
const createTransactionCategoryRoutes = require('./transaction-category.routes');
const createAccountRoutes = require('./account.routes');
const createInvoiceRoutes = require('./invoice.routes');

/**
 * Initialize routes
 * @param {Object} controllers - Controllers object
 * @returns {Object} Router
 */
const initRoutes = (controllers) => {
  const router = express.Router();

  // Health check route
  router.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', service: 'finance-service' });
  });

  // API routes
  router.use('/api/transactions', createTransactionRoutes(controllers.transactionController));
  router.use('/api/transaction-categories', createTransactionCategoryRoutes(controllers.transactionCategoryController));
  router.use('/api/accounts', createAccountRoutes(controllers.accountController));
  router.use('/api/invoices', createInvoiceRoutes(controllers.invoiceController));

  return router;
};

module.exports = initRoutes;
