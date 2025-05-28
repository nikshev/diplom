/**
 * KPI controller for Analytics Service
 */

const { ValidationError } = require('../utils/errors');
const logger = require('../config/logger');

/**
 * KPI controller
 */
class KPIController {
  /**
   * Constructor
   * @param {Object} services - Services
   */
  constructor(services) {
    this.kpiService = services.kpiService;
  }

  /**
   * Get all KPIs
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next function
   */
  async getAllKPIs(req, res, next) {
    try {
      const options = {
        timeframe: req.query.timeframe,
        category: req.query.category,
        includeData: req.query.includeData === 'true',
      };

      const kpis = await this.kpiService.getAllKPIs(options);

      res.status(200).json(kpis);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get KPI by ID
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next function
   */
  async getKPIById(req, res, next) {
    try {
      const { id } = req.params;
      const options = {
        timeframe: req.query.timeframe,
        includeData: req.query.includeData === 'true',
      };

      const kpi = await this.kpiService.getKPIById(id, options);

      res.status(200).json(kpi);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create KPI
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next function
   */
  async createKPI(req, res, next) {
    try {
      const kpiData = req.body;
      
      // Add created_by if user is authenticated
      if (req.user) {
        kpiData.created_by = req.user.id;
      }

      const kpi = await this.kpiService.createKPI(kpiData);

      res.status(201).json(kpi);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update KPI
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next function
   */
  async updateKPI(req, res, next) {
    try {
      const { id } = req.params;
      const kpiData = req.body;
      
      // Add updated_by if user is authenticated
      if (req.user) {
        kpiData.updated_by = req.user.id;
      }

      const kpi = await this.kpiService.updateKPI(id, kpiData);

      res.status(200).json(kpi);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete KPI
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next function
   */
  async deleteKPI(req, res, next) {
    try {
      const { id } = req.params;
      await this.kpiService.deleteKPI(id);

      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get KPI categories
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next function
   */
  async getKPICategories(req, res, next) {
    try {
      const categories = await this.kpiService.getKPICategories();

      res.status(200).json(categories);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update KPI target
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next function
   */
  async updateKPITarget(req, res, next) {
    try {
      const { id } = req.params;
      const targetData = req.body;

      const kpi = await this.kpiService.updateKPITarget(id, targetData);

      res.status(200).json(kpi);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get KPI scorecard
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next function
   */
  async getKPIScorecard(req, res, next) {
    try {
      const options = {
        timeframe: req.query.timeframe,
        category: req.query.category,
      };

      const scorecard = await this.kpiService.getKPIScorecard(options);

      res.status(200).json(scorecard);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get KPI trends
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next function
   */
  async getKPITrends(req, res, next) {
    try {
      const options = {
        timeframe: req.query.timeframe,
        category: req.query.category,
      };

      // Parse kpiIds from query if provided
      if (req.query.kpiIds) {
        try {
          options.kpiIds = JSON.parse(req.query.kpiIds);
        } catch (e) {
          options.kpiIds = req.query.kpiIds.split(',');
        }
      }

      const trends = await this.kpiService.getKPITrends(options);

      res.status(200).json(trends);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refresh all KPI data
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next function
   */
  async refreshAllKPIData(req, res, next) {
    try {
      const results = await this.kpiService.refreshAllKPIData();

      res.status(200).json(results);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = KPIController;
