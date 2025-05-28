/**
 * Account controller for Finance Service
 */

const { StatusCodes } = require('http-status-codes');
const logger = require('../config/logger');

/**
 * Account controller
 */
class AccountController {
  /**
   * Constructor
   * @param {Object} accountService - Account service
   */
  constructor(accountService) {
    this.accountService = accountService;
    
    // Bind methods to this instance
    this.getAccounts = this.getAccounts.bind(this);
    this.getAccountById = this.getAccountById.bind(this);
    this.createAccount = this.createAccount.bind(this);
    this.updateAccount = this.updateAccount.bind(this);
    this.deleteAccount = this.deleteAccount.bind(this);
    this.getAccountBalance = this.getAccountBalance.bind(this);
    this.getAccountTransactions = this.getAccountTransactions.bind(this);
    this.transferFunds = this.transferFunds.bind(this);
    this.getAccountStats = this.getAccountStats.bind(this);
  }

  /**
   * Get accounts with optional filtering
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async getAccounts(req, res, next) {
    try {
      const options = {
        includeInactive: req.query.includeInactive === 'true',
        type: req.query.type,
        search: req.query.search || null,
        includeBalance: req.query.includeBalance === 'true',
      };

      const accounts = await this.accountService.getAccounts(options);

      res.status(StatusCodes.OK).json(accounts);
    } catch (error) {
      logger.error('Error in getAccounts controller:', error);
      next(error);
    }
  }

  /**
   * Get account by ID
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async getAccountById(req, res, next) {
    try {
      const { id } = req.params;
      const options = {
        includeTransactions: req.query.includeTransactions === 'true',
      };

      const account = await this.accountService.getAccountById(id, options);

      res.status(StatusCodes.OK).json(account);
    } catch (error) {
      logger.error(`Error in getAccountById controller for ID ${req.params.id}:`, error);
      next(error);
    }
  }

  /**
   * Create account
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async createAccount(req, res, next) {
    try {
      const accountData = req.body;
      const account = await this.accountService.createAccount(accountData);

      res.status(StatusCodes.CREATED).json(account);
    } catch (error) {
      logger.error('Error in createAccount controller:', error);
      next(error);
    }
  }

  /**
   * Update account
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async updateAccount(req, res, next) {
    try {
      const { id } = req.params;
      const accountData = req.body;
      const account = await this.accountService.updateAccount(id, accountData);

      res.status(StatusCodes.OK).json(account);
    } catch (error) {
      logger.error(`Error in updateAccount controller for ID ${req.params.id}:`, error);
      next(error);
    }
  }

  /**
   * Delete account
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async deleteAccount(req, res, next) {
    try {
      const { id } = req.params;
      await this.accountService.deleteAccount(id);

      res.status(StatusCodes.NO_CONTENT).send();
    } catch (error) {
      logger.error(`Error in deleteAccount controller for ID ${req.params.id}:`, error);
      next(error);
    }
  }

  /**
   * Get account balance
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async getAccountBalance(req, res, next) {
    try {
      const { id } = req.params;
      const balance = await this.accountService.getAccountBalance(id);

      res.status(StatusCodes.OK).json(balance);
    } catch (error) {
      logger.error(`Error in getAccountBalance controller for ID ${req.params.id}:`, error);
      next(error);
    }
  }

  /**
   * Get account transactions
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async getAccountTransactions(req, res, next) {
    try {
      const { id } = req.params;
      const options = {
        page: parseInt(req.query.page, 10) || 1,
        limit: parseInt(req.query.limit, 10) || 10,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        type: req.query.type,
        categoryId: req.query.categoryId,
        sortBy: req.query.sortBy || 'transaction_date',
        sortOrder: req.query.sortOrder || 'DESC',
      };

      const transactions = await this.accountService.getAccountTransactions(id, options);

      res.status(StatusCodes.OK).json(transactions);
    } catch (error) {
      logger.error(`Error in getAccountTransactions controller for ID ${req.params.id}:`, error);
      next(error);
    }
  }

  /**
   * Transfer funds between accounts
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async transferFunds(req, res, next) {
    try {
      const { sourceAccountId, targetAccountId, amount, description } = req.body;
      const userId = req.user.id;

      if (!sourceAccountId || !targetAccountId || !amount) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: 'Source account, target account, and amount are required',
        });
      }

      const result = await this.accountService.transferFunds(
        sourceAccountId,
        targetAccountId,
        parseFloat(amount),
        userId,
        description || 'Fund transfer'
      );

      res.status(StatusCodes.OK).json(result);
    } catch (error) {
      logger.error('Error in transferFunds controller:', error);
      next(error);
    }
  }

  /**
   * Get account statistics
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async getAccountStats(req, res, next) {
    try {
      const { id } = req.params;
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: 'Start date and end date are required',
        });
      }
      
      const stats = await this.accountService.getAccountStats(id, startDate, endDate);

      res.status(StatusCodes.OK).json(stats);
    } catch (error) {
      logger.error(`Error in getAccountStats controller for ID ${req.params.id}:`, error);
      next(error);
    }
  }
}

module.exports = AccountController;
