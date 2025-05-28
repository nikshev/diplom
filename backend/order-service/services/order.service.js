/**
 * Order service for Order Service
 */

const { Op } = require('sequelize');
const logger = require('../config/logger');
const config = require('../config');
const { NotFoundError, BadRequestError } = require('../utils/errors');

/**
 * Order service
 */
class OrderService {
  /**
   * Constructor
   * @param {Object} db - Database models
   */
  constructor(db) {
    this.db = db;
    this.Order = db.Order;
    this.OrderItem = db.OrderItem;
    this.OrderStatusHistory = db.OrderStatusHistory;
  }

  /**
   * Get orders with pagination and filtering
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Orders with pagination
   */
  async getOrders(options = {}) {
    const {
      page = 1,
      limit = 10,
      status,
      customerId,
      startDate,
      endDate,
      search,
      sortBy = 'created_at',
      sortOrder = 'DESC',
    } = options;

    const offset = (page - 1) * limit;
    const where = {};

    // Apply filters
    if (status) {
      where.status = status;
    }

    if (customerId) {
      where.customer_id = customerId;
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

    if (search) {
      where[Op.or] = [
        { order_number: { [Op.iLike]: `%${search}%` } },
        { '$items.product_id$': { [Op.iLike]: `%${search}%` } },
      ];
    }

    // Get orders with pagination
    const { count, rows } = await this.Order.findAndCountAll({
      where,
      include: [
        {
          model: this.OrderItem,
          as: 'items',
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
      orders: rows,
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
   * Get order by ID
   * @param {string} id - Order ID
   * @returns {Promise<Object>} Order
   */
  async getOrderById(id) {
    const order = await this.Order.findByPk(id, {
      include: [
        {
          model: this.OrderItem,
          as: 'items',
        },
        {
          model: this.OrderStatusHistory,
          as: 'status_history',
          order: [['created_at', 'DESC']],
        },
      ],
    });

    if (!order) {
      throw new NotFoundError(`Order with ID ${id} not found`);
    }

    return order;
  }

  /**
   * Create order
   * @param {Object} orderData - Order data
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Created order
   */
  async createOrder(orderData, userId) {
    const { items, ...orderDetails } = orderData;

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new BadRequestError('Order must have at least one item');
    }

    // Start transaction
    const transaction = await this.db.sequelize.transaction();

    try {
      // Generate order number
      const orderNumber = await this.generateOrderNumber();

      // Create order
      const order = await this.Order.create(
        {
          ...orderDetails,
          order_number: orderNumber,
          status: config.orderStatuses.NEW,
        },
        { transaction }
      );

      // Create order items
      const orderItems = await Promise.all(
        items.map((item) =>
          this.OrderItem.create(
            {
              order_id: order.id,
              product_id: item.product_id,
              quantity: item.quantity,
              unit_price: item.price,
              total_price: item.price * item.quantity,
            },
            { transaction }
          )
        )
      );

      // Create initial status history
      await this.OrderStatusHistory.create(
        {
          order_id: order.id,
          status: config.orderStatuses.NEW,
          comment: 'Order created',
          user_id: userId,
        },
        { transaction }
      );

      // Calculate total amount
      const totalAmount = orderItems.reduce(
        (sum, item) => sum + parseFloat(item.total_price),
        0
      );

      // Update order with total amount
      await order.update(
        { total_amount: totalAmount },
        { transaction }
      );

      // Commit transaction
      await transaction.commit();

      // Return order with items
      return this.getOrderById(order.id);
    } catch (error) {
      // Rollback transaction on error
      await transaction.rollback();
      logger.error('Error creating order:', error);
      throw error;
    }
  }

  /**
   * Update order
   * @param {string} id - Order ID
   * @param {Object} orderData - Order data
   * @returns {Promise<Object>} Updated order
   */
  async updateOrder(id, orderData) {
    const order = await this.getOrderById(id);

    // Check if order can be updated
    if (
      order.status !== config.orderStatuses.NEW &&
      order.status !== config.orderStatuses.PROCESSING
    ) {
      throw new BadRequestError(
        `Cannot update order with status "${order.status}"`
      );
    }

    // Start transaction
    const transaction = await this.db.sequelize.transaction();

    try {
      // Update order
      await order.update(orderData, { transaction });

      // Commit transaction
      await transaction.commit();

      // Return updated order
      return this.getOrderById(id);
    } catch (error) {
      // Rollback transaction on error
      await transaction.rollback();
      logger.error(`Error updating order ${id}:`, error);
      throw error;
    }
  }

  /**
   * Update order status
   * @param {string} id - Order ID
   * @param {string} status - New status
   * @param {string} comment - Status change comment
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Updated order
   */
  async updateOrderStatus(id, status, comment, userId) {
    const order = await this.getOrderById(id);

    // Validate status
    if (!Object.values(config.orderStatuses).includes(status)) {
      throw new BadRequestError(`Invalid status: ${status}`);
    }

    // Check if status transition is valid
    this.validateStatusTransition(order.status, status);

    // Start transaction
    const transaction = await this.db.sequelize.transaction();

    try {
      // Update order status
      await order.update({ status }, { transaction });

      // Create status history
      await this.OrderStatusHistory.create(
        {
          order_id: id,
          status,
          comment,
          user_id: userId,
        },
        { transaction }
      );

      // Commit transaction
      await transaction.commit();

      // Return updated order
      return this.getOrderById(id);
    } catch (error) {
      // Rollback transaction on error
      await transaction.rollback();
      logger.error(`Error updating order status ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete order
   * @param {string} id - Order ID
   * @returns {Promise<boolean>} Success
   */
  async deleteOrder(id) {
    const order = await this.getOrderById(id);

    // Check if order can be deleted
    if (order.status !== config.orderStatuses.NEW) {
      throw new BadRequestError(
        `Cannot delete order with status "${order.status}"`
      );
    }

    // Start transaction
    const transaction = await this.db.sequelize.transaction();

    try {
      // Delete order items
      await this.OrderItem.destroy({
        where: { order_id: id },
        transaction,
      });

      // Delete order status history
      await this.OrderStatusHistory.destroy({
        where: { order_id: id },
        transaction,
      });

      // Delete order
      await order.destroy({ transaction });

      // Commit transaction
      await transaction.commit();

      return true;
    } catch (error) {
      // Rollback transaction on error
      await transaction.rollback();
      logger.error(`Error deleting order ${id}:`, error);
      throw error;
    }
  }

  /**
   * Calculate order total
   * @param {string} id - Order ID
   * @returns {Promise<number>} Total amount
   */
  async calculateOrderTotal(id) {
    const order = await this.getOrderById(id);
    
    // Calculate total from items
    const total = order.items.reduce(
      (sum, item) => sum + parseFloat(item.total_price),
      0
    );

    return total;
  }

  /**
   * Generate unique order number
   * @returns {Promise<string>} Order number
   */
  async generateOrderNumber() {
    const date = new Date();
    const year = date.getFullYear().toString().slice(2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    // Get count of orders for today
    const todayStart = new Date(date.setHours(0, 0, 0, 0));
    const todayEnd = new Date(date.setHours(23, 59, 59, 999));
    
    const count = await this.Order.count({
      where: {
        created_at: {
          [Op.between]: [todayStart, todayEnd],
        },
      },
    });
    
    // Generate order number: YY-MM-DD-XXXX
    const sequence = (count + 1).toString().padStart(4, '0');
    return `${year}-${month}-${day}-${sequence}`;
  }

  /**
   * Validate status transition
   * @param {string} currentStatus - Current status
   * @param {string} newStatus - New status
   * @throws {BadRequestError} If transition is invalid
   */
  validateStatusTransition(currentStatus, newStatus) {
    // Define valid transitions
    const validTransitions = {
      [config.orderStatuses.NEW]: [
        config.orderStatuses.PROCESSING,
        config.orderStatuses.CANCELLED,
      ],
      [config.orderStatuses.PROCESSING]: [
        config.orderStatuses.SHIPPED,
        config.orderStatuses.CANCELLED,
      ],
      [config.orderStatuses.SHIPPED]: [
        config.orderStatuses.DELIVERED,
        config.orderStatuses.RETURNED,
      ],
      [config.orderStatuses.DELIVERED]: [
        config.orderStatuses.RETURNED,
      ],
      [config.orderStatuses.CANCELLED]: [],
      [config.orderStatuses.RETURNED]: [],
    };

    // Check if transition is valid
    if (
      currentStatus === newStatus ||
      !validTransitions[currentStatus] ||
      !validTransitions[currentStatus].includes(newStatus)
    ) {
      throw new BadRequestError(
        `Invalid status transition from "${currentStatus}" to "${newStatus}"`
      );
    }
  }
}

module.exports = OrderService;
