/**
 * Inventory Transaction controller for Inventory Service
 */

const { StatusCodes } = require('http-status-codes');
const logger = require('../config/logger');

/**
 * Inventory Transaction controller
 */
class InventoryTransactionController {
  /**
   * Constructor
   * @param {Object} inventoryTransactionService - Inventory Transaction service
   */
  constructor(inventoryTransactionService) {
    this.inventoryTransactionService = inventoryTransactionService;
    
    // Bind methods to this instance
    this.getTransactions = this.getTransactions.bind(this);
    this.getTransactionById = this.getTransactionById.bind(this);
    this.createTransaction = this.createTransaction.bind(this);
    this.getProductTransactions = this.getProductTransactions.bind(this);
    this.getWarehouseTransactions = this.getWarehouseTransactions.bind(this);
    this.getInventoryItemTransactions = this.getInventoryItemTransactions.bind(this);
    this.getTransactionsByType = this.getTransactionsByType.bind(this);
    this.getTransactionsByDateRange = this.getTransactionsByDateRange.bind(this);
    this.getTransactionSummary = this.getTransactionSummary.bind(this);
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
        productId: req.query.productId,
        warehouseId: req.query.warehouseId,
        inventoryId: req.query.inventoryId,
        type: req.query.type,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        userId: req.query.userId,
        sortBy: req.query.sortBy || 'created_at',
        sortOrder: req.query.sortOrder || 'DESC',
      };

      const result = await this.inventoryTransactionService.getTransactions(options);

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
      const transaction = await this.inventoryTransactionService.getTransactionById(id);

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
      transactionData.user_id = userId;
      
      const transaction = await this.inventoryTransactionService.createTransaction(transactionData);

      res.status(StatusCodes.CREATED).json(transaction);
    } catch (error) {
      logger.error('Error in createTransaction controller:', error);
      next(error);
    }
  }

  /**
   * Get product transactions
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async getProductTransactions(req, res, next) {
    try {
      const { productId } = req.params;
      const options = {
        page: parseInt(req.query.page, 10) || 1,
        limit: parseInt(req.query.limit, 10) || 10,
        type: req.query.type,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
      };

      const result = await this.inventoryTransactionService.getProductTransactions(productId, options);

      res.status(StatusCodes.OK).json(result);
    } catch (error) {
      logger.error(`Error in getProductTransactions controller for product ID ${req.params.productId}:`, error);
      next(error);
    }
  }

  /**
   * Get warehouse transactions
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async getWarehouseTransactions(req, res, next) {
    try {
      const { warehouseId } = req.params;
      const options = {
        page: parseInt(req.query.page, 10) || 1,
        limit: parseInt(req.query.limit, 10) || 10,
        type: req.query.type,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        productId: req.query.productId,
      };

      const result = await this.inventoryTransactionService.getWarehouseTransactions(warehouseId, options);

      res.status(StatusCodes.OK).json(result);
    } catch (error) {
      logger.error(`Error in getWarehouseTransactions controller for warehouse ID ${req.params.warehouseId}:`, error);
      next(error);
    }
  }

  /**
   * Get inventory item transactions
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async getInventoryItemTransactions(req, res, next) {
    try {
      const { inventoryId } = req.params;
      const options = {
        page: parseInt(req.query.page, 10) || 1,
        limit: parseInt(req.query.limit, 10) || 10,
        type: req.query.type,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
      };

      const result = await this.inventoryTransactionService.getInventoryItemTransactions(inventoryId, options);

      res.status(StatusCodes.OK).json(result);
    } catch (error) {
      logger.error(`Error in getInventoryItemTransactions controller for inventory ID ${req.params.inventoryId}:`, error);
      next(error);
    }
  }

  /**
   * Get transactions by type
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async getTransactionsByType(req, res, next) {
    try {
      const { type } = req.params;
      const options = {
        page: parseInt(req.query.page, 10) || 1,
        limit: parseInt(req.query.limit, 10) || 10,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        productId: req.query.productId,
        warehouseId: req.query.warehouseId,
      };

      const result = await this.inventoryTransactionService.getTransactionsByType(type, options);

      res.status(StatusCodes.OK).json(result);
    } catch (error) {
      logger.error(`Error in getTransactionsByType controller for type ${req.params.type}:`, error);
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
        productId: req.query.productId,
        warehouseId: req.query.warehouseId,
      };

      const result = await this.inventoryTransactionService.getTransactionsByDateRange(
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
   * Get transaction summary
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async getTransactionSummary(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: 'Start date and end date are required',
        });
      }
      
      const options = {
        groupBy: req.query.groupBy || 'type', // type, product, warehouse, day, week, month
        productId: req.query.productId,
        warehouseId: req.query.warehouseId,
      };

      const summary = await this.inventoryTransactionService.getTransactionSummary(
        startDate,
        endDate,
        options
      );

      res.status(StatusCodes.OK).json(summary);
    } catch (error) {
      logger.error('Error in getTransactionSummary controller:', error);
      next(error);
    }
  }
}

module.exports = InventoryTransactionController;
