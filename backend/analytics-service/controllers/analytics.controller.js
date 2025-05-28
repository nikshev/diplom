/**
 * Analytics controller for Analytics Service
 */

const { ValidationError } = require('../utils/errors');
const logger = require('../config/logger');

/**
 * Analytics controller
 */
class AnalyticsController {
  /**
   * Constructor
   * @param {Object} services - Services
   */
  constructor(services) {
    this.analyticsService = services.analyticsService;
    this.dataCollectorService = services.dataCollectorService;
  }

  /**
   * Get business overview
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next function
   */
  async getBusinessOverview(req, res, next) {
    try {
      const options = {
        timeframe: req.query.timeframe,
      };

      const overview = await this.analyticsService.getBusinessOverview(options);

      res.status(200).json(overview);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get sales analytics
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next function
   */
  async getSalesAnalytics(req, res, next) {
    try {
      const options = {
        timeframe: req.query.timeframe,
        includeProducts: req.query.includeProducts === 'true',
        includeCategories: req.query.includeCategories === 'true',
        includeCustomers: req.query.includeCustomers === 'true',
      };

      const analytics = await this.analyticsService.getSalesAnalytics(options);

      res.status(200).json(analytics);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get financial analytics
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next function
   */
  async getFinancialAnalytics(req, res, next) {
    try {
      const options = {
        timeframe: req.query.timeframe,
        includeCategories: req.query.includeCategories === 'true',
        includeAccounts: req.query.includeAccounts === 'true',
      };

      const analytics = await this.analyticsService.getFinancialAnalytics(options);

      res.status(200).json(analytics);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get inventory analytics
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next function
   */
  async getInventoryAnalytics(req, res, next) {
    try {
      const options = {
        timeframe: req.query.timeframe,
        includeCategories: req.query.includeCategories === 'true',
        includeLowStock: req.query.includeLowStock === 'true',
      };

      const analytics = await this.analyticsService.getInventoryAnalytics(options);

      res.status(200).json(analytics);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get customer analytics
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next function
   */
  async getCustomerAnalytics(req, res, next) {
    try {
      const options = {
        timeframe: req.query.timeframe,
        includeSegments: req.query.includeSegments === 'true',
        includeRetention: req.query.includeRetention === 'true',
      };

      const analytics = await this.analyticsService.getCustomerAnalytics(options);

      res.status(200).json(analytics);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Collect all metrics data
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next function
   */
  async collectAllMetrics(req, res, next) {
    try {
      const results = await this.dataCollectorService.collectAllMetrics();

      res.status(200).json(results);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Collect metric data
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next function
   */
  async collectMetricData(req, res, next) {
    try {
      const { id } = req.params;
      const dataPoint = await this.dataCollectorService.collectMetricData(id);

      res.status(200).json(dataPoint);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Clean up old data
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next function
   */
  async cleanupOldData(req, res, next) {
    try {
      const results = await this.dataCollectorService.cleanupOldData();

      res.status(200).json(results);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AnalyticsController;
