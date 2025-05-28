/**
 * KPI service for Analytics Service
 */

const { Op } = require('sequelize');
const { NotFoundError, BadRequestError } = require('../utils/errors');
const logger = require('../config/logger');
const config = require('../config');

/**
 * KPI service
 */
class KPIService {
  /**
   * Constructor
   * @param {Object} db - Database models
   * @param {Object} services - Services
   */
  constructor(db, services) {
    this.db = db;
    this.Metric = db.Metric;
    this.MetricData = db.MetricData;
    this.metricService = services.metricService;
    this.dataCollectorService = services.dataCollectorService;
  }

  /**
   * Get all KPIs with current values
   * @param {Object} options - Query options
   * @returns {Array} KPIs with values
   */
  async getAllKPIs(options = {}) {
    const {
      timeframe = config.kpi.defaultTimeframe,
      category,
      includeData = false,
    } = options;

    // Get all KPI metrics
    const where = {
      is_kpi: true,
      is_active: true,
    };

    if (category) {
      where.category = category;
    }

    const kpis = await this.Metric.findAll({
      where,
      order: [['display_name', 'ASC']],
    });

    // Get date range for the timeframe
    const { startDate, endDate } = this.getTimeframeDates(timeframe);

    // Calculate values for each KPI
    const kpiValues = await Promise.all(
      kpis.map(async (kpi) => {
        try {
          const value = await this.metricService.calculateMetricValue(kpi.id, {
            startDate,
            endDate,
            period: this.getPeriodForTimeframe(timeframe),
          });

          // Get historical data if requested
          let historicalData = null;
          if (includeData) {
            historicalData = await this.metricService.getMetricData(kpi.id, {
              startDate,
              endDate,
              period: this.getPeriodForTimeframe(timeframe),
              includeForecasts: false,
            });
          }

          // Get previous period value for comparison
          const previousPeriod = this.getPreviousPeriod(timeframe);
          const previousValue = await this.metricService.calculateMetricValue(kpi.id, {
            startDate: previousPeriod.startDate,
            endDate: previousPeriod.endDate,
            period: this.getPeriodForTimeframe(timeframe),
          });

          // Calculate change
          let change = null;
          let changePercentage = null;
          if (previousValue.value !== null && value.value !== null) {
            change = value.value - previousValue.value;
            changePercentage = previousValue.value !== 0
              ? (change / Math.abs(previousValue.value)) * 100
              : null;
          }

          return {
            ...kpi.get(),
            value: value.value,
            unit: kpi.unit,
            target_value: kpi.target_value,
            target_achievement: value.target_achievement,
            timeframe,
            period: value.period,
            start_date: startDate,
            end_date: endDate,
            data_points: value.data_points,
            previous_value: previousValue.value,
            change,
            change_percentage: changePercentage,
            trend: change !== null ? (change > 0 ? 'up' : (change < 0 ? 'down' : 'stable')) : null,
            historical_data: historicalData,
          };
        } catch (error) {
          logger.error(`Error calculating KPI value for ${kpi.name}`, {
            kpi_id: kpi.id,
            error: error.message,
          });

          return {
            ...kpi.get(),
            value: null,
            unit: kpi.unit,
            target_value: kpi.target_value,
            target_achievement: null,
            timeframe,
            period: this.getPeriodForTimeframe(timeframe),
            start_date: startDate,
            end_date: endDate,
            data_points: 0,
            previous_value: null,
            change: null,
            change_percentage: null,
            trend: null,
            error: error.message,
            historical_data: [],
          };
        }
      })
    );

    return kpiValues;
  }

  /**
   * Get KPI by ID with current value
   * @param {string} id - KPI ID
   * @param {Object} options - Query options
   * @returns {Object} KPI with value
   */
  async getKPIById(id, options = {}) {
    const {
      timeframe = config.kpi.defaultTimeframe,
      includeData = false,
    } = options;

    // Get KPI metric
    const kpi = await this.Metric.findByPk(id);

    if (!kpi) {
      throw new NotFoundError(`KPI with ID ${id} not found`);
    }

    if (!kpi.is_kpi) {
      throw new BadRequestError(`Metric with ID ${id} is not a KPI`);
    }

    // Get date range for the timeframe
    const { startDate, endDate } = this.getTimeframeDates(timeframe);

    // Calculate KPI value
    const value = await this.metricService.calculateMetricValue(id, {
      startDate,
      endDate,
      period: this.getPeriodForTimeframe(timeframe),
    });

    // Get historical data if requested
    let historicalData = null;
    if (includeData) {
      historicalData = await this.metricService.getMetricData(id, {
        startDate,
        endDate,
        period: this.getPeriodForTimeframe(timeframe),
        includeForecasts: false,
      });
    }

    // Get previous period value for comparison
    const previousPeriod = this.getPreviousPeriod(timeframe);
    const previousValue = await this.metricService.calculateMetricValue(id, {
      startDate: previousPeriod.startDate,
      endDate: previousPeriod.endDate,
      period: this.getPeriodForTimeframe(timeframe),
    });

    // Calculate change
    let change = null;
    let changePercentage = null;
    if (previousValue.value !== null && value.value !== null) {
      change = value.value - previousValue.value;
      changePercentage = previousValue.value !== 0
        ? (change / Math.abs(previousValue.value)) * 100
        : null;
    }

    return {
      ...kpi.get(),
      value: value.value,
      unit: kpi.unit,
      target_value: kpi.target_value,
      target_achievement: value.target_achievement,
      timeframe,
      period: value.period,
      start_date: startDate,
      end_date: endDate,
      data_points: value.data_points,
      previous_value: previousValue.value,
      change,
      change_percentage: changePercentage,
      trend: change !== null ? (change > 0 ? 'up' : (change < 0 ? 'down' : 'stable')) : null,
      historical_data: historicalData,
    };
  }

  /**
   * Create a new KPI
   * @param {Object} kpiData - KPI data
   * @returns {Object} Created KPI
   */
  async createKPI(kpiData) {
    // Ensure is_kpi is set to true
    const data = {
      ...kpiData,
      is_kpi: true,
    };

    // Create KPI
    return this.metricService.createMetric(data);
  }

  /**
   * Update KPI
   * @param {string} id - KPI ID
   * @param {Object} kpiData - KPI data
   * @returns {Object} Updated KPI
   */
  async updateKPI(id, kpiData) {
    // Get KPI
    const kpi = await this.Metric.findByPk(id);

    if (!kpi) {
      throw new NotFoundError(`KPI with ID ${id} not found`);
    }

    if (!kpi.is_kpi) {
      throw new BadRequestError(`Metric with ID ${id} is not a KPI`);
    }

    // Ensure is_kpi remains true
    const data = {
      ...kpiData,
      is_kpi: true,
    };

    // Update KPI
    return this.metricService.updateMetric(id, data);
  }

  /**
   * Delete KPI
   * @param {string} id - KPI ID
   * @returns {boolean} Success
   */
  async deleteKPI(id) {
    // Get KPI
    const kpi = await this.Metric.findByPk(id);

    if (!kpi) {
      throw new NotFoundError(`KPI with ID ${id} not found`);
    }

    if (!kpi.is_kpi) {
      throw new BadRequestError(`Metric with ID ${id} is not a KPI`);
    }

    // Delete KPI
    return this.metricService.deleteMetric(id);
  }

  /**
   * Get KPI categories
   * @returns {Array} Categories
   */
  async getKPICategories() {
    const categories = await this.Metric.findAll({
      attributes: ['category'],
      where: { is_kpi: true },
      group: ['category'],
      order: [['category', 'ASC']],
    });

    return categories.map(c => c.category);
  }

  /**
   * Update KPI target
   * @param {string} id - KPI ID
   * @param {Object} targetData - Target data
   * @returns {Object} Updated KPI
   */
  async updateKPITarget(id, targetData) {
    // Get KPI
    const kpi = await this.Metric.findByPk(id);

    if (!kpi) {
      throw new NotFoundError(`KPI with ID ${id} not found`);
    }

    if (!kpi.is_kpi) {
      throw new BadRequestError(`Metric with ID ${id} is not a KPI`);
    }

    // Update target
    await kpi.update({
      target_value: targetData.target_value,
      target_period: targetData.target_period,
    });

    return kpi;
  }

  /**
   * Get KPI scorecard
   * @param {Object} options - Query options
   * @returns {Object} KPI scorecard
   */
  async getKPIScorecard(options = {}) {
    const {
      timeframe = config.kpi.defaultTimeframe,
      category,
    } = options;

    // Get all KPIs
    const kpis = await this.getAllKPIs({
      timeframe,
      category,
      includeData: false,
    });

    // Group KPIs by category
    const categorizedKPIs = kpis.reduce((acc, kpi) => {
      if (!acc[kpi.category]) {
        acc[kpi.category] = [];
      }
      acc[kpi.category].push(kpi);
      return acc;
    }, {});

    // Calculate overall performance
    const kpisWithTargets = kpis.filter(kpi => 
      kpi.target_value !== null && 
      kpi.target_achievement !== null
    );

    const overallPerformance = kpisWithTargets.length > 0
      ? kpisWithTargets.reduce((sum, kpi) => sum + kpi.target_achievement, 0) / kpisWithTargets.length
      : null;

    // Calculate category performance
    const categoryPerformance = {};
    Object.keys(categorizedKPIs).forEach(category => {
      const categoryKPIs = categorizedKPIs[category].filter(kpi => 
        kpi.target_value !== null && 
        kpi.target_achievement !== null
      );

      categoryPerformance[category] = categoryKPIs.length > 0
        ? categoryKPIs.reduce((sum, kpi) => sum + kpi.target_achievement, 0) / categoryKPIs.length
        : null;
    });

    // Get date range for the timeframe
    const { startDate, endDate } = this.getTimeframeDates(timeframe);

    return {
      timeframe,
      start_date: startDate,
      end_date: endDate,
      overall_performance: overallPerformance,
      category_performance: categoryPerformance,
      categories: categorizedKPIs,
      kpi_count: kpis.length,
      kpis_on_target: kpis.filter(kpi => 
        kpi.target_value !== null && 
        kpi.target_achievement !== null && 
        kpi.target_achievement >= 100
      ).length,
      kpis_below_target: kpis.filter(kpi => 
        kpi.target_value !== null && 
        kpi.target_achievement !== null && 
        kpi.target_achievement < 100
      ).length,
      kpis_without_target: kpis.filter(kpi => 
        kpi.target_value === null || 
        kpi.target_achievement === null
      ).length,
    };
  }

  /**
   * Get KPI trends
   * @param {Object} options - Query options
   * @returns {Object} KPI trends
   */
  async getKPITrends(options = {}) {
    const {
      timeframe = config.kpi.defaultTimeframe,
      kpiIds,
      category,
    } = options;

    // Determine which KPIs to include
    let kpis;
    if (kpiIds && Array.isArray(kpiIds) && kpiIds.length > 0) {
      // Get specific KPIs
      kpis = await this.Metric.findAll({
        where: {
          id: { [Op.in]: kpiIds },
          is_kpi: true,
          is_active: true,
        },
      });
    } else {
      // Get all KPIs, optionally filtered by category
      const where = {
        is_kpi: true,
        is_active: true,
      };

      if (category) {
        where.category = category;
      }

      kpis = await this.Metric.findAll({ where });
    }

    if (kpis.length === 0) {
      return {
        timeframe,
        kpis: [],
      };
    }

    // Get date range for the timeframe
    const { startDate, endDate } = this.getTimeframeDates(timeframe);
    const period = this.getPeriodForTimeframe(timeframe);

    // Get historical data for each KPI
    const kpiTrends = await Promise.all(
      kpis.map(async (kpi) => {
        try {
          // Get historical data
          const historicalData = await this.metricService.getMetricData(kpi.id, {
            startDate,
            endDate,
            period,
            includeForecasts: false,
          });

          // Calculate current value
          const currentValue = await this.metricService.calculateMetricValue(kpi.id, {
            startDate,
            endDate,
            period,
          });

          // Get previous period value for comparison
          const previousPeriod = this.getPreviousPeriod(timeframe);
          const previousValue = await this.metricService.calculateMetricValue(kpi.id, {
            startDate: previousPeriod.startDate,
            endDate: previousPeriod.endDate,
            period,
          });

          // Calculate change
          let change = null;
          let changePercentage = null;
          if (previousValue.value !== null && currentValue.value !== null) {
            change = currentValue.value - previousValue.value;
            changePercentage = previousValue.value !== 0
              ? (change / Math.abs(previousValue.value)) * 100
              : null;
          }

          return {
            id: kpi.id,
            name: kpi.name,
            display_name: kpi.display_name,
            category: kpi.category,
            unit: kpi.unit,
            current_value: currentValue.value,
            target_value: kpi.target_value,
            target_achievement: currentValue.target_achievement,
            previous_value: previousValue.value,
            change,
            change_percentage: changePercentage,
            trend: change !== null ? (change > 0 ? 'up' : (change < 0 ? 'down' : 'stable')) : null,
            data: historicalData.map(d => ({
              date: d.date,
              value: d.value,
              period: d.period,
            })),
          };
        } catch (error) {
          logger.error(`Error getting KPI trend for ${kpi.name}`, {
            kpi_id: kpi.id,
            error: error.message,
          });

          return {
            id: kpi.id,
            name: kpi.name,
            display_name: kpi.display_name,
            category: kpi.category,
            unit: kpi.unit,
            current_value: null,
            target_value: kpi.target_value,
            target_achievement: null,
            previous_value: null,
            change: null,
            change_percentage: null,
            trend: null,
            data: [],
            error: error.message,
          };
        }
      })
    );

    return {
      timeframe,
      start_date: startDate,
      end_date: endDate,
      period,
      kpis: kpiTrends,
    };
  }

  /**
   * Refresh all KPI data
   * @returns {Object} Refresh results
   */
  async refreshAllKPIData() {
    logger.info('Starting KPI data refresh');

    // Get all KPI metrics
    const kpis = await this.Metric.findAll({
      where: {
        is_kpi: true,
        is_active: true,
      },
    });

    logger.info(`Found ${kpis.length} active KPIs to refresh`);

    // Collect data for each KPI
    const results = {
      total: kpis.length,
      success: 0,
      failed: 0,
      errors: [],
    };

    for (const kpi of kpis) {
      try {
        await this.dataCollectorService.collectMetricData(kpi.id);
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          kpi_id: kpi.id,
          kpi_name: kpi.name,
          error: error.message,
        });

        logger.error(`Error refreshing data for KPI ${kpi.name}`, {
          kpi_id: kpi.id,
          error: error.message,
        });
      }
    }

    logger.info('KPI data refresh completed', results);

    return results;
  }

  /**
   * Get timeframe dates
   * @param {string} timeframe - Timeframe
   * @returns {Object} Start and end dates
   * @private
   */
  getTimeframeDates(timeframe) {
    const now = new Date();
    const startDate = new Date(now);
    const endDate = new Date(now);

    switch (timeframe.toLowerCase()) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'yesterday':
        startDate.setDate(startDate.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        endDate.setDate(endDate.getDate() - 1);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'week':
        // Start from Monday of current week
        const day = startDate.getDay();
        const diff = startDate.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
        startDate.setDate(diff);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'month':
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'quarter':
        const quarter = Math.floor(startDate.getMonth() / 3);
        startDate.setMonth(quarter * 3);
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'year':
        startDate.setMonth(0);
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'last7days':
        startDate.setDate(startDate.getDate() - 6);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'last30days':
        startDate.setDate(startDate.getDate() - 29);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'last90days':
        startDate.setDate(startDate.getDate() - 89);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'last12months':
        startDate.setMonth(startDate.getMonth() - 11);
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      default:
        // Default to month
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };
  }

  /**
   * Get period for timeframe
   * @param {string} timeframe - Timeframe
   * @returns {string} Period
   * @private
   */
  getPeriodForTimeframe(timeframe) {
    switch (timeframe.toLowerCase()) {
      case 'today':
      case 'yesterday':
        return 'daily';
      case 'week':
      case 'last7days':
        return 'daily';
      case 'month':
      case 'last30days':
        return 'daily';
      case 'quarter':
      case 'last90days':
        return 'weekly';
      case 'year':
      case 'last12months':
        return 'monthly';
      default:
        return 'daily';
    }
  }

  /**
   * Get previous period
   * @param {string} timeframe - Timeframe
   * @returns {Object} Previous period dates
   * @private
   */
  getPreviousPeriod(timeframe) {
    const { startDate, endDate } = this.getTimeframeDates(timeframe);
    const start = new Date(startDate);
    const end = new Date(endDate);
    const duration = end - start;

    const previousStart = new Date(start);
    previousStart.setTime(previousStart.getTime() - duration - 86400000); // Subtract duration plus one day

    const previousEnd = new Date(previousStart);
    previousEnd.setTime(previousEnd.getTime() + duration);

    return {
      startDate: previousStart.toISOString().split('T')[0],
      endDate: previousEnd.toISOString().split('T')[0],
    };
  }
}

module.exports = KPIService;
