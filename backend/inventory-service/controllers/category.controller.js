/**
 * Category controller for Inventory Service
 */

const { StatusCodes } = require('http-status-codes');
const logger = require('../config/logger');

/**
 * Category controller
 */
class CategoryController {
  /**
   * Constructor
   * @param {Object} categoryService - Category service
   */
  constructor(categoryService) {
    this.categoryService = categoryService;
    
    // Bind methods to this instance
    this.getCategories = this.getCategories.bind(this);
    this.getCategoryById = this.getCategoryById.bind(this);
    this.createCategory = this.createCategory.bind(this);
    this.updateCategory = this.updateCategory.bind(this);
    this.deleteCategory = this.deleteCategory.bind(this);
    this.getCategoryTree = this.getCategoryTree.bind(this);
    this.getCategoryBreadcrumbs = this.getCategoryBreadcrumbs.bind(this);
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
        includeInactive: req.query.includeInactive === 'true',
        parentId: req.query.parentId || null,
        includeProducts: req.query.includeProducts === 'true',
        search: req.query.search || null,
      };

      const categories = await this.categoryService.getCategories(options);

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
        includeProducts: req.query.includeProducts === 'true',
        includeSubcategories: req.query.includeSubcategories === 'true',
      };

      const category = await this.categoryService.getCategoryById(id, options);

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
      const category = await this.categoryService.createCategory(categoryData);

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
      const category = await this.categoryService.updateCategory(id, categoryData);

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
      await this.categoryService.deleteCategory(id);

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
      const { rootId } = req.query;
      const categoryTree = await this.categoryService.getCategoryTree(rootId || null);

      res.status(StatusCodes.OK).json(categoryTree);
    } catch (error) {
      logger.error('Error in getCategoryTree controller:', error);
      next(error);
    }
  }

  /**
   * Get category breadcrumbs
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async getCategoryBreadcrumbs(req, res, next) {
    try {
      const { id } = req.params;
      const breadcrumbs = await this.categoryService.getCategoryBreadcrumbs(id);

      res.status(StatusCodes.OK).json(breadcrumbs);
    } catch (error) {
      logger.error(`Error in getCategoryBreadcrumbs controller for ID ${req.params.id}:`, error);
      next(error);
    }
  }
}

module.exports = CategoryController;
