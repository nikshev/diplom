/**
 * Customer service for CRM Service
 */

const { Op } = require('sequelize');
const logger = require('../config/logger');
const config = require('../config');
const { NotFoundError, BadRequestError } = require('../utils/errors');

/**
 * Customer service
 */
class CustomerService {
  /**
   * Constructor
   * @param {Object} db - Database models
   */
  constructor(db) {
    this.db = db;
    this.Customer = db.Customer;
    this.Contact = db.Contact;
    this.Interaction = db.Interaction;
  }

  /**
   * Get customers with pagination and filtering
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Customers with pagination
   */
  async getCustomers(options = {}) {
    const {
      page = 1,
      limit = 10,
      status,
      type,
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

    if (type) {
      where.type = type;
    }

    if (search) {
      where[Op.or] = [
        { first_name: { [Op.iLike]: `%${search}%` } },
        { last_name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } },
      ];
    }

    // Get customers with pagination
    const { count, rows } = await this.Customer.findAndCountAll({
      where,
      include: [
        {
          model: this.Contact,
          as: 'contacts',
          required: false,
          where: {
            is_primary: true,
          },
          limit: 1,
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
      customers: rows,
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
   * Get customer by ID
   * @param {string} id - Customer ID
   * @returns {Promise<Object>} Customer
   */
  async getCustomerById(id) {
    const customer = await this.Customer.findByPk(id, {
      include: [
        {
          model: this.Contact,
          as: 'contacts',
        },
      ],
    });

    if (!customer) {
      throw new NotFoundError(`Customer with ID ${id} not found`);
    }

    return customer;
  }

  /**
   * Create customer
   * @param {Object} customerData - Customer data
   * @returns {Promise<Object>} Created customer
   */
  async createCustomer(customerData) {
    const { contacts, ...customerDetails } = customerData;

    // Start transaction
    const transaction = await this.db.sequelize.transaction();

    try {
      // Create customer
      const customer = await this.Customer.create(customerDetails, { transaction });

      // Create contacts if provided
      if (contacts && Array.isArray(contacts) && contacts.length > 0) {
        // Add customer_id to each contact
        const customerContacts = contacts.map(contact => ({
          ...contact,
          customer_id: customer.id,
        }));

        await this.Contact.bulkCreate(customerContacts, { transaction });
      }

      // Commit transaction
      await transaction.commit();

      // Return customer with contacts
      return this.getCustomerById(customer.id);
    } catch (error) {
      // Rollback transaction on error
      await transaction.rollback();
      logger.error('Error creating customer:', error);
      throw error;
    }
  }

  /**
   * Update customer
   * @param {string} id - Customer ID
   * @param {Object} customerData - Customer data
   * @returns {Promise<Object>} Updated customer
   */
  async updateCustomer(id, customerData) {
    const customer = await this.getCustomerById(id);
    const { contacts, ...customerDetails } = customerData;

    // Start transaction
    const transaction = await this.db.sequelize.transaction();

    try {
      // Update customer
      await customer.update(customerDetails, { transaction });

      // Update contacts if provided
      if (contacts && Array.isArray(contacts) && contacts.length > 0) {
        for (const contact of contacts) {
          if (contact.id) {
            // Update existing contact
            const existingContact = await this.Contact.findOne({
              where: {
                id: contact.id,
                customer_id: id,
              },
              transaction,
            });

            if (existingContact) {
              await existingContact.update(contact, { transaction });
            }
          } else {
            // Create new contact
            await this.Contact.create({
              ...contact,
              customer_id: id,
            }, { transaction });
          }
        }
      }

      // Commit transaction
      await transaction.commit();

      // Return updated customer
      return this.getCustomerById(id);
    } catch (error) {
      // Rollback transaction on error
      await transaction.rollback();
      logger.error(`Error updating customer ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete customer
   * @param {string} id - Customer ID
   * @returns {Promise<boolean>} Success
   */
  async deleteCustomer(id) {
    const customer = await this.getCustomerById(id);

    // Start transaction
    const transaction = await this.db.sequelize.transaction();

    try {
      // Delete contacts
      await this.Contact.destroy({
        where: { customer_id: id },
        transaction,
      });

      // Delete interactions
      await this.Interaction.destroy({
        where: { customer_id: id },
        transaction,
      });

      // Delete customer
      await customer.destroy({ transaction });

      // Commit transaction
      await transaction.commit();

      return true;
    } catch (error) {
      // Rollback transaction on error
      await transaction.rollback();
      logger.error(`Error deleting customer ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get customer orders
   * @param {string} id - Customer ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Customer orders
   */
  async getCustomerOrders(id, options = {}) {
    // Check if customer exists
    await this.getCustomerById(id);

    // This would typically call the Order service
    // For now, we'll return a mock response
    return [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        order_number: 'ORD-123456',
        status: 'delivered',
        total_amount: 1250.99,
        created_at: new Date(),
      },
      {
        id: '123e4567-e89b-12d3-a456-426614174001',
        order_number: 'ORD-123457',
        status: 'processing',
        total_amount: 450.50,
        created_at: new Date(),
      },
    ];
  }

  /**
   * Get customer statistics
   * @param {string} id - Customer ID
   * @returns {Promise<Object>} Customer statistics
   */
  async getCustomerStatistics(id) {
    // Check if customer exists
    await this.getCustomerById(id);

    // Count interactions
    const interactionsCount = await this.Interaction.count({
      where: { customer_id: id },
    });

    // Count interactions by type
    const interactionsByType = await this.Interaction.findAll({
      attributes: [
        'type',
        [this.db.sequelize.fn('COUNT', this.db.sequelize.col('id')), 'count'],
      ],
      where: { customer_id: id },
      group: ['type'],
      raw: true,
    });

    // This would typically include order statistics from the Order service
    // For now, we'll return a mock response for orders
    return {
      interactions: {
        total: interactionsCount,
        byType: interactionsByType.reduce((acc, item) => {
          acc[item.type] = parseInt(item.count, 10);
          return acc;
        }, {}),
      },
      orders: {
        total: 5,
        totalAmount: 3500.75,
        averageAmount: 700.15,
        lastOrderDate: new Date(),
      },
    };
  }

  /**
   * Search customers
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Matching customers
   */
  async searchCustomers(query, options = {}) {
    const { limit = 10 } = options;

    if (!query || query.trim().length < 2) {
      throw new BadRequestError('Search query must be at least 2 characters long');
    }

    const customers = await this.Customer.findAll({
      where: {
        [Op.or]: [
          { first_name: { [Op.iLike]: `%${query}%` } },
          { last_name: { [Op.iLike]: `%${query}%` } },
          { email: { [Op.iLike]: `%${query}%` } },
          { phone: { [Op.iLike]: `%${query}%` } },
        ],
      },
      include: [
        {
          model: this.Contact,
          as: 'contacts',
          required: false,
          where: {
            is_primary: true,
          },
          limit: 1,
        },
      ],
      limit,
    });

    return customers;
  }

  /**
   * Get customer segments
   * @returns {Promise<Array>} Customer segments
   */
  async getCustomerSegments() {
    // Get customer counts by status
    const statusCounts = await this.Customer.findAll({
      attributes: [
        'status',
        [this.db.sequelize.fn('COUNT', this.db.sequelize.col('id')), 'count'],
      ],
      group: ['status'],
      raw: true,
    });

    // Get customer counts by type
    const typeCounts = await this.Customer.findAll({
      attributes: [
        'type',
        [this.db.sequelize.fn('COUNT', this.db.sequelize.col('id')), 'count'],
      ],
      group: ['type'],
      raw: true,
    });

    return {
      byStatus: statusCounts.reduce((acc, item) => {
        acc[item.status] = parseInt(item.count, 10);
        return acc;
      }, {}),
      byType: typeCounts.reduce((acc, item) => {
        acc[item.type] = parseInt(item.count, 10);
        return acc;
      }, {}),
    };
  }
}

module.exports = CustomerService;
