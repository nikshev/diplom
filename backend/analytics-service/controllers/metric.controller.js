/**
 * Metric controller for Analytics Service
 */

const { ValidationError } = require('../utils/errors');
const logger = require('../config/logger');

/**
 * Metric controller
 */
class MetricController {
  /**
   * Constructor
   * @param {Object} services - Services
   */
  constructor(services) {
    this.metricService = services.metricService;
  }

  /**
   * Get metrics
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next function
   */
  async getMetrics(req, res, next) {
    try {
      const options = {
        page: parseInt(req.query.page, 10) || 1,
        limit: parseInt(req.query.limit, 10) || 10,
        category: req.query.category,
        dataSource: req.query.dataSource,
        isKpi: req.query.isKpi,
        isActive: req.query.isActive,
        search: req.query.search,
        sortBy: req.query.sortBy || 'name',
        sortOrder: req.query.sortOrder || 'ASC',
      };

      const result = await this.metricService.getMetrics(options);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get metric by ID
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next function
   */
  async getMetricById(req, res, next) {
    try {
      const { id } = req.params;
      const metric = await this.metricService.getMetricById(id);

      res.status(200).json(metric);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create metric
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next function
   */
  async createMetric(req, res, next) {
    try {
      const metricData = req.body;
      
      // Add created_by if user is authenticated
      if (req.user) {
        metricData.created_by = req.user.id;
      }

      const metric = await this.metricService.createMetric(metricData);

      res.status(201).json(metric);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update metric
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next function
   */
  async updateMetric(req, res, next) {
    try {
      const { id } = req.params;
      const metricData = req.body;
      
      // Add updated_by if user is authenticated
      if (req.user) {
        metricData.updated_by = req.user.id;
      }

      const metric = await this.metricService.updateMetric(id, metricData);

      res.status(200).json(metric);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete metric
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next function
   */
  async deleteMetric(req, res, next) {
    try {
      const { id } = req.params;
      await this.metricService.deleteMetric(id);

      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get metric data
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next function
   */
  async getMetricData(req, res, next) {
    try {
      const { id } = req.params;
      const options = {
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        period: req.query.period,
        limit: parseInt(req.query.limit, 10) || 100,
        includeForecasts: req.query.includeForecasts === 'true',
      };

      const data = await this.metricService.getMetricData(id, options);

      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Add metric data
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next function
   */
  async addMetricData(req, res, next) {
    try {
      const { id } = req.params;
      const dataPoint = req.body;
      
      // Add created_by if user is authenticated
      if (req.user) {
        dataPoint.created_by = req.user.id;
      }

      const result = await this.metricService.addMetricData(id, dataPoint);

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update metric data
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next function
   */
  async updateMetricData(req, res, next) {
    try {
      const { id, dataId } = req.params;
      const dataPoint = req.body;

      const result = await this.metricService.updateMetricData(id, dataId, dataPoint);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete metric data
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next function
   */
  async deleteMetricData(req, res, next) {
    try {
      const { id, dataId } = req.params;
      await this.metricService.deleteMetricData(id, dataId);

      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }

  /**
   * Calculate metric value
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next function
   */
  async calculateMetricValue(req, res, next) {
    try {
      const { id } = req.params;
      const options = {
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        period: req.query.period || 'daily',
      };

      const result = await this.metricService.calculateMetricValue(id, options);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get metric categories
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next function
   */
  async getMetricCategories(req, res, next) {
    try {
      const categories = await this.metricService.getMetricCategories();

      res.status(200).json(categories);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get metric data sources
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next function
   */
  async getMetricDataSources(req, res, next) {
    try {
      const dataSources = await this.metricService.getMetricDataSources();

      res.status(200).json(dataSources);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = MetricController;
