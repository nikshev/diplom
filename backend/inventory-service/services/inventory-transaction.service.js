"use strict";

/**
 * Inventory Transaction service for Inventory Service
 */

const { Op } = require("sequelize");
const logger = require("../config/logger");
const { NotFoundError, BadRequestError, InsufficientStockError } = require("../utils/errors");

class InventoryTransactionService {
  constructor(db) {
    this.db = db;
    this.InventoryTransaction = db.InventoryTransaction;
    this.Inventory = db.Inventory;
    this.Product = db.Product;
    this.Warehouse = db.Warehouse;
  }

  /**
   * Get transactions with pagination and filtering
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Transactions with pagination
   */
  async getTransactions(options = {}) {
    const {
      page = 1,
      limit = 10,
      productId,
      warehouseId,
      inventoryId,
      type,
      startDate,
      endDate,
      userId,
      sortBy = "created_at",
      sortOrder = "DESC",
    } = options;

    const offset = (page - 1) * limit;
    const where = {};
    const include = [
      {
        model: this.Inventory,
        as: "inventory",
        required: true,
        include: [
          { model: this.Product, as: "product", required: false },
          { model: this.Warehouse, as: "warehouse", required: false },
        ],
      },
    ];

    if (inventoryId) {
      where.inventory_id = inventoryId;
    }

    if (productId) {
      include[0].where = { ...(include[0].where || {}), product_id: productId };
    }

    if (warehouseId) {
      include[0].where = { ...(include[0].where || {}), warehouse_id: warehouseId };
    }

    if (type) {
      where.type = type;
    }

    if (userId) {
      where.user_id = userId;
    }

    if (startDate && endDate) {
      where.created_at = { [Op.between]: [new Date(startDate), new Date(endDate)] };
    } else if (startDate) {
      where.created_at = { [Op.gte]: new Date(startDate) };
    } else if (endDate) {
      where.created_at = { [Op.lte]: new Date(endDate) };
    }

    const { count, rows } = await this.InventoryTransaction.findAndCountAll({
      where,
      include,
      order: [[sortBy, sortOrder]],
      limit,
      offset,
      distinct: true,
    });

    const totalPages = Math.ceil(count / limit);

    return {
      transactions: rows,
      pagination: {
        total: count,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Get transaction by ID
   * @param {string} id - Transaction ID
   * @returns {Promise<Object>} Transaction
   */
  async getTransactionById(id) {
    const transaction = await this.InventoryTransaction.findByPk(id, {
      include: [
        {
          model: this.Inventory,
          as: "inventory",
          include: [
            { model: this.Product, as: "product" },
            { model: this.Warehouse, as: "warehouse" },
          ],
        },
      ],
    });

    if (!transaction) {
      throw new NotFoundError(`Transaction with ID ${id} not found`);
    }

    return transaction;
  }

  /**
   * Create transaction record
   * @param {Object} data - Transaction data
   * @returns {Promise<Object>} Created transaction
   */
  async createTransaction(data) {
    const inventory = await this.Inventory.findByPk(data.inventory_id);
    if (!inventory) {
      throw new NotFoundError(`Inventory with ID ${data.inventory_id} not found`);
    }

    const transaction = await this.InventoryTransaction.create(data);
    return this.getTransactionById(transaction.id);
  }

  /**
   * Get product transactions
   */
  async getProductTransactions(productId, options = {}) {
    const product = await this.Product.findByPk(productId);
    if (!product) {
      throw new NotFoundError(`Product with ID ${productId} not found`);
    }

    return this.getTransactions({ ...options, productId });
  }

  /**
   * Get warehouse transactions
   */
  async getWarehouseTransactions(warehouseId, options = {}) {
    const warehouse = await this.Warehouse.findByPk(warehouseId);
    if (!warehouse) {
      throw new NotFoundError(`Warehouse with ID ${warehouseId} not found`);
    }

    return this.getTransactions({ ...options, warehouseId });
  }

  /**
   * Get inventory item transactions
   */
  async getInventoryItemTransactions(inventoryId, options = {}) {
    const inventory = await this.Inventory.findByPk(inventoryId);
    if (!inventory) {
      throw new NotFoundError(`Inventory item with ID ${inventoryId} not found`);
    }

    return this.getTransactions({ ...options, inventoryId });
  }

  /**
   * Get transactions by type
   */
  async getTransactionsByType(type, options = {}) {
    return this.getTransactions({ ...options, type });
  }

  /**
   * Get transactions by date range
   */
  async getTransactionsByDateRange(startDate, endDate, options = {}) {
    return this.getTransactions({ ...options, startDate, endDate });
  }

  /**
   * Get transaction summary
   */
  async getTransactionSummary(startDate, endDate, options = {}) {
    const { groupBy = "type", productId, warehouseId } = options;

    if (!startDate || !endDate) {
      throw new BadRequestError("Start date and end date are required");
    }

    const where = {
      created_at: { [Op.between]: [new Date(startDate), new Date(endDate)] },
    };

    const include = [
      {
        model: this.Inventory,
        as: "inventory",
        attributes: [],
      },
    ];

    if (productId) {
      include[0].where = { ...(include[0].where || {}), product_id: productId };
    }

    if (warehouseId) {
      include[0].where = { ...(include[0].where || {}), warehouse_id: warehouseId };
    }

    const attributes = [];
    const group = [];

    switch (groupBy) {
      case "product":
        attributes.push([this.db.sequelize.col("inventory.product_id"), "product_id"]);
        group.push("inventory.product_id");
        break;
      case "warehouse":
        attributes.push([this.db.sequelize.col("inventory.warehouse_id"), "warehouse_id"]);
        group.push("inventory.warehouse_id");
        break;
      case "day":
        attributes.push([this.db.sequelize.fn("DATE", this.db.sequelize.col("created_at")), "day"]);
        group.push(this.db.sequelize.fn("DATE", this.db.sequelize.col("created_at")));
        break;
      case "week":
        attributes.push([this.db.sequelize.fn("DATE_TRUNC", "week", this.db.sequelize.col("created_at")), "week"]);
        group.push(this.db.sequelize.fn("DATE_TRUNC", "week", this.db.sequelize.col("created_at")));
        break;
      case "month":
        attributes.push([this.db.sequelize.fn("DATE_TRUNC", "month", this.db.sequelize.col("created_at")), "month"]);
        group.push(this.db.sequelize.fn("DATE_TRUNC", "month", this.db.sequelize.col("created_at")));
        break;
      case "type":
        break;
      default:
        throw new BadRequestError(`Invalid groupBy parameter: ${groupBy}`);
    }

    attributes.push("type");
    attributes.push([this.db.sequelize.fn("SUM", this.db.sequelize.col("quantity")), "total_quantity"]);
    attributes.push([this.db.sequelize.fn("COUNT", this.db.sequelize.col("id")), "count"]);
    group.push("type");

    const stats = await this.InventoryTransaction.findAll({
      attributes,
      where,
      include,
      group,
      raw: true,
    });

    return {
      startDate,
      endDate,
      groupBy,
      stats,
    };
  }
}

module.exports = InventoryTransactionService;
