/**
 * Order controller for Order Service
 */

const logger = require('../config/logger');
const { BadRequestError } = require('../utils/errors');

/**
 * Order controller
 */
class OrderController {
  /**
   * Constructor
   * @param {Object} services - Service instances
   */
  constructor(services) {
    this.orderService = services.orderService;
    this.inventoryService = services.inventoryService;
  }

  /**
   * Get all orders
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  getOrders = async (req, res, next) => {
    try {
      const {
        page,
        limit,
        status,
        customerId,
        startDate,
        endDate,
        search,
        sortBy,
        sortOrder,
      } = req.query;

      const result = await this.orderService.getOrders({
        page,
        limit,
        status,
        customerId,
        startDate,
        endDate,
        search,
        sortBy,
        sortOrder,
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get order by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  getOrderById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const order = await this.orderService.getOrderById(id);

      res.status(200).json({ order });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create order
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  createOrder = async (req, res, next) => {
    try {
      const orderData = req.body;
      const userId = req.user.id;

      // Validate required fields
      if (!orderData.customer_id) {
        throw new BadRequestError('Customer ID is required');
      }

      if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
        throw new BadRequestError('Order must have at least one item');
      }

      // Check product availability
      const availabilityResult = await this.inventoryService.checkProductAvailability(orderData.items);

      if (!availabilityResult.available) {
        return res.status(400).json({
          message: 'Some products are not available in the requested quantity',
          unavailableItems: availabilityResult.unavailableItems,
        });
      }

      // Create order
      const order = await this.orderService.createOrder(orderData, userId);

      // Reserve products
      await this.inventoryService.reserveProducts(order.id, orderData.items);

      res.status(201).json({ order });
    } catch (error) {
      logger.error('Error creating order:', error);
      next(error);
    }
  };

  /**
   * Update order
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  updateOrder = async (req, res, next) => {
    try {
      const { id } = req.params;
      const orderData = req.body;

      // Update order
      const order = await this.orderService.updateOrder(id, orderData);

      res.status(200).json({ order });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update order status
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  updateOrderStatus = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status, comment } = req.body;
      const userId = req.user.id;

      if (!status) {
        throw new BadRequestError('Status is required');
      }

      // Get current order
      const currentOrder = await this.orderService.getOrderById(id);

      // Update order status
      const order = await this.orderService.updateOrderStatus(id, status, comment, userId);

      // Handle inventory based on status change
      if (status === 'cancelled' && currentOrder.status !== 'cancelled') {
        // Release reserved inventory
        await this.inventoryService.releaseReservation(id);
      } else if (status === 'delivered' && currentOrder.status !== 'delivered') {
        // Complete order in inventory
        await this.inventoryService.completeOrder(id);
      }

      res.status(200).json({ order });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete order
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  deleteOrder = async (req, res, next) => {
    try {
      const { id } = req.params;

      // Get order before deletion
      const order = await this.orderService.getOrderById(id);

      // Delete order
      await this.orderService.deleteOrder(id);

      // Release reserved inventory
      if (order.status === 'new' || order.status === 'processing') {
        await this.inventoryService.releaseReservation(id);
      }

      res.status(204).end();
    } catch (error) {
      next(error);
    }
  };

  /**
   * Calculate order total
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  calculateOrderTotal = async (req, res, next) => {
    try {
      const { id } = req.params;

      const total = await this.orderService.calculateOrderTotal(id);

      res.status(200).json({ total });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = OrderController;
