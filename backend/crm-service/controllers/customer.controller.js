/**
 * Customer controller for CRM Service
 */

const { StatusCodes } = require('http-status-codes');
const logger = require('../config/logger');

/**
 * Customer controller
 */
class CustomerController {
  /**
   * Constructor
   * @param {Object} customerService - Customer service
   */
  constructor(customerService) {
    this.customerService = customerService;
    
    // Bind methods to this instance
    this.getCustomers = this.getCustomers.bind(this);
    this.getCustomerById = this.getCustomerById.bind(this);
    this.createCustomer = this.createCustomer.bind(this);
    this.updateCustomer = this.updateCustomer.bind(this);
    this.deleteCustomer = this.deleteCustomer.bind(this);
    this.getCustomerOrders = this.getCustomerOrders.bind(this);
    this.getCustomerStatistics = this.getCustomerStatistics.bind(this);
    this.searchCustomers = this.searchCustomers.bind(this);
    this.getCustomerSegments = this.getCustomerSegments.bind(this);
  }

  /**
   * Get customers with pagination and filtering
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async getCustomers(req, res, next) {
    try {
      const options = {
        page: parseInt(req.query.page, 10) || 1,
        limit: parseInt(req.query.limit, 10) || 10,
        status: req.query.status,
        type: req.query.type,
        search: req.query.search,
        sortBy: req.query.sortBy || 'created_at',
        sortOrder: req.query.sortOrder || 'DESC',
      };

      const result = await this.customerService.getCustomers(options);

      res.status(StatusCodes.OK).json(result);
    } catch (error) {
      logger.error('Error in getCustomers controller:', error);
      next(error);
    }
  }

  /**
   * Get customer by ID
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async getCustomerById(req, res, next) {
    try {
      const { id } = req.params;
      const customer = await this.customerService.getCustomerById(id);

      res.status(StatusCodes.OK).json(customer);
    } catch (error) {
      logger.error(`Error in getCustomerById controller for ID ${req.params.id}:`, error);
      next(error);
    }
  }

  /**
   * Create customer
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async createCustomer(req, res, next) {
    try {
      const customerData = req.body;
      const customer = await this.customerService.createCustomer(customerData);

      res.status(StatusCodes.CREATED).json(customer);
    } catch (error) {
      logger.error('Error in createCustomer controller:', error);
      next(error);
    }
  }

  /**
   * Update customer
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async updateCustomer(req, res, next) {
    try {
      const { id } = req.params;
      const customerData = req.body;
      const customer = await this.customerService.updateCustomer(id, customerData);

      res.status(StatusCodes.OK).json(customer);
    } catch (error) {
      logger.error(`Error in updateCustomer controller for ID ${req.params.id}:`, error);
      next(error);
    }
  }

  /**
   * Delete customer
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async deleteCustomer(req, res, next) {
    try {
      const { id } = req.params;
      await this.customerService.deleteCustomer(id);

      res.status(StatusCodes.NO_CONTENT).send();
    } catch (error) {
      logger.error(`Error in deleteCustomer controller for ID ${req.params.id}:`, error);
      next(error);
    }
  }

  /**
   * Get customer orders
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async getCustomerOrders(req, res, next) {
    try {
      const { id } = req.params;
      const options = {
        page: parseInt(req.query.page, 10) || 1,
        limit: parseInt(req.query.limit, 10) || 10,
        status: req.query.status,
        sortBy: req.query.sortBy || 'created_at',
        sortOrder: req.query.sortOrder || 'DESC',
      };

      const orders = await this.customerService.getCustomerOrders(id, options);

      res.status(StatusCodes.OK).json(orders);
    } catch (error) {
      logger.error(`Error in getCustomerOrders controller for ID ${req.params.id}:`, error);
      next(error);
    }
  }

  /**
   * Get customer statistics
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async getCustomerStatistics(req, res, next) {
    try {
      const { id } = req.params;
      const statistics = await this.customerService.getCustomerStatistics(id);

      res.status(StatusCodes.OK).json(statistics);
    } catch (error) {
      logger.error(`Error in getCustomerStatistics controller for ID ${req.params.id}:`, error);
      next(error);
    }
  }

  /**
   * Search customers
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async searchCustomers(req, res, next) {
    try {
      const { query } = req.query;
      const options = {
        limit: parseInt(req.query.limit, 10) || 10,
      };

      const customers = await this.customerService.searchCustomers(query, options);

      res.status(StatusCodes.OK).json(customers);
    } catch (error) {
      logger.error('Error in searchCustomers controller:', error);
      next(error);
    }
  }

  /**
   * Get customer segments
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async getCustomerSegments(req, res, next) {
    try {
      const segments = await this.customerService.getCustomerSegments();

      res.status(StatusCodes.OK).json(segments);
    } catch (error) {
      logger.error('Error in getCustomerSegments controller:', error);
      next(error);
    }
  }
}

module.exports = CustomerController;
