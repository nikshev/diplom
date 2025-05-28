/**
 * Dashboard controller for Analytics Service
 */

const { ValidationError } = require('../utils/errors');
const logger = require('../config/logger');

/**
 * Dashboard controller
 */
class DashboardController {
  /**
   * Constructor
   * @param {Object} services - Services
   */
  constructor(services) {
    this.dashboardService = services.dashboardService;
  }

  /**
   * Get dashboards
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next function
   */
  async getDashboards(req, res, next) {
    try {
      const options = {
        page: parseInt(req.query.page, 10) || 1,
        limit: parseInt(req.query.limit, 10) || 10,
        userId: req.query.userId || (req.user ? req.user.id : null),
        roleId: req.query.roleId,
        isPublic: req.query.isPublic,
        isDefault: req.query.isDefault,
        search: req.query.search,
        sortBy: req.query.sortBy || 'name',
        sortOrder: req.query.sortOrder || 'ASC',
      };

      const result = await this.dashboardService.getDashboards(options);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get dashboard by ID
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next function
   */
  async getDashboardById(req, res, next) {
    try {
      const { id } = req.params;
      const options = {
        includeWidgets: req.query.includeWidgets !== 'false',
        userId: req.user ? req.user.id : null,
      };

      const dashboard = await this.dashboardService.getDashboardById(id, options);

      res.status(200).json(dashboard);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create dashboard
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next function
   */
  async createDashboard(req, res, next) {
    try {
      const dashboardData = req.body;
      
      // Add created_by if user is authenticated
      if (req.user) {
        dashboardData.created_by = req.user.id;
        
        // If user_id is not provided, set it to the current user
        if (!dashboardData.user_id) {
          dashboardData.user_id = req.user.id;
        }
      }

      const dashboard = await this.dashboardService.createDashboard(dashboardData);

      res.status(201).json(dashboard);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update dashboard
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next function
   */
  async updateDashboard(req, res, next) {
    try {
      const { id } = req.params;
      const dashboardData = req.body;
      
      // Add updated_by if user is authenticated
      if (req.user) {
        dashboardData.updated_by = req.user.id;
      }

      const options = {
        userId: req.user ? req.user.id : null,
      };

      const dashboard = await this.dashboardService.updateDashboard(id, dashboardData, options);

      res.status(200).json(dashboard);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete dashboard
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next function
   */
  async deleteDashboard(req, res, next) {
    try {
      const { id } = req.params;
      const options = {
        userId: req.user ? req.user.id : null,
      };

      await this.dashboardService.deleteDashboard(id, options);

      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get dashboard widgets
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next function
   */
  async getDashboardWidgets(req, res, next) {
    try {
      const { id } = req.params;
      const widgets = await this.dashboardService.getDashboardWidgets(id);

      res.status(200).json(widgets);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Add widget to dashboard
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next function
   */
  async addDashboardWidget(req, res, next) {
    try {
      const { id } = req.params;
      const widgetData = req.body;
      
      // Add created_by if user is authenticated
      if (req.user) {
        widgetData.created_by = req.user.id;
      }

      const options = {
        userId: req.user ? req.user.id : null,
      };

      const widget = await this.dashboardService.addDashboardWidget(id, widgetData, options);

      res.status(201).json(widget);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update dashboard widget
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next function
   */
  async updateDashboardWidget(req, res, next) {
    try {
      const { id, widgetId } = req.params;
      const widgetData = req.body;
      
      // Add updated_by if user is authenticated
      if (req.user) {
        widgetData.updated_by = req.user.id;
      }

      const options = {
        userId: req.user ? req.user.id : null,
      };

      const widget = await this.dashboardService.updateDashboardWidget(id, widgetId, widgetData, options);

      res.status(200).json(widget);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete dashboard widget
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next function
   */
  async deleteDashboardWidget(req, res, next) {
    try {
      const { id, widgetId } = req.params;
      const options = {
        userId: req.user ? req.user.id : null,
      };

      await this.dashboardService.deleteDashboardWidget(id, widgetId, options);

      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get widget data
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next function
   */
  async getWidgetData(req, res, next) {
    try {
      const { id, widgetId } = req.params;
      const data = await this.dashboardService.getWidgetData(id, widgetId);

      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get default dashboard for user
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next function
   */
  async getDefaultDashboard(req, res, next) {
    try {
      const userId = req.user ? req.user.id : null;
      
      if (!userId) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const dashboard = await this.dashboardService.getDefaultDashboard(userId);

      res.status(200).json(dashboard);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = DashboardController;
