/**
 * Warehouse controller for Inventory Service
 */

const { StatusCodes } = require('http-status-codes');
const logger = require('../config/logger');

/**
 * Warehouse controller
 */
class WarehouseController {
  /**
   * Constructor
   * @param {Object} warehouseService - Warehouse service
   */
  constructor(warehouseService) {
    this.warehouseService = warehouseService;
    
    // Bind methods to this instance
    this.getWarehouses = this.getWarehouses.bind(this);
    this.getWarehouseById = this.getWarehouseById.bind(this);
    this.createWarehouse = this.createWarehouse.bind(this);
    this.updateWarehouse = this.updateWarehouse.bind(this);
    this.deleteWarehouse = this.deleteWarehouse.bind(this);
    this.getWarehouseInventory = this.getWarehouseInventory.bind(this);
    this.getWarehouseStats = this.getWarehouseStats.bind(this);
  }

  /**
   * Get warehouses with optional filtering
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async getWarehouses(req, res, next) {
    try {
      const options = {
        includeInactive: req.query.includeInactive === 'true',
        search: req.query.search || null,
        includeStats: req.query.includeStats === 'true',
      };

      const warehouses = await this.warehouseService.getWarehouses(options);

      res.status(StatusCodes.OK).json(warehouses);
    } catch (error) {
      logger.error('Error in getWarehouses controller:', error);
      next(error);
    }
  }

  /**
   * Get warehouse by ID
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async getWarehouseById(req, res, next) {
    try {
      const { id } = req.params;
      const options = {
        includeInventory: req.query.includeInventory === 'true',
        includeStats: req.query.includeStats === 'true',
      };

      const warehouse = await this.warehouseService.getWarehouseById(id, options);

      res.status(StatusCodes.OK).json(warehouse);
    } catch (error) {
      logger.error(`Error in getWarehouseById controller for ID ${req.params.id}:`, error);
      next(error);
    }
  }

  /**
   * Create warehouse
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async createWarehouse(req, res, next) {
    try {
      const warehouseData = req.body;
      const warehouse = await this.warehouseService.createWarehouse(warehouseData);

      res.status(StatusCodes.CREATED).json(warehouse);
    } catch (error) {
      logger.error('Error in createWarehouse controller:', error);
      next(error);
    }
  }

  /**
   * Update warehouse
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async updateWarehouse(req, res, next) {
    try {
      const { id } = req.params;
      const warehouseData = req.body;
      const warehouse = await this.warehouseService.updateWarehouse(id, warehouseData);

      res.status(StatusCodes.OK).json(warehouse);
    } catch (error) {
      logger.error(`Error in updateWarehouse controller for ID ${req.params.id}:`, error);
      next(error);
    }
  }

  /**
   * Delete warehouse
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async deleteWarehouse(req, res, next) {
    try {
      const { id } = req.params;
      await this.warehouseService.deleteWarehouse(id);

      res.status(StatusCodes.NO_CONTENT).send();
    } catch (error) {
      logger.error(`Error in deleteWarehouse controller for ID ${req.params.id}:`, error);
      next(error);
    }
  }

  /**
   * Get warehouse inventory
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async getWarehouseInventory(req, res, next) {
    try {
      const { id } = req.params;
      const options = {
        page: parseInt(req.query.page, 10) || 1,
        limit: parseInt(req.query.limit, 10) || 10,
        categoryId: req.query.categoryId,
        lowStock: req.query.lowStock === 'true',
        sortBy: req.query.sortBy || 'quantity',
        sortOrder: req.query.sortOrder || 'ASC',
      };

      const inventory = await this.warehouseService.getWarehouseInventory(id, options);

      res.status(StatusCodes.OK).json(inventory);
    } catch (error) {
      logger.error(`Error in getWarehouseInventory controller for ID ${req.params.id}:`, error);
      next(error);
    }
  }

  /**
   * Get warehouse statistics
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async getWarehouseStats(req, res, next) {
    try {
      const { id } = req.params;
      const stats = await this.warehouseService.getWarehouseStats(id);

      res.status(StatusCodes.OK).json(stats);
    } catch (error) {
      logger.error(`Error in getWarehouseStats controller for ID ${req.params.id}:`, error);
      next(error);
    }
  }
}

module.exports = WarehouseController;
