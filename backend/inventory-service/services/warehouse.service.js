/**
 * Warehouse service for Inventory Service
 */

const { Op } = require('sequelize');
const logger = require('../config/logger');
const { NotFoundError, BadRequestError, ConflictError } = require('../utils/errors');

/**
 * Warehouse service
 */
class WarehouseService {
  /**
   * Constructor
   * @param {Object} db - Database models
   */
  constructor(db) {
    this.db = db;
    this.Warehouse = db.Warehouse;
    this.Inventory = db.Inventory;
  }

  /**
   * Get warehouses with optional filtering
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Warehouses
   */
  async getWarehouses(options = {}) {
    const { 
      includeInactive = false,
      includeInventory = false,
      search = null 
    } = options;

    const where = {};
    
    if (!includeInactive) {
      where.is_active = true;
    }
    
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { code: { [Op.iLike]: `%${search}%` } },
        { city: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const include = [];
    
    if (includeInventory) {
      include.push({
        model: this.Inventory,
        as: 'inventory',
        required: false,
      });
    }

    const warehouses = await this.Warehouse.findAll({
      where,
      include,
      order: [['name', 'ASC']],
    });

    return warehouses;
  }

  /**
   * Get warehouse by ID
   * @param {string} id - Warehouse ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Warehouse
   */
  async getWarehouseById(id, options = {}) {
    const { includeInventory = false } = options;
    
    const include = [];
    
    if (includeInventory) {
      include.push({
        model: this.Inventory,
        as: 'inventory',
        required: false,
      });
    }
    
    const warehouse = await this.Warehouse.findByPk(id, {
      include,
    });
    
    if (!warehouse) {
      throw new NotFoundError(`Warehouse with ID ${id} not found`);
    }
    
    return warehouse;
  }

  /**
   * Get warehouse by code
   * @param {string} code - Warehouse code
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Warehouse
   */
  async getWarehouseByCode(code, options = {}) {
    const { includeInventory = false } = options;
    
    const include = [];
    
    if (includeInventory) {
      include.push({
        model: this.Inventory,
        as: 'inventory',
        required: false,
      });
    }
    
    const warehouse = await this.Warehouse.findOne({
      where: { code },
      include,
    });
    
    if (!warehouse) {
      throw new NotFoundError(`Warehouse with code ${code} not found`);
    }
    
    return warehouse;
  }

  /**
   * Create warehouse
   * @param {Object} warehouseData - Warehouse data
   * @returns {Promise<Object>} Created warehouse
   */
  async createWarehouse(warehouseData) {
    const { code } = warehouseData;
    
    // Check if code already exists
    const existingWarehouse = await this.Warehouse.findOne({ where: { code } });
    if (existingWarehouse) {
      throw new ConflictError(`Warehouse with code ${code} already exists`);
    }
    
    // Create warehouse
    const warehouse = await this.Warehouse.create(warehouseData);
    
    return this.getWarehouseById(warehouse.id);
  }

  /**
   * Update warehouse
   * @param {string} id - Warehouse ID
   * @param {Object} warehouseData - Warehouse data
   * @returns {Promise<Object>} Updated warehouse
   */
  async updateWarehouse(id, warehouseData) {
    const warehouse = await this.getWarehouseById(id);
    const { code } = warehouseData;
    
    // Check if code already exists and belongs to another warehouse
    if (code && code !== warehouse.code) {
      const existingWarehouse = await this.Warehouse.findOne({ where: { code } });
      if (existingWarehouse && existingWarehouse.id !== id) {
        throw new ConflictError(`Warehouse with code ${code} already exists`);
      }
    }
    
    // Update warehouse
    await warehouse.update(warehouseData);
    
    return this.getWarehouseById(id);
  }

  /**
   * Delete warehouse
   * @param {string} id - Warehouse ID
   * @returns {Promise<boolean>} Success
   */
  async deleteWarehouse(id) {
    const warehouse = await this.getWarehouseById(id, { includeInventory: true });
    
    // Check if warehouse has inventory
    if (warehouse.inventory && warehouse.inventory.length > 0) {
      throw new BadRequestError('Cannot delete warehouse with inventory');
    }
    
    // Delete warehouse
    await warehouse.destroy();
    
    return true;
  }

  /**
   * Update warehouse status
   * @param {string} id - Warehouse ID
   * @param {boolean} isActive - Active status
   * @returns {Promise<Object>} Updated warehouse
   */
  async updateWarehouseStatus(id, isActive) {
    const warehouse = await this.getWarehouseById(id);
    
    // Update status
    await warehouse.update({ is_active: isActive });
    
    return this.getWarehouseById(id);
  }

  /**
   * Get warehouse inventory summary
   * @param {string} id - Warehouse ID
   * @returns {Promise<Object>} Inventory summary
   */
  async getWarehouseInventorySummary(id) {
    // Validate warehouse
    await this.getWarehouseById(id);
    
    // Get total products in warehouse
    const totalProducts = await this.Inventory.count({
      where: { warehouse_id: id },
    });
    
    // Get total inventory value
    const inventoryValue = await this.Inventory.findAll({
      attributes: [
        [this.db.sequelize.fn('SUM', this.db.sequelize.literal('inventory.quantity * products.price')), 'total_value'],
      ],
      where: { warehouse_id: id },
      include: [
        {
          model: this.db.Product,
          as: 'product',
          attributes: [],
        },
      ],
      raw: true,
    });
    
    // Get low stock count
    const lowStockCount = await this.Inventory.count({
      where: {
        warehouse_id: id,
        quantity: {
          [Op.lt]: this.db.sequelize.col('min_quantity'),
        },
      },
    });
    
    // Get out of stock count
    const outOfStockCount = await this.Inventory.count({
      where: {
        warehouse_id: id,
        quantity: 0,
      },
    });
    
    return {
      warehouse_id: id,
      total_products: totalProducts,
      total_value: inventoryValue[0].total_value || 0,
      low_stock_count: lowStockCount,
      out_of_stock_count: outOfStockCount,
    };
  }

  /**
   * Search warehouses
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Matching warehouses
   */
  async searchWarehouses(query, options = {}) {
    const { limit = 10, includeInactive = false } = options;
    
    if (!query || query.trim().length < 2) {
      throw new BadRequestError('Search query must be at least 2 characters long');
    }
    
    const where = {
      [Op.or]: [
        { name: { [Op.iLike]: `%${query}%` } },
        { code: { [Op.iLike]: `%${query}%` } },
        { city: { [Op.iLike]: `%${query}%` } },
        { address: { [Op.iLike]: `%${query}%` } },
      ],
    };
    
    if (!includeInactive) {
      where.is_active = true;
    }
    
    const warehouses = await this.Warehouse.findAll({
      where,
      limit,
    });
    
    return warehouses;
  }
}

module.exports = WarehouseService;
