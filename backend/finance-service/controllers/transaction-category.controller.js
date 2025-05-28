/**
 * Transaction Category controller for Finance Service
 */

const { StatusCodes } = require('http-status-codes');
const logger = require('../config/logger');

/**
 * Transaction Category controller
 */
class TransactionCategoryController {
  /**
   * Constructor
   * @param {Object} transactionCategoryService - Transaction Category service
   */
  constructor(transactionCategoryService) {
    this.transactionCategoryService = transactionCategoryService;
    
    // Bind methods to this instance
    this.getCategories = this.getCategories.bind(this);
    this.getCategoryById = this.getCategoryById.bind(this);
    this.createCategory = this.createCategory.bind(this);
    this.updateCategory = this.updateCategory.bind(this);
    this.deleteCategory = this.deleteCategory.bind(this);
    this.getCategoryTree = this.getCategoryTree.bind(this);
    this.getCategoryStats = this.getCategoryStats.bind(this);
  }

  /**
   * Get categories with optional filtering
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async getCategories(req, res, next) {
    try {
      const options = {
        type: req.query.type,
        includeInactive: req.query.includeInactive === 'true',
        parentId: req.query.parentId || null,
        search: req.query.search || null,
      };

      const categories = await this.transactionCategoryService.getCategories(options);

      res.status(StatusCodes.OK).json(categories);
    } catch (error) {
      logger.error('Error in getCategories controller:', error);
      next(error);
    }
  }

  /**
   * Get category by ID
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async getCategoryById(req, res, next) {
    try {
      const { id } = req.params;
      const options = {
        includeTransactions: req.query.includeTransactions === 'true',
        includeSubcategories: req.query.includeSubcategories === 'true',
      };

      const category = await this.transactionCategoryService.getCategoryById(id, options);

      res.status(StatusCodes.OK).json(category);
    } catch (error) {
      logger.error(`Error in getCategoryById controller for ID ${req.params.id}:`, error);
      next(error);
    }
  }

  /**
   * Create category
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async createCategory(req, res, next) {
    try {
      const categoryData = req.body;
      const category = await this.transactionCategoryService.createCategory(categoryData);

      res.status(StatusCodes.CREATED).json(category);
    } catch (error) {
      logger.error('Error in createCategory controller:', error);
      next(error);
    }
  }

  /**
   * Update category
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async updateCategory(req, res, next) {
    try {
      const { id } = req.params;
      const categoryData = req.body;
      const category = await this.transactionCategoryService.updateCategory(id, categoryData);

      res.status(StatusCodes.OK).json(category);
    } catch (error) {
      logger.error(`Error in updateCategory controller for ID ${req.params.id}:`, error);
      next(error);
    }
  }

  /**
   * Delete category
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async deleteCategory(req, res, next) {
    try {
      const { id } = req.params;
      await this.transactionCategoryService.deleteCategory(id);

      res.status(StatusCodes.NO_CONTENT).send();
    } catch (error) {
      logger.error(`Error in deleteCategory controller for ID ${req.params.id}:`, error);
      next(error);
    }
  }

  /**
   * Get category tree
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async getCategoryTree(req, res, next) {
    try {
      const { type } = req.query;
      const categoryTree = await this.transactionCategoryService.getCategoryTree(type);

      res.status(StatusCodes.OK).json(categoryTree);
    } catch (error) {
      logger.error('Error in getCategoryTree controller:', error);
      next(error);
    }
  }

  /**
   * Get category statistics
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async getCategoryStats(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: 'Start date and end date are required',
        });
      }
      
      const options = {
        type: req.query.type,
      };

      const stats = await this.transactionCategoryService.getCategoryStats(
        startDate,
        endDate,
        options
      );

      res.status(StatusCodes.OK).json(stats);
    } catch (error) {
      logger.error('Error in getCategoryStats controller:', error);
      next(error);
    }
  }
}

module.exports = TransactionCategoryController;
