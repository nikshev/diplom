/**
 * Product controller for Inventory Service
 */

const { StatusCodes } = require('http-status-codes');
const logger = require('../config/logger');

/**
 * Product controller
 */
class ProductController {
  /**
   * Constructor
   * @param {Object} productService - Product service
   */
  constructor(productService) {
    this.productService = productService;
    
    // Bind methods to this instance
    this.getProducts = this.getProducts.bind(this);
    this.getProductById = this.getProductById.bind(this);
    this.getProductBySku = this.getProductBySku.bind(this);
    this.createProduct = this.createProduct.bind(this);
    this.updateProduct = this.updateProduct.bind(this);
    this.deleteProduct = this.deleteProduct.bind(this);
    this.updateProductPrice = this.updateProductPrice.bind(this);
    this.updateProductStatus = this.updateProductStatus.bind(this);
    this.searchProducts = this.searchProducts.bind(this);
    this.getLowStockProducts = this.getLowStockProducts.bind(this);
    this.getProductStockLevels = this.getProductStockLevels.bind(this);
  }

  /**
   * Get products with pagination and filtering
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async getProducts(req, res, next) {
    try {
      logger.info('ProductController.getProducts called with query:', req.query);
      
      const options = {
        page: parseInt(req.query.page, 10) || 1,
        limit: parseInt(req.query.limit, 10) || 10,
        categoryId: req.query.categoryId,
        search: req.query.search,
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : undefined,
        sortBy: req.query.sortBy || 'name',
        sortOrder: req.query.sortOrder || 'ASC',
        includeInactive: req.query.includeInactive === 'true',
        includeInventory: req.query.includeInventory === 'true',
      };

      logger.info('ProductController.getProducts options:', options);

      const result = await this.productService.getProducts(options);

      logger.info('ProductController.getProducts result:', { 
        productsCount: result.products.length, 
        total: result.pagination.total 
      });

      res.status(StatusCodes.OK).json(result);
    } catch (error) {
      logger.error('Error in getProducts controller:', error);
      next(error);
    }
  }

  /**
   * Get product by ID
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async getProductById(req, res, next) {
    try {
      const { id } = req.params;
      const options = {
        includeInventory: req.query.includeInventory !== 'false',
      };

      const product = await this.productService.getProductById(id, options);

      res.status(StatusCodes.OK).json(product);
    } catch (error) {
      logger.error(`Error in getProductById controller for ID ${req.params.id}:`, error);
      next(error);
    }
  }

  /**
   * Get product by SKU
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async getProductBySku(req, res, next) {
    try {
      const { sku } = req.params;
      const options = {
        includeInventory: req.query.includeInventory !== 'false',
      };

      const product = await this.productService.getProductBySku(sku, options);

      res.status(StatusCodes.OK).json(product);
    } catch (error) {
      logger.error(`Error in getProductBySku controller for SKU ${req.params.sku}:`, error);
      next(error);
    }
  }

  /**
   * Create product
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async createProduct(req, res, next) {
    try {
      const productData = req.body;
      const product = await this.productService.createProduct(productData);

      res.status(StatusCodes.CREATED).json(product);
    } catch (error) {
      logger.error('Error in createProduct controller:', error);
      next(error);
    }
  }

  /**
   * Update product
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async updateProduct(req, res, next) {
    try {
      const { id } = req.params;
      const productData = req.body;
      const product = await this.productService.updateProduct(id, productData);

      res.status(StatusCodes.OK).json(product);
    } catch (error) {
      logger.error(`Error in updateProduct controller for ID ${req.params.id}:`, error);
      next(error);
    }
  }

  /**
   * Delete product
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async deleteProduct(req, res, next) {
    try {
      const { id } = req.params;
      await this.productService.deleteProduct(id);

      res.status(StatusCodes.NO_CONTENT).send();
    } catch (error) {
      logger.error(`Error in deleteProduct controller for ID ${req.params.id}:`, error);
      next(error);
    }
  }

  /**
   * Update product price
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async updateProductPrice(req, res, next) {
    try {
      const { id } = req.params;
      const { price } = req.body;

      if (price === undefined) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: 'Price is required',
        });
      }

      const product = await this.productService.updateProductPrice(id, parseFloat(price));

      res.status(StatusCodes.OK).json(product);
    } catch (error) {
      logger.error(`Error in updateProductPrice controller for ID ${req.params.id}:`, error);
      next(error);
    }
  }

  /**
   * Update product status
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async updateProductStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { isActive } = req.body;

      if (isActive === undefined) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: 'isActive is required',
        });
      }

      const product = await this.productService.updateProductStatus(id, isActive);

      res.status(StatusCodes.OK).json(product);
    } catch (error) {
      logger.error(`Error in updateProductStatus controller for ID ${req.params.id}:`, error);
      next(error);
    }
  }

  /**
   * Search products
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async searchProducts(req, res, next) {
    try {
      const { query } = req.query;
      const options = {
        limit: parseInt(req.query.limit, 10) || 10,
        includeInactive: req.query.includeInactive === 'true',
      };

      const products = await this.productService.searchProducts(query, options);

      res.status(StatusCodes.OK).json(products);
    } catch (error) {
      logger.error('Error in searchProducts controller:', error);
      next(error);
    }
  }

  /**
   * Get low stock products
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async getLowStockProducts(req, res, next) {
    try {
      const options = {
        warehouseId: req.query.warehouseId,
        limit: parseInt(req.query.limit, 10) || 10,
      };

      const products = await this.productService.getLowStockProducts(options);

      res.status(StatusCodes.OK).json(products);
    } catch (error) {
      logger.error('Error in getLowStockProducts controller:', error);
      next(error);
    }
  }

  /**
   * Get product stock levels
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async getProductStockLevels(req, res, next) {
    try {
      const { id } = req.params;
      const stockLevels = await this.productService.getProductStockLevels(id);

      res.status(StatusCodes.OK).json(stockLevels);
    } catch (error) {
      logger.error(`Error in getProductStockLevels controller for ID ${req.params.id}:`, error);
      next(error);
    }
  }
}

module.exports = ProductController;
