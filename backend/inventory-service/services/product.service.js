/**
 * Product service for Inventory Service
 */

const { Op } = require('sequelize');
const logger = require('../config/logger');
const config = require('../config');
const { NotFoundError, BadRequestError, ConflictError } = require('../utils/errors');

/**
 * Product service
 */
class ProductService {
  /**
   * Constructor
   * @param {Object} db - Database models
   */
  constructor(db) {
    this.db = db;
    this.Product = db.Product;
    this.Category = db.Category;
    this.Inventory = db.Inventory;
    this.Warehouse = db.Warehouse;
  }

  /**
   * Get products with pagination and filtering
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Products with pagination
   */
  async getProducts(options = {}) {
    const {
      page = 1,
      limit = 10,
      categoryId,
      search,
      minPrice,
      maxPrice,
      sortBy = 'name',
      sortOrder = 'ASC',
      includeInactive = false,
      includeInventory = false,
    } = options;

    logger.info('ProductService.getProducts called with options:', options);

    const offset = (page - 1) * limit;
    const where = {};

    // Apply filters
    if (!includeInactive) {
      where.is_active = true;
    }

    if (categoryId) {
      where.category_id = categoryId;
    }

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { sku: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (minPrice !== undefined) {
      where.price = {
        ...where.price,
        [Op.gte]: minPrice,
      };
    }

    if (maxPrice !== undefined) {
      where.price = {
        ...where.price,
        [Op.lte]: maxPrice,
      };
    }

    logger.info('ProductService.getProducts where clause:', where);

    // Set up include models
    const include = [
      {
        model: this.Category,
        as: 'category',
        required: false,
      },
    ];

    if (includeInventory) {
      include.push({
        model: this.Inventory,
        as: 'inventory',
        required: false,
        include: [
          {
            model: this.Warehouse,
            as: 'warehouse',
          },
        ],
      });
    }

    logger.info('ProductService.getProducts query params:', { where, include, sortBy, sortOrder, limit, offset });

    // Get products with pagination
    const { count, rows } = await this.Product.findAndCountAll({
      where,
      include,
      order: [[sortBy, sortOrder]],
      limit,
      offset,
      distinct: true,
    });

    logger.info('ProductService.getProducts query result:', { count, rowsLength: rows.length });

    // Calculate pagination metadata
    const totalPages = Math.ceil(count / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      products: rows,
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
   * Get product by ID
   * @param {string} id - Product ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Product
   */
  async getProductById(id, options = {}) {
    const { includeInventory = true } = options;

    const include = [
      {
        model: this.Category,
        as: 'category',
        required: false,
      },
    ];

    if (includeInventory) {
      include.push({
        model: this.Inventory,
        as: 'inventory',
        required: false,
        include: [
          {
            model: this.Warehouse,
            as: 'warehouse',
          },
        ],
      });
    }

    const product = await this.Product.findByPk(id, {
      include,
    });

    if (!product) {
      throw new NotFoundError(`Product with ID ${id} not found`);
    }

    return product;
  }

  /**
   * Get product by SKU
   * @param {string} sku - Product SKU
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Product
   */
  async getProductBySku(sku, options = {}) {
    const { includeInventory = true } = options;

    const include = [
      {
        model: this.Category,
        as: 'category',
        required: false,
      },
    ];

    if (includeInventory) {
      include.push({
        model: this.Inventory,
        as: 'inventory',
        required: false,
        include: [
          {
            model: this.Warehouse,
            as: 'warehouse',
          },
        ],
      });
    }

    const product = await this.Product.findOne({
      where: { sku },
      include,
    });

    if (!product) {
      throw new NotFoundError(`Product with SKU ${sku} not found`);
    }

    return product;
  }

  /**
   * Create product
   * @param {Object} productData - Product data
   * @returns {Promise<Object>} Created product
   */
  async createProduct(productData) {
    const { sku, category_id } = productData;

    // Check if SKU already exists
    const existingProduct = await this.Product.findOne({ where: { sku } });
    if (existingProduct) {
      throw new ConflictError(`Product with SKU ${sku} already exists`);
    }

    // Validate category if provided
    if (category_id) {
      const category = await this.Category.findByPk(category_id);
      if (!category) {
        throw new NotFoundError(`Category with ID ${category_id} not found`);
      }
    }

    // Start transaction
    const transaction = await this.db.sequelize.transaction();

    try {
      // Create product
      const product = await this.Product.create(productData, { transaction });

      // Commit transaction
      await transaction.commit();

      // Return product with associations
      return this.getProductById(product.id);
    } catch (error) {
      // Rollback transaction on error
      await transaction.rollback();
      logger.error('Error creating product:', error);
      throw error;
    }
  }

  /**
   * Update product
   * @param {string} id - Product ID
   * @param {Object} productData - Product data
   * @returns {Promise<Object>} Updated product
   */
  async updateProduct(id, productData) {
    const product = await this.getProductById(id);
    const { sku, category_id } = productData;

    // Check if SKU already exists and belongs to another product
    if (sku && sku !== product.sku) {
      const existingProduct = await this.Product.findOne({ where: { sku } });
      if (existingProduct && existingProduct.id !== id) {
        throw new ConflictError(`Product with SKU ${sku} already exists`);
      }
    }

    // Validate category if provided
    if (category_id) {
      const category = await this.Category.findByPk(category_id);
      if (!category) {
        throw new NotFoundError(`Category with ID ${category_id} not found`);
      }
    }

    // Start transaction
    const transaction = await this.db.sequelize.transaction();

    try {
      // Update product
      await product.update(productData, { transaction });

      // Commit transaction
      await transaction.commit();

      // Return updated product
      return this.getProductById(id);
    } catch (error) {
      // Rollback transaction on error
      await transaction.rollback();
      logger.error(`Error updating product ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete product
   * @param {string} id - Product ID
   * @returns {Promise<boolean>} Success
   */
  async deleteProduct(id) {
    const product = await this.getProductById(id, { includeInventory: true });

    // Check if product has inventory
    if (product.inventory && product.inventory.length > 0) {
      throw new BadRequestError('Cannot delete product with inventory');
    }

    // Start transaction
    const transaction = await this.db.sequelize.transaction();

    try {
      // Delete product
      await product.destroy({ transaction });

      // Commit transaction
      await transaction.commit();

      return true;
    } catch (error) {
      // Rollback transaction on error
      await transaction.rollback();
      logger.error(`Error deleting product ${id}:`, error);
      throw error;
    }
  }

  /**
   * Update product price
   * @param {string} id - Product ID
   * @param {number} price - New price
   * @returns {Promise<Object>} Updated product
   */
  async updateProductPrice(id, price) {
    const product = await this.getProductById(id);

    if (price < 0) {
      throw new BadRequestError('Price cannot be negative');
    }

    // Update price
    await product.update({ price });

    return this.getProductById(id);
  }

  /**
   * Update product status
   * @param {string} id - Product ID
   * @param {boolean} isActive - Active status
   * @returns {Promise<Object>} Updated product
   */
  async updateProductStatus(id, isActive) {
    const product = await this.getProductById(id);

    // Update status
    await product.update({ is_active: isActive });

    return this.getProductById(id);
  }

  /**
   * Search products
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Matching products
   */
  async searchProducts(query, options = {}) {
    const { limit = 10, includeInactive = false } = options;

    if (!query || query.trim().length < 2) {
      throw new BadRequestError('Search query must be at least 2 characters long');
    }

    const where = {
      [Op.or]: [
        { name: { [Op.iLike]: `%${query}%` } },
        { sku: { [Op.iLike]: `%${query}%` } },
        { description: { [Op.iLike]: `%${query}%` } },
      ],
    };

    if (!includeInactive) {
      where.is_active = true;
    }

    const products = await this.Product.findAll({
      where,
      include: [
        {
          model: this.Category,
          as: 'category',
          required: false,
        },
      ],
      limit,
    });

    return products;
  }

  /**
   * Get low stock products
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Low stock products
   */
  async getLowStockProducts(options = {}) {
    const { warehouseId, limit = 10 } = options;

    const where = {};
    if (warehouseId) {
      where.warehouse_id = warehouseId;
    }

    const products = await this.Product.findAll({
      include: [
        {
          model: this.Inventory,
          as: 'inventory',
          required: true,
          where: {
            ...where,
            quantity: {
              [Op.lt]: this.db.sequelize.col('min_quantity'),
            },
          },
          include: [
            {
              model: this.Warehouse,
              as: 'warehouse',
            },
          ],
        },
        {
          model: this.Category,
          as: 'category',
          required: false,
        },
      ],
      limit,
    });

    return products;
  }

  /**
   * Get product stock levels
   * @param {string} id - Product ID
   * @returns {Promise<Object>} Stock levels
   */
  async getProductStockLevels(id) {
    const product = await this.getProductById(id, { includeInventory: true });

    // Calculate total stock
    let totalQuantity = 0;
    let totalReserved = 0;
    let totalAvailable = 0;

    if (product.inventory && product.inventory.length > 0) {
      product.inventory.forEach(inv => {
        totalQuantity += inv.quantity;
        totalReserved += inv.quantity_reserved;
        totalAvailable += inv.quantity_available;
      });
    }

    return {
      product_id: product.id,
      sku: product.sku,
      name: product.name,
      total_quantity: totalQuantity,
      total_reserved: totalReserved,
      total_available: totalAvailable,
      inventory: product.inventory,
    };
  }
}

module.exports = ProductService;
