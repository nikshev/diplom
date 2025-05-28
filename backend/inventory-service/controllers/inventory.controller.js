/**
 * Inventory controller for Inventory Service
 */

const { StatusCodes } = require('http-status-codes');
const logger = require('../config/logger');

/**
 * Inventory controller
 */
class InventoryController {
  /**
   * Constructor
   * @param {Object} inventoryService - Inventory service
   */
  constructor(inventoryService) {
    this.inventoryService = inventoryService;
    
    // Bind methods to this instance
    this.getInventoryItems = this.getInventoryItems.bind(this);
    this.getInventoryById = this.getInventoryById.bind(this);
    this.getInventoryByProductAndWarehouse = this.getInventoryByProductAndWarehouse.bind(this);
    this.createInventory = this.createInventory.bind(this);
    this.updateInventory = this.updateInventory.bind(this);
    this.adjustInventory = this.adjustInventory.bind(this);
    this.transferInventory = this.transferInventory.bind(this);
    this.reserveInventory = this.reserveInventory.bind(this);
    this.releaseInventory = this.releaseInventory.bind(this);
    this.fulfillOrder = this.fulfillOrder.bind(this);
    this.getInventoryTransactions = this.getInventoryTransactions.bind(this);
    this.getLowStockItems = this.getLowStockItems.bind(this);
    this.getInventorySummary = this.getInventorySummary.bind(this);
  }

  /**
   * Get inventory items with pagination and filtering
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async getInventoryItems(req, res, next) {
    try {
      const options = {
        page: parseInt(req.query.page, 10) || 1,
        limit: parseInt(req.query.limit, 10) || 10,
        productId: req.query.productId,
        warehouseId: req.query.warehouseId,
        lowStock: req.query.lowStock === 'true',
        sortBy: req.query.sortBy || 'updated_at',
        sortOrder: req.query.sortOrder || 'DESC',
      };

      const result = await this.inventoryService.getInventoryItems(options);

      res.status(StatusCodes.OK).json(result);
    } catch (error) {
      logger.error('Error in getInventoryItems controller:', error);
      next(error);
    }
  }

  /**
   * Get inventory by ID
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async getInventoryById(req, res, next) {
    try {
      const { id } = req.params;
      const inventory = await this.inventoryService.getInventoryById(id);

      res.status(StatusCodes.OK).json(inventory);
    } catch (error) {
      logger.error(`Error in getInventoryById controller for ID ${req.params.id}:`, error);
      next(error);
    }
  }

  /**
   * Get inventory by product and warehouse
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async getInventoryByProductAndWarehouse(req, res, next) {
    try {
      const { productId, warehouseId } = req.params;
      const inventory = await this.inventoryService.getInventoryByProductAndWarehouse(productId, warehouseId);

      res.status(StatusCodes.OK).json(inventory);
    } catch (error) {
      logger.error(`Error in getInventoryByProductAndWarehouse controller for product ${req.params.productId} and warehouse ${req.params.warehouseId}:`, error);
      next(error);
    }
  }

  /**
   * Create inventory
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async createInventory(req, res, next) {
    try {
      const inventoryData = req.body;
      const userId = req.user.id;
      const inventory = await this.inventoryService.createInventory(inventoryData, userId);

      res.status(StatusCodes.CREATED).json(inventory);
    } catch (error) {
      logger.error('Error in createInventory controller:', error);
      next(error);
    }
  }

  /**
   * Update inventory
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async updateInventory(req, res, next) {
    try {
      const { id } = req.params;
      const inventoryData = req.body;
      const inventory = await this.inventoryService.updateInventory(id, inventoryData);

      res.status(StatusCodes.OK).json(inventory);
    } catch (error) {
      logger.error(`Error in updateInventory controller for ID ${req.params.id}:`, error);
      next(error);
    }
  }

  /**
   * Adjust inventory quantity
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async adjustInventory(req, res, next) {
    try {
      const { id } = req.params;
      const { quantity, notes } = req.body;
      const userId = req.user.id;

      if (quantity === undefined) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: 'Quantity is required',
        });
      }

      const inventory = await this.inventoryService.adjustInventory(id, parseInt(quantity, 10), userId, notes || '');

      res.status(StatusCodes.OK).json(inventory);
    } catch (error) {
      logger.error(`Error in adjustInventory controller for ID ${req.params.id}:`, error);
      next(error);
    }
  }

  /**
   * Transfer inventory between warehouses
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async transferInventory(req, res, next) {
    try {
      const { id } = req.params;
      const { targetWarehouseId, quantity, notes } = req.body;
      const userId = req.user.id;

      if (!targetWarehouseId) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: 'Target warehouse ID is required',
        });
      }

      if (quantity === undefined) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: 'Quantity is required',
        });
      }

      const result = await this.inventoryService.transferInventory(
        id,
        targetWarehouseId,
        parseInt(quantity, 10),
        userId,
        notes || ''
      );

      res.status(StatusCodes.OK).json(result);
    } catch (error) {
      logger.error(`Error in transferInventory controller for ID ${req.params.id}:`, error);
      next(error);
    }
  }

  /**
   * Reserve inventory
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async reserveInventory(req, res, next) {
    try {
      const { id } = req.params;
      const { quantity, orderId } = req.body;
      const userId = req.user.id;

      if (quantity === undefined) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: 'Quantity is required',
        });
      }

      if (!orderId) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: 'Order ID is required',
        });
      }

      const inventory = await this.inventoryService.reserveInventory(
        id,
        parseInt(quantity, 10),
        orderId,
        userId
      );

      res.status(StatusCodes.OK).json(inventory);
    } catch (error) {
      logger.error(`Error in reserveInventory controller for ID ${req.params.id}:`, error);
      next(error);
    }
  }

  /**
   * Release reserved inventory
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async releaseInventory(req, res, next) {
    try {
      const { id } = req.params;
      const { quantity, orderId } = req.body;
      const userId = req.user.id;

      if (quantity === undefined) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: 'Quantity is required',
        });
      }

      if (!orderId) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: 'Order ID is required',
        });
      }

      const inventory = await this.inventoryService.releaseInventory(
        id,
        parseInt(quantity, 10),
        orderId,
        userId
      );

      res.status(StatusCodes.OK).json(inventory);
    } catch (error) {
      logger.error(`Error in releaseInventory controller for ID ${req.params.id}:`, error);
      next(error);
    }
  }

  /**
   * Fulfill order (convert reserved to shipped)
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async fulfillOrder(req, res, next) {
    try {
      const { id } = req.params;
      const { quantity, orderId } = req.body;
      const userId = req.user.id;

      if (quantity === undefined) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: 'Quantity is required',
        });
      }

      if (!orderId) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: 'Order ID is required',
        });
      }

      const inventory = await this.inventoryService.fulfillOrder(
        id,
        parseInt(quantity, 10),
        orderId,
        userId
      );

      res.status(StatusCodes.OK).json(inventory);
    } catch (error) {
      logger.error(`Error in fulfillOrder controller for ID ${req.params.id}:`, error);
      next(error);
    }
  }

  /**
   * Get inventory transactions
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async getInventoryTransactions(req, res, next) {
    try {
      const { id } = req.params;
      const options = {
        page: parseInt(req.query.page, 10) || 1,
        limit: parseInt(req.query.limit, 10) || 10,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        type: req.query.type,
      };

      const result = await this.inventoryService.getInventoryTransactions(id, options);

      res.status(StatusCodes.OK).json(result);
    } catch (error) {
      logger.error(`Error in getInventoryTransactions controller for ID ${req.params.id}:`, error);
      next(error);
    }
  }

  /**
   * Get low stock items
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async getLowStockItems(req, res, next) {
    try {
      const options = {
        warehouseId: req.query.warehouseId,
        limit: parseInt(req.query.limit, 10) || 10,
      };

      const items = await this.inventoryService.getLowStockItems(options);

      res.status(StatusCodes.OK).json(items);
    } catch (error) {
      logger.error('Error in getLowStockItems controller:', error);
      next(error);
    }
  }

  /**
   * Get inventory summary
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async getInventorySummary(req, res, next) {
    try {
      const summary = await this.inventoryService.getInventorySummary();

      res.status(StatusCodes.OK).json(summary);
    } catch (error) {
      logger.error('Error in getInventorySummary controller:', error);
      next(error);
    }
  }
}

module.exports = InventoryController;
