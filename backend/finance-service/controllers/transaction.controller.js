/**
 * Transaction controller for Finance Service
 */

const { StatusCodes } = require('http-status-codes');
const logger = require('../config/logger');

/**
 * Transaction controller
 */
class TransactionController {
  /**
   * Constructor
   * @param {Object} transactionService - Transaction service
   */
  constructor(transactionService) {
    this.transactionService = transactionService;
    
    // Bind methods to this instance
    this.getTransactions = this.getTransactions.bind(this);
    this.getTransactionById = this.getTransactionById.bind(this);
    this.createTransaction = this.createTransaction.bind(this);
    this.updateTransaction = this.updateTransaction.bind(this);
    this.deleteTransaction = this.deleteTransaction.bind(this);
    this.getTransactionsByCategory = this.getTransactionsByCategory.bind(this);
    this.getTransactionsByDateRange = this.getTransactionsByDateRange.bind(this);
    this.getTransactionsByAccount = this.getTransactionsByAccount.bind(this);
    this.getTransactionStats = this.getTransactionStats.bind(this);
  }

  /**
   * Get transactions with pagination and filtering
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async getTransactions(req, res, next) {
    try {
      const options = {
        page: parseInt(req.query.page, 10) || 1,
        limit: parseInt(req.query.limit, 10) || 10,
        type: req.query.type,
        categoryId: req.query.categoryId,
        accountId: req.query.accountId,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        minAmount: req.query.minAmount ? parseFloat(req.query.minAmount) : undefined,
        maxAmount: req.query.maxAmount ? parseFloat(req.query.maxAmount) : undefined,
        sortBy: req.query.sortBy || 'transaction_date',
        sortOrder: req.query.sortOrder || 'DESC',
      };

      const result = await this.transactionService.getTransactions(options);

      res.status(StatusCodes.OK).json(result);
    } catch (error) {
      logger.error('Error in getTransactions controller:', error);
      next(error);
    }
  }

  /**
   * Get transaction by ID
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async getTransactionById(req, res, next) {
    try {
      const { id } = req.params;
      const transaction = await this.transactionService.getTransactionById(id);

      res.status(StatusCodes.OK).json(transaction);
    } catch (error) {
      logger.error(`Error in getTransactionById controller for ID ${req.params.id}:`, error);
      next(error);
    }
  }

  /**
   * Create transaction
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async createTransaction(req, res, next) {
    try {
      const transactionData = req.body;
      const userId = req.user.id;
      
      // Add user ID to transaction data
      transactionData.created_by = userId;
      
      const transaction = await this.transactionService.createTransaction(transactionData);

      res.status(StatusCodes.CREATED).json(transaction);
    } catch (error) {
      logger.error('Error in createTransaction controller:', error);
      next(error);
    }
  }

  /**
   * Update transaction
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async updateTransaction(req, res, next) {
    try {
      const { id } = req.params;
      const transactionData = req.body;
      const transaction = await this.transactionService.updateTransaction(id, transactionData);

      res.status(StatusCodes.OK).json(transaction);
    } catch (error) {
      logger.error(`Error in updateTransaction controller for ID ${req.params.id}:`, error);
      next(error);
    }
  }

  /**
   * Delete transaction
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async deleteTransaction(req, res, next) {
    try {
      const { id } = req.params;
      await this.transactionService.deleteTransaction(id);

      res.status(StatusCodes.NO_CONTENT).send();
    } catch (error) {
      logger.error(`Error in deleteTransaction controller for ID ${req.params.id}:`, error);
      next(error);
    }
  }

  /**
   * Get transactions by category
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async getTransactionsByCategory(req, res, next) {
    try {
      const { categoryId } = req.params;
      const options = {
        page: parseInt(req.query.page, 10) || 1,
        limit: parseInt(req.query.limit, 10) || 10,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        type: req.query.type,
      };

      const result = await this.transactionService.getTransactionsByCategory(categoryId, options);

      res.status(StatusCodes.OK).json(result);
    } catch (error) {
      logger.error(`Error in getTransactionsByCategory controller for category ID ${req.params.categoryId}:`, error);
      next(error);
    }
  }

  /**
   * Get transactions by date range
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async getTransactionsByDateRange(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: 'Start date and end date are required',
        });
      }
      
      const options = {
        page: parseInt(req.query.page, 10) || 1,
        limit: parseInt(req.query.limit, 10) || 10,
        type: req.query.type,
        categoryId: req.query.categoryId,
        accountId: req.query.accountId,
      };

      const result = await this.transactionService.getTransactionsByDateRange(
        startDate,
        endDate,
        options
      );

      res.status(StatusCodes.OK).json(result);
    } catch (error) {
      logger.error('Error in getTransactionsByDateRange controller:', error);
      next(error);
    }
  }

  /**
   * Get transactions by account
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async getTransactionsByAccount(req, res, next) {
    try {
      const { accountId } = req.params;
      const options = {
        page: parseInt(req.query.page, 10) || 1,
        limit: parseInt(req.query.limit, 10) || 10,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        type: req.query.type,
        categoryId: req.query.categoryId,
      };

      const result = await this.transactionService.getTransactionsByAccount(accountId, options);

      res.status(StatusCodes.OK).json(result);
    } catch (error) {
      logger.error(`Error in getTransactionsByAccount controller for account ID ${req.params.accountId}:`, error);
      next(error);
    }
  }

  /**
   * Get transaction statistics
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async getTransactionStats(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: 'Start date and end date are required',
        });
      }
      
      const options = {
        groupBy: req.query.groupBy || 'category', // category, day, week, month
        type: req.query.type,
        accountId: req.query.accountId,
      };

      const stats = await this.transactionService.getTransactionStats(
        startDate,
        endDate,
        options
      );

      res.status(StatusCodes.OK).json(stats);
    } catch (error) {
      logger.error('Error in getTransactionStats controller:', error);
      next(error);
    }
  }
}

module.exports = TransactionController;
