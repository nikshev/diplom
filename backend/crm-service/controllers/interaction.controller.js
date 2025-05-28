/**
 * Interaction controller for CRM Service
 */

const { StatusCodes } = require('http-status-codes');
const logger = require('../config/logger');

/**
 * Interaction controller
 */
class InteractionController {
  /**
   * Constructor
   * @param {Object} interactionService - Interaction service
   */
  constructor(interactionService) {
    this.interactionService = interactionService;
    
    // Bind methods to this instance
    this.getInteractionsByCustomerId = this.getInteractionsByCustomerId.bind(this);
    this.getInteractionById = this.getInteractionById.bind(this);
    this.createInteraction = this.createInteraction.bind(this);
    this.updateInteraction = this.updateInteraction.bind(this);
    this.deleteInteraction = this.deleteInteraction.bind(this);
    this.getInteractionsByDateRange = this.getInteractionsByDateRange.bind(this);
    this.getInteractionStatistics = this.getInteractionStatistics.bind(this);
    this.searchInteractions = this.searchInteractions.bind(this);
  }

  /**
   * Get interactions by customer ID
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async getInteractionsByCustomerId(req, res, next) {
    try {
      const { customerId } = req.params;
      const options = {
        page: parseInt(req.query.page, 10) || 1,
        limit: parseInt(req.query.limit, 10) || 10,
        type: req.query.type,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        sortBy: req.query.sortBy || 'date',
        sortOrder: req.query.sortOrder || 'DESC',
      };

      const result = await this.interactionService.getInteractionsByCustomerId(customerId, options);

      res.status(StatusCodes.OK).json(result);
    } catch (error) {
      logger.error(`Error in getInteractionsByCustomerId controller for customer ID ${req.params.customerId}:`, error);
      next(error);
    }
  }

  /**
   * Get interaction by ID
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async getInteractionById(req, res, next) {
    try {
      const { id } = req.params;
      const interaction = await this.interactionService.getInteractionById(id);

      res.status(StatusCodes.OK).json(interaction);
    } catch (error) {
      logger.error(`Error in getInteractionById controller for ID ${req.params.id}:`, error);
      next(error);
    }
  }

  /**
   * Create interaction
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async createInteraction(req, res, next) {
    try {
      const interactionData = {
        ...req.body,
        user_id: req.user.id, // Assuming user ID is available from auth middleware
      };
      
      const interaction = await this.interactionService.createInteraction(interactionData);

      res.status(StatusCodes.CREATED).json(interaction);
    } catch (error) {
      logger.error('Error in createInteraction controller:', error);
      next(error);
    }
  }

  /**
   * Update interaction
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async updateInteraction(req, res, next) {
    try {
      const { id } = req.params;
      const interactionData = req.body;
      const interaction = await this.interactionService.updateInteraction(id, interactionData);

      res.status(StatusCodes.OK).json(interaction);
    } catch (error) {
      logger.error(`Error in updateInteraction controller for ID ${req.params.id}:`, error);
      next(error);
    }
  }

  /**
   * Delete interaction
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async deleteInteraction(req, res, next) {
    try {
      const { id } = req.params;
      await this.interactionService.deleteInteraction(id);

      res.status(StatusCodes.NO_CONTENT).send();
    } catch (error) {
      logger.error(`Error in deleteInteraction controller for ID ${req.params.id}:`, error);
      next(error);
    }
  }

  /**
   * Get interactions by date range
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async getInteractionsByDateRange(req, res, next) {
    try {
      const options = {
        page: parseInt(req.query.page, 10) || 1,
        limit: parseInt(req.query.limit, 10) || 10,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        type: req.query.type,
        userId: req.query.userId,
        sortBy: req.query.sortBy || 'date',
        sortOrder: req.query.sortOrder || 'DESC',
      };

      const result = await this.interactionService.getInteractionsByDateRange(options);

      res.status(StatusCodes.OK).json(result);
    } catch (error) {
      logger.error('Error in getInteractionsByDateRange controller:', error);
      next(error);
    }
  }

  /**
   * Get interaction statistics
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async getInteractionStatistics(req, res, next) {
    try {
      const options = {
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        userId: req.query.userId,
      };

      const statistics = await this.interactionService.getInteractionStatistics(options);

      res.status(StatusCodes.OK).json(statistics);
    } catch (error) {
      logger.error('Error in getInteractionStatistics controller:', error);
      next(error);
    }
  }

  /**
   * Search interactions
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async searchInteractions(req, res, next) {
    try {
      const { query, customerId } = req.query;
      const options = {
        limit: parseInt(req.query.limit, 10) || 10,
        customerId,
      };

      const interactions = await this.interactionService.searchInteractions(query, options);

      res.status(StatusCodes.OK).json(interactions);
    } catch (error) {
      logger.error('Error in searchInteractions controller:', error);
      next(error);
    }
  }
}

module.exports = InteractionController;
