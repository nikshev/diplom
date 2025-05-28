/**
 * Interaction service for CRM Service
 */

const { Op } = require('sequelize');
const logger = require('../config/logger');
const config = require('../config');
const { NotFoundError, BadRequestError } = require('../utils/errors');

/**
 * Interaction service
 */
class InteractionService {
  /**
   * Constructor
   * @param {Object} db - Database models
   */
  constructor(db) {
    this.db = db;
    this.Interaction = db.Interaction;
    this.Customer = db.Customer;
  }

  /**
   * Get interactions by customer ID
   * @param {string} customerId - Customer ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Interactions with pagination
   */
  async getInteractionsByCustomerId(customerId, options = {}) {
    const {
      page = 1,
      limit = 10,
      type,
      startDate,
      endDate,
      sortBy = 'date',
      sortOrder = 'DESC',
    } = options;

    // Check if customer exists
    const customer = await this.Customer.findByPk(customerId);
    if (!customer) {
      throw new NotFoundError(`Customer with ID ${customerId} not found`);
    }

    const offset = (page - 1) * limit;
    const where = { customer_id: customerId };

    // Apply filters
    if (type) {
      where.type = type;
    }

    if (startDate && endDate) {
      where.date = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    } else if (startDate) {
      where.date = {
        [Op.gte]: new Date(startDate),
      };
    } else if (endDate) {
      where.date = {
        [Op.lte]: new Date(endDate),
      };
    }

    // Get interactions with pagination
    const { count, rows } = await this.Interaction.findAndCountAll({
      where,
      order: [[sortBy, sortOrder]],
      limit,
      offset,
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(count / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      interactions: rows,
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
   * Get interaction by ID
   * @param {string} id - Interaction ID
   * @returns {Promise<Object>} Interaction
   */
  async getInteractionById(id) {
    const interaction = await this.Interaction.findByPk(id, {
      include: [
        {
          model: this.Customer,
          as: 'customer',
        },
      ],
    });

    if (!interaction) {
      throw new NotFoundError(`Interaction with ID ${id} not found`);
    }

    return interaction;
  }

  /**
   * Create interaction
   * @param {Object} interactionData - Interaction data
   * @returns {Promise<Object>} Created interaction
   */
  async createInteraction(interactionData) {
    const { customer_id, type } = interactionData;

    // Check if customer exists
    const customer = await this.Customer.findByPk(customer_id);
    if (!customer) {
      throw new NotFoundError(`Customer with ID ${customer_id} not found`);
    }

    // Validate interaction type
    if (!Object.values(config.interactionTypes).includes(type)) {
      throw new BadRequestError(`Invalid interaction type: ${type}`);
    }

    // Create interaction
    const interaction = await this.Interaction.create(interactionData);

    // Return interaction with customer
    return this.getInteractionById(interaction.id);
  }

  /**
   * Update interaction
   * @param {string} id - Interaction ID
   * @param {Object} interactionData - Interaction data
   * @returns {Promise<Object>} Updated interaction
   */
  async updateInteraction(id, interactionData) {
    const interaction = await this.getInteractionById(id);
    const { type } = interactionData;

    // Validate interaction type if provided
    if (type && !Object.values(config.interactionTypes).includes(type)) {
      throw new BadRequestError(`Invalid interaction type: ${type}`);
    }

    // Update interaction
    await interaction.update(interactionData);

    // Return updated interaction
    return this.getInteractionById(id);
  }

  /**
   * Delete interaction
   * @param {string} id - Interaction ID
   * @returns {Promise<boolean>} Success
   */
  async deleteInteraction(id) {
    const interaction = await this.getInteractionById(id);

    // Delete interaction
    await interaction.destroy();

    return true;
  }

  /**
   * Get interactions by date range
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Interactions with pagination
   */
  async getInteractionsByDateRange(options = {}) {
    const {
      page = 1,
      limit = 10,
      startDate,
      endDate,
      type,
      userId,
      sortBy = 'date',
      sortOrder = 'DESC',
    } = options;

    const offset = (page - 1) * limit;
    const where = {};

    // Apply filters
    if (type) {
      where.type = type;
    }

    if (userId) {
      where.user_id = userId;
    }

    if (startDate && endDate) {
      where.date = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    } else if (startDate) {
      where.date = {
        [Op.gte]: new Date(startDate),
      };
    } else if (endDate) {
      where.date = {
        [Op.lte]: new Date(endDate),
      };
    }

    // Get interactions with pagination
    const { count, rows } = await this.Interaction.findAndCountAll({
      where,
      include: [
        {
          model: this.Customer,
          as: 'customer',
        },
      ],
      order: [[sortBy, sortOrder]],
      limit,
      offset,
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(count / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      interactions: rows,
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
   * Get interaction statistics
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Interaction statistics
   */
  async getInteractionStatistics(options = {}) {
    const { startDate, endDate, userId } = options;
    const where = {};

    // Apply filters
    if (userId) {
      where.user_id = userId;
    }

    if (startDate && endDate) {
      where.date = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    } else if (startDate) {
      where.date = {
        [Op.gte]: new Date(startDate),
      };
    } else if (endDate) {
      where.date = {
        [Op.lte]: new Date(endDate),
      };
    }

    // Count interactions by type
    const interactionsByType = await this.Interaction.findAll({
      attributes: [
        'type',
        [this.db.sequelize.fn('COUNT', this.db.sequelize.col('id')), 'count'],
      ],
      where,
      group: ['type'],
      raw: true,
    });

    // Count interactions by date
    const interactionsByDate = await this.Interaction.findAll({
      attributes: [
        [this.db.sequelize.fn('DATE', this.db.sequelize.col('date')), 'date'],
        [this.db.sequelize.fn('COUNT', this.db.sequelize.col('id')), 'count'],
      ],
      where,
      group: [this.db.sequelize.fn('DATE', this.db.sequelize.col('date'))],
      order: [[this.db.sequelize.fn('DATE', this.db.sequelize.col('date')), 'ASC']],
      raw: true,
    });

    // Count interactions by user
    const interactionsByUser = await this.Interaction.findAll({
      attributes: [
        'user_id',
        [this.db.sequelize.fn('COUNT', this.db.sequelize.col('id')), 'count'],
      ],
      where,
      group: ['user_id'],
      raw: true,
    });

    return {
      total: interactionsByType.reduce((sum, item) => sum + parseInt(item.count, 10), 0),
      byType: interactionsByType.reduce((acc, item) => {
        acc[item.type] = parseInt(item.count, 10);
        return acc;
      }, {}),
      byDate: interactionsByDate.reduce((acc, item) => {
        acc[item.date] = parseInt(item.count, 10);
        return acc;
      }, {}),
      byUser: interactionsByUser.reduce((acc, item) => {
        acc[item.user_id] = parseInt(item.count, 10);
        return acc;
      }, {}),
    };
  }

  /**
   * Search interactions
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Matching interactions
   */
  async searchInteractions(query, options = {}) {
    const { limit = 10, customerId } = options;

    if (!query || query.trim().length < 2) {
      throw new BadRequestError('Search query must be at least 2 characters long');
    }

    const where = {
      [Op.or]: [
        { subject: { [Op.iLike]: `%${query}%` } },
        { description: { [Op.iLike]: `%${query}%` } },
      ],
    };

    // Filter by customer ID if provided
    if (customerId) {
      where.customer_id = customerId;
    }

    const interactions = await this.Interaction.findAll({
      where,
      include: [
        {
          model: this.Customer,
          as: 'customer',
        },
      ],
      limit,
    });

    return interactions;
  }
}

module.exports = InteractionService;
