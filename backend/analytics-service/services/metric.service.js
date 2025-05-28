/**
 * Metric service for Analytics Service
 */

const { Op } = require('sequelize');
const { NotFoundError, BadRequestError } = require('../utils/errors');
const logger = require('../config/logger');

/**
 * Metric service
 */
class MetricService {
  /**
   * Constructor
   * @param {Object} db - Database models
   */
  constructor(db) {
    this.db = db;
    this.Metric = db.Metric;
    this.MetricData = db.MetricData;
  }

  /**
   * Get metrics with pagination and filtering
   * @param {Object} options - Query options
   * @returns {Object} Metrics with pagination
   */
  async getMetrics(options) {
    const {
      page = 1,
      limit = 10,
      category,
      dataSource,
      isKpi,
      isActive,
      search,
      sortBy = 'name',
      sortOrder = 'ASC',
    } = options;

    const offset = (page - 1) * limit;
    const where = {};

    // Apply filters
    if (category) {
      where.category = category;
    }

    if (dataSource) {
      where.data_source = dataSource;
    }

    if (isKpi !== undefined) {
      where.is_kpi = isKpi === 'true' || isKpi === true;
    }

    if (isActive !== undefined) {
      where.is_active = isActive === 'true' || isActive === true;
    }

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { display_name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    // Get metrics
    const { count, rows } = await this.Metric.findAndCountAll({
      where,
      order: [[sortBy, sortOrder]],
      limit,
      offset,
    });

    return {
      metrics: rows,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit),
      },
    };
  }

  /**
   * Get metric by ID
   * @param {string} id - Metric ID
   * @returns {Object} Metric
   */
  async getMetricById(id) {
    const metric = await this.Metric.findByPk(id);

    if (!metric) {
      throw new NotFoundError(`Metric with ID ${id} not found`);
    }

    return metric;
  }

  /**
   * Create metric
   * @param {Object} metricData - Metric data
   * @returns {Object} Created metric
   */
  async createMetric(metricData) {
    // Check if metric with the same name already exists
    const existingMetric = await this.Metric.findOne({
      where: { name: metricData.name },
    });

    if (existingMetric) {
      throw new BadRequestError(`Metric with name ${metricData.name} already exists`);
    }

    // Create metric
    const metric = await this.Metric.create(metricData);

    return metric;
  }

  /**
   * Update metric
   * @param {string} id - Metric ID
   * @param {Object} metricData - Metric data
   * @returns {Object} Updated metric
   */
  async updateMetric(id, metricData) {
    const metric = await this.getMetricById(id);

    // Check if metric with the same name already exists
    if (metricData.name && metricData.name !== metric.name) {
      const existingMetric = await this.Metric.findOne({
        where: { name: metricData.name },
      });

      if (existingMetric) {
        throw new BadRequestError(`Metric with name ${metricData.name} already exists`);
      }
    }

    // Update metric
    await metric.update(metricData);

    return metric;
  }

  /**
   * Delete metric
   * @param {string} id - Metric ID
   * @returns {boolean} Success
   */
  async deleteMetric(id) {
    const metric = await this.getMetricById(id);

    // Check if metric has data
    const metricDataCount = await this.MetricData.count({
      where: { metric_id: id },
    });

    if (metricDataCount > 0) {
      throw new BadRequestError(`Cannot delete metric with ID ${id} because it has associated data`);
    }

    // Delete metric
    await metric.destroy();

    return true;
  }

  /**
   * Get metric data
   * @param {string} id - Metric ID
   * @param {Object} options - Query options
   * @returns {Object} Metric data
   */
  async getMetricData(id, options) {
    const {
      startDate,
      endDate,
      period = 'daily',
      limit = 100,
      includeForecasts = false,
    } = options;

    // Validate metric
    await this.getMetricById(id);

    // Build query
    const where = {
      metric_id: id,
      period,
    };

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

    if (!includeForecasts) {
      where.is_forecasted = false;
    }

    // Get metric data
    const data = await this.MetricData.findAll({
      where,
      order: [['date', 'ASC']],
      limit,
    });

    return data;
  }

  /**
   * Add metric data
   * @param {string} id - Metric ID
   * @param {Object} dataPoint - Data point
   * @returns {Object} Created data point
   */
  async addMetricData(id, dataPoint) {
    // Validate metric
    const metric = await this.getMetricById(id);

    // Check if data point already exists
    const existingDataPoint = await this.MetricData.findOne({
      where: {
        metric_id: id,
        date: dataPoint.date,
        period: dataPoint.period,
      },
    });

    if (existingDataPoint) {
      throw new BadRequestError(`Data point for metric ${metric.name} on ${dataPoint.date} already exists`);
    }

    // Create data point
    const createdDataPoint = await this.MetricData.create({
      ...dataPoint,
      metric_id: id,
    });

    return createdDataPoint;
  }

  /**
   * Update metric data
   * @param {string} id - Metric ID
   * @param {string} dataId - Data point ID
   * @param {Object} dataPoint - Data point
   * @returns {Object} Updated data point
   */
  async updateMetricData(id, dataId, dataPoint) {
    // Validate metric
    await this.getMetricById(id);

    // Get data point
    const existingDataPoint = await this.MetricData.findOne({
      where: {
        id: dataId,
        metric_id: id,
      },
    });

    if (!existingDataPoint) {
      throw new NotFoundError(`Data point with ID ${dataId} not found for metric ${id}`);
    }

    // Update data point
    await existingDataPoint.update(dataPoint);

    return existingDataPoint;
  }

  /**
   * Delete metric data
   * @param {string} id - Metric ID
   * @param {string} dataId - Data point ID
   * @returns {boolean} Success
   */
  async deleteMetricData(id, dataId) {
    // Validate metric
    await this.getMetricById(id);

    // Get data point
    const dataPoint = await this.MetricData.findOne({
      where: {
        id: dataId,
        metric_id: id,
      },
    });

    if (!dataPoint) {
      throw new NotFoundError(`Data point with ID ${dataId} not found for metric ${id}`);
    }

    // Delete data point
    await dataPoint.destroy();

    return true;
  }

  /**
   * Get KPIs
   * @param {Object} options - Query options
   * @returns {Object} KPIs
   */
  async getKPIs(options) {
    return this.getMetrics({
      ...options,
      isKpi: true,
    });
  }

  /**
   * Get metric categories
   * @returns {Array} Categories
   */
  async getMetricCategories() {
    const categories = await this.Metric.findAll({
      attributes: ['category'],
      group: ['category'],
      order: [['category', 'ASC']],
    });

    return categories.map(c => c.category);
  }

  /**
   * Get metric data sources
   * @returns {Array} Data sources
   */
  async getMetricDataSources() {
    const dataSources = await this.Metric.findAll({
      attributes: ['data_source'],
      group: ['data_source'],
      order: [['data_source', 'ASC']],
    });

    return dataSources.map(ds => ds.data_source);
  }

  /**
   * Calculate metric value
   * @param {string} id - Metric ID
   * @param {Object} options - Calculation options
   * @returns {Object} Calculated value
   */
  async calculateMetricValue(id, options) {
    const {
      startDate,
      endDate,
      period = 'daily',
    } = options;

    // Validate metric
    const metric = await this.getMetricById(id);

    // Get metric data
    const data = await this.getMetricData(id, {
      startDate,
      endDate,
      period,
      includeForecasts: false,
    });

    if (data.length === 0) {
      return {
        metric_id: id,
        metric_name: metric.name,
        display_name: metric.display_name,
        value: null,
        period,
        start_date: startDate,
        end_date: endDate,
        unit: metric.unit,
        data_points: 0,
      };
    }

    // Calculate value based on calculation method
    let value = null;
    const values = data.map(d => d.value);

    switch (metric.calculation_method) {
      case 'sum':
        value = values.reduce((sum, val) => sum + val, 0);
        break;
      case 'average':
        value = values.reduce((sum, val) => sum + val, 0) / values.length;
        break;
      case 'count':
        value = values.length;
        break;
      case 'min':
        value = Math.min(...values);
        break;
      case 'max':
        value = Math.max(...values);
        break;
      case 'last':
        value = values[values.length - 1];
        break;
      case 'first':
        value = values[0];
        break;
      default:
        value = values.reduce((sum, val) => sum + val, 0);
    }

    // Calculate target achievement if this is a KPI
    let targetAchievement = null;
    if (metric.is_kpi && metric.target_value) {
      targetAchievement = (value / metric.target_value) * 100;
    }

    return {
      metric_id: id,
      metric_name: metric.name,
      display_name: metric.display_name,
      value,
      period,
      start_date: startDate,
      end_date: endDate,
      unit: metric.unit,
      data_points: data.length,
      target_value: metric.target_value,
      target_achievement: targetAchievement,
    };
  }
}

module.exports = MetricService;
