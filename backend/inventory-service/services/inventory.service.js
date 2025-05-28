/**
 * Inventory service for Inventory Service
 */

const { Op } = require('sequelize');
const logger = require('../config/logger');
const config = require('../config');
const { 
  NotFoundError, 
  BadRequestError, 
  InsufficientStockError 
} = require('../utils/errors');

/**
 * Inventory service
 */
class InventoryService {
  /**
   * Constructor
   * @param {Object} db - Database models
   */
  constructor(db) {
    this.db = db;
    this.Inventory = db.Inventory;
    this.Product = db.Product;
    this.Warehouse = db.Warehouse;
    this.InventoryTransaction = db.InventoryTransaction;
  }

  /**
   * Get inventory items with pagination and filtering
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Inventory items with pagination
   */
  async getInventoryItems(options = {}) {
    const {
      page = 1,
      limit = 10,
      productId,
      warehouseId,
      lowStock = false,
      sortBy = 'updated_at',
      sortOrder = 'DESC',
    } = options;

    const offset = (page - 1) * limit;
    const where = {};

    // Apply filters
    if (productId) {
      where.product_id = productId;
    }

    if (warehouseId) {
      where.warehouse_id = warehouseId;
    }

    if (lowStock) {
      where.quantity = {
        [Op.lt]: this.db.sequelize.col('min_quantity'),
      };
    }

    // Get inventory items with pagination
    const { count, rows } = await this.Inventory.findAndCountAll({
      where,
      include: [
        {
          model: this.Product,
          as: 'product',
          required: true,
        },
        {
          model: this.Warehouse,
          as: 'warehouse',
          required: true,
        },
      ],
      order: [[sortBy, sortOrder]],
      limit,
      offset,
      distinct: true,
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(count / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      inventory: rows,
      pagination: {
        total: count,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages,
        hasNext,
        hasPrev,
      },
    };
  }

  /**
   * Get inventory item by ID
   * @param {string} id - Inventory ID
   * @returns {Promise<Object>} Inventory item
   */
  async getInventoryById(id) {
    const inventory = await this.Inventory.findByPk(id, {
      include: [
        {
          model: this.Product,
          as: 'product',
        },
        {
          model: this.Warehouse,
          as: 'warehouse',
        },
      ],
    });

    if (!inventory) {
      throw new NotFoundError(`Inventory with ID ${id} not found`);
    }

    return inventory;
  }

  /**
   * Get inventory by product and warehouse
   * @param {string} productId - Product ID
   * @param {string} warehouseId - Warehouse ID
   * @returns {Promise<Object>} Inventory item
   */
  async getInventoryByProductAndWarehouse(productId, warehouseId) {
    const inventory = await this.Inventory.findOne({
      where: {
        product_id: productId,
        warehouse_id: warehouseId,
      },
      include: [
        {
          model: this.Product,
          as: 'product',
        },
        {
          model: this.Warehouse,
          as: 'warehouse',
        },
      ],
    });

    if (!inventory) {
      throw new NotFoundError(`Inventory for product ${productId} in warehouse ${warehouseId} not found`);
    }

    return inventory;
  }

  /**
   * Create inventory item
   * @param {Object} inventoryData - Inventory data
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Created inventory item
   */
  async createInventory(inventoryData, userId) {
    const { product_id, warehouse_id, quantity = 0, min_quantity = 0, max_quantity = null, location = null } = inventoryData;

    // Validate product
    const product = await this.Product.findByPk(product_id);
    if (!product) {
      throw new NotFoundError(`Product with ID ${product_id} not found`);
    }

    // Validate warehouse
    const warehouse = await this.Warehouse.findByPk(warehouse_id);
    if (!warehouse) {
      throw new NotFoundError(`Warehouse with ID ${warehouse_id} not found`);
    }

    // Check if inventory already exists
    const existingInventory = await this.Inventory.findOne({
      where: {
        product_id,
        warehouse_id,
      },
    });

    if (existingInventory) {
      throw new BadRequestError(`Inventory for product ${product_id} in warehouse ${warehouse_id} already exists`);
    }

    // Start transaction
    const transaction = await this.db.sequelize.transaction();

    try {
      // Create inventory
      const inventory = await this.Inventory.create(
        {
          product_id,
          warehouse_id,
          quantity,
          quantity_reserved: 0,
          min_quantity,
          max_quantity,
          location,
        },
        { transaction }
      );

      // Create transaction record if quantity > 0
      if (quantity > 0) {
        await this.InventoryTransaction.create(
          {
            inventory_id: inventory.id,
            type: config.stockOperationTypes.ADJUSTMENT,
            quantity,
            notes: 'Initial inventory setup',
            user_id: userId,
          },
          { transaction }
        );
      }

      // Commit transaction
      await transaction.commit();

      // Return inventory with associations
      return this.getInventoryById(inventory.id);
    } catch (error) {
      // Rollback transaction on error
      await transaction.rollback();
      logger.error('Error creating inventory:', error);
      throw error;
    }
  }

  /**
   * Update inventory item
   * @param {string} id - Inventory ID
   * @param {Object} inventoryData - Inventory data
   * @returns {Promise<Object>} Updated inventory item
   */
  async updateInventory(id, inventoryData) {
    const inventory = await this.getInventoryById(id);
    const { min_quantity, max_quantity, location } = inventoryData;

    // Start transaction
    const transaction = await this.db.sequelize.transaction();

    try {
      // Update inventory
      await inventory.update(
        {
          min_quantity: min_quantity !== undefined ? min_quantity : inventory.min_quantity,
          max_quantity: max_quantity !== undefined ? max_quantity : inventory.max_quantity,
          location: location !== undefined ? location : inventory.location,
        },
        { transaction }
      );

      // Commit transaction
      await transaction.commit();

      // Return updated inventory
      return this.getInventoryById(id);
    } catch (error) {
      // Rollback transaction on error
      await transaction.rollback();
      logger.error(`Error updating inventory ${id}:`, error);
      throw error;
    }
  }

  /**
   * Adjust inventory quantity
   * @param {string} id - Inventory ID
   * @param {number} quantity - Quantity to adjust (positive or negative)
   * @param {string} userId - User ID
   * @param {string} notes - Notes
   * @returns {Promise<Object>} Updated inventory item
   */
  async adjustInventory(id, quantity, userId, notes = '') {
    const inventory = await this.getInventoryById(id);

    if (quantity === 0) {
      throw new BadRequestError('Adjustment quantity cannot be zero');
    }

    // Calculate new quantity
    const newQuantity = inventory.quantity + quantity;
    
    // Ensure quantity doesn't go below reserved quantity
    if (newQuantity < inventory.quantity_reserved) {
      throw new InsufficientStockError(
        'Cannot adjust inventory below reserved quantity',
        inventory.product,
        Math.abs(quantity),
        inventory.quantity - inventory.quantity_reserved
      );
    }

    // Start transaction
    const transaction = await this.db.sequelize.transaction();

    try {
      // Update inventory
      await inventory.update(
        {
          quantity: newQuantity,
        },
        { transaction }
      );

      // Create transaction record
      await this.InventoryTransaction.create(
        {
          inventory_id: id,
          type: config.stockOperationTypes.ADJUSTMENT,
          quantity,
          notes,
          user_id: userId,
        },
        { transaction }
      );

      // Commit transaction
      await transaction.commit();

      // Return updated inventory
      return this.getInventoryById(id);
    } catch (error) {
      // Rollback transaction on error
      await transaction.rollback();
      logger.error(`Error adjusting inventory ${id}:`, error);
      throw error;
    }
  }

  /**
   * Transfer inventory between warehouses
   * @param {string} sourceInventoryId - Source inventory ID
   * @param {string} targetWarehouseId - Target warehouse ID
   * @param {number} quantity - Quantity to transfer
   * @param {string} userId - User ID
   * @param {string} notes - Notes
   * @returns {Promise<Object>} Updated source and target inventory items
   */
  async transferInventory(sourceInventoryId, targetWarehouseId, quantity, userId, notes = '') {
    const sourceInventory = await this.getInventoryById(sourceInventoryId);
    
    // Validate quantity
    if (quantity <= 0) {
      throw new BadRequestError('Transfer quantity must be positive');
    }

    // Check available quantity
    if (sourceInventory.quantity_available < quantity) {
      throw new InsufficientStockError(
        'Insufficient available quantity for transfer',
        sourceInventory.product,
        quantity,
        sourceInventory.quantity_available
      );
    }

    // Validate target warehouse
    const targetWarehouse = await this.Warehouse.findByPk(targetWarehouseId);
    if (!targetWarehouse) {
      throw new NotFoundError(`Target warehouse with ID ${targetWarehouseId} not found`);
    }

    // Check if source and target are the same
    if (sourceInventory.warehouse_id === targetWarehouseId) {
      throw new BadRequestError('Cannot transfer to the same warehouse');
    }

    // Start transaction
    const transaction = await this.db.sequelize.transaction();

    try {
      // Find or create target inventory
      let targetInventory = await this.Inventory.findOne({
        where: {
          product_id: sourceInventory.product_id,
          warehouse_id: targetWarehouseId,
        },
        transaction,
      });

      if (!targetInventory) {
        targetInventory = await this.Inventory.create(
          {
            product_id: sourceInventory.product_id,
            warehouse_id: targetWarehouseId,
            quantity: 0,
            quantity_reserved: 0,
            min_quantity: sourceInventory.min_quantity,
            max_quantity: sourceInventory.max_quantity,
          },
          { transaction }
        );
      }

      // Update source inventory
      await sourceInventory.update(
        {
          quantity: sourceInventory.quantity - quantity,
        },
        { transaction }
      );

      // Update target inventory
      await targetInventory.update(
        {
          quantity: targetInventory.quantity + quantity,
        },
        { transaction }
      );

      // Create transaction records
      await this.InventoryTransaction.create(
        {
          inventory_id: sourceInventory.id,
          type: config.stockOperationTypes.TRANSFER,
          quantity: -quantity,
          reference_id: targetInventory.id,
          reference_type: 'inventory',
          notes,
          user_id: userId,
        },
        { transaction }
      );

      await this.InventoryTransaction.create(
        {
          inventory_id: targetInventory.id,
          type: config.stockOperationTypes.TRANSFER,
          quantity,
          reference_id: sourceInventory.id,
          reference_type: 'inventory',
          notes,
          user_id: userId,
        },
        { transaction }
      );

      // Commit transaction
      await transaction.commit();

      // Return updated inventories
      return {
        sourceInventory: await this.getInventoryById(sourceInventory.id),
        targetInventory: await this.getInventoryById(targetInventory.id),
      };
    } catch (error) {
      // Rollback transaction on error
      await transaction.rollback();
      logger.error(`Error transferring inventory from ${sourceInventoryId} to warehouse ${targetWarehouseId}:`, error);
      throw error;
    }
  }

  /**
   * Reserve inventory
   * @param {string} id - Inventory ID
   * @param {number} quantity - Quantity to reserve
   * @param {string} orderId - Order ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Updated inventory item
   */
  async reserveInventory(id, quantity, orderId, userId) {
    const inventory = await this.getInventoryById(id);

    // Validate quantity
    if (quantity <= 0) {
      throw new BadRequestError('Reservation quantity must be positive');
    }

    // Check available quantity
    if (inventory.quantity_available < quantity) {
      throw new InsufficientStockError(
        'Insufficient available quantity for reservation',
        inventory.product,
        quantity,
        inventory.quantity_available
      );
    }

    // Start transaction
    const transaction = await this.db.sequelize.transaction();

    try {
      // Update inventory
      await inventory.update(
        {
          quantity_reserved: inventory.quantity_reserved + quantity,
        },
        { transaction }
      );

      // Create transaction record
      await this.InventoryTransaction.create(
        {
          inventory_id: id,
          type: config.stockOperationTypes.RESERVATION,
          quantity,
          reference_id: orderId,
          reference_type: 'order',
          notes: `Reserved for order ${orderId}`,
          user_id: userId,
        },
        { transaction }
      );

      // Commit transaction
      await transaction.commit();

      // Return updated inventory
      return this.getInventoryById(id);
    } catch (error) {
      // Rollback transaction on error
      await transaction.rollback();
      logger.error(`Error reserving inventory ${id}:`, error);
      throw error;
    }
  }

  /**
   * Release reserved inventory
   * @param {string} id - Inventory ID
   * @param {number} quantity - Quantity to release
   * @param {string} orderId - Order ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Updated inventory item
   */
  async releaseInventory(id, quantity, orderId, userId) {
    const inventory = await this.getInventoryById(id);

    // Validate quantity
    if (quantity <= 0) {
      throw new BadRequestError('Release quantity must be positive');
    }

    // Check reserved quantity
    if (inventory.quantity_reserved < quantity) {
      throw new BadRequestError(`Cannot release more than reserved quantity (${inventory.quantity_reserved})`);
    }

    // Start transaction
    const transaction = await this.db.sequelize.transaction();

    try {
      // Update inventory
      await inventory.update(
        {
          quantity_reserved: inventory.quantity_reserved - quantity,
        },
        { transaction }
      );

      // Create transaction record
      await this.InventoryTransaction.create(
        {
          inventory_id: id,
          type: config.stockOperationTypes.RELEASE,
          quantity,
          reference_id: orderId,
          reference_type: 'order',
          notes: `Released from order ${orderId}`,
          user_id: userId,
        },
        { transaction }
      );

      // Commit transaction
      await transaction.commit();

      // Return updated inventory
      return this.getInventoryById(id);
    } catch (error) {
      // Rollback transaction on error
      await transaction.rollback();
      logger.error(`Error releasing inventory ${id}:`, error);
      throw error;
    }
  }

  /**
   * Fulfill order (convert reserved to shipped)
   * @param {string} id - Inventory ID
   * @param {number} quantity - Quantity to fulfill
   * @param {string} orderId - Order ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Updated inventory item
   */
  async fulfillOrder(id, quantity, orderId, userId) {
    const inventory = await this.getInventoryById(id);

    // Validate quantity
    if (quantity <= 0) {
      throw new BadRequestError('Fulfillment quantity must be positive');
    }

    // Check reserved quantity
    if (inventory.quantity_reserved < quantity) {
      throw new BadRequestError(`Cannot fulfill more than reserved quantity (${inventory.quantity_reserved})`);
    }

    // Start transaction
    const transaction = await this.db.sequelize.transaction();

    try {
      // Update inventory
      await inventory.update(
        {
          quantity: inventory.quantity - quantity,
          quantity_reserved: inventory.quantity_reserved - quantity,
        },
        { transaction }
      );

      // Create transaction record
      await this.InventoryTransaction.create(
        {
          inventory_id: id,
          type: config.stockOperationTypes.SALE,
          quantity: -quantity,
          reference_id: orderId,
          reference_type: 'order',
          notes: `Fulfilled for order ${orderId}`,
          user_id: userId,
        },
        { transaction }
      );

      // Commit transaction
      await transaction.commit();

      // Return updated inventory
      return this.getInventoryById(id);
    } catch (error) {
      // Rollback transaction on error
      await transaction.rollback();
      logger.error(`Error fulfilling inventory ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get inventory transactions
   * @param {string} inventoryId - Inventory ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Transactions with pagination
   */
  async getInventoryTransactions(inventoryId, options = {}) {
    const {
      page = 1,
      limit = 10,
      startDate,
      endDate,
      type,
    } = options;

    const offset = (page - 1) * limit;
    const where = { inventory_id: inventoryId };

    // Apply filters
    if (type) {
      where.type = type;
    }

    if (startDate && endDate) {
      where.created_at = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    } else if (startDate) {
      where.created_at = {
        [Op.gte]: new Date(startDate),
      };
    } else if (endDate) {
      where.created_at = {
        [Op.lte]: new Date(endDate),
      };
    }

    // Get transactions with pagination
    const { count, rows } = await this.InventoryTransaction.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(count / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      transactions: rows,
      pagination: {
        total: count,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages,
        hasNext,
        hasPrev,
      },
    };
  }

  /**
   * Get low stock items
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Low stock items
   */
  async getLowStockItems(options = {}) {
    const { warehouseId, limit = 10 } = options;

    const where = {
      quantity: {
        [Op.lt]: this.db.sequelize.col('min_quantity'),
      },
    };

    if (warehouseId) {
      where.warehouse_id = warehouseId;
    }

    const lowStockItems = await this.Inventory.findAll({
      where,
      include: [
        {
          model: this.Product,
          as: 'product',
        },
        {
          model: this.Warehouse,
          as: 'warehouse',
        },
      ],
      limit,
    });

    return lowStockItems;
  }

  /**
   * Get inventory summary
   * @returns {Promise<Object>} Inventory summary
   */
  async getInventorySummary() {
    // Get total products
    const totalProducts = await this.Product.count();

    // Get total inventory value
    const inventoryValue = await this.Inventory.findAll({
      attributes: [
        [this.db.sequelize.fn('SUM', this.db.sequelize.literal('inventory.quantity * products.price')), 'total_value'],
      ],
      include: [
        {
          model: this.Product,
          as: 'product',
          attributes: [],
        },
      ],
      raw: true,
    });

    // Get low stock count
    const lowStockCount = await this.Inventory.count({
      where: {
        quantity: {
          [Op.lt]: this.db.sequelize.col('min_quantity'),
        },
      },
    });

    // Get out of stock count
    const outOfStockCount = await this.Inventory.count({
      where: {
        quantity: 0,
      },
    });

    return {
      total_products: totalProducts,
      total_value: inventoryValue[0].total_value || 0,
      low_stock_count: lowStockCount,
      out_of_stock_count: outOfStockCount,
    };
  }
}

module.exports = InventoryService;
