/**
 * Dashboard service for Analytics Service
 */

const { Op } = require('sequelize');
const { NotFoundError, BadRequestError, ForbiddenError } = require('../utils/errors');
const logger = require('../config/logger');

/**
 * Dashboard service
 */
class DashboardService {
  /**
   * Constructor
   * @param {Object} db - Database models
   * @param {Object} services - Services
   */
  constructor(db, services) {
    this.db = db;
    this.Dashboard = db.Dashboard;
    this.DashboardWidget = db.DashboardWidget;
    this.metricService = services.metricService;
  }

  /**
   * Get dashboards with pagination and filtering
   * @param {Object} options - Query options
   * @returns {Object} Dashboards with pagination
   */
  async getDashboards(options) {
    const {
      page = 1,
      limit = 10,
      userId,
      roleId,
      isPublic,
      isDefault,
      search,
      sortBy = 'name',
      sortOrder = 'ASC',
    } = options;

    const offset = (page - 1) * limit;
    const where = {};

    // Apply filters
    if (userId) {
      where.user_id = userId;
    }

    if (roleId) {
      where.role_id = roleId;
    }

    if (isPublic !== undefined) {
      where.is_public = isPublic === 'true' || isPublic === true;
    }

    if (isDefault !== undefined) {
      where.is_default = isDefault === 'true' || isDefault === true;
    }

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    // Get dashboards
    const { count, rows } = await this.Dashboard.findAndCountAll({
      where,
      order: [[sortBy, sortOrder]],
      limit,
      offset,
    });

    return {
      dashboards: rows,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit),
      },
    };
  }

  /**
   * Get dashboard by ID
   * @param {string} id - Dashboard ID
   * @param {Object} options - Query options
   * @returns {Object} Dashboard
   */
  async getDashboardById(id, options = {}) {
    const { includeWidgets = true, userId } = options;

    const include = [];

    if (includeWidgets) {
      include.push({
        model: this.DashboardWidget,
        as: 'widgets',
        order: [['position', 'ASC']],
      });
    }

    const dashboard = await this.Dashboard.findByPk(id, {
      include,
    });

    if (!dashboard) {
      throw new NotFoundError(`Dashboard with ID ${id} not found`);
    }

    // Check access
    if (!dashboard.is_public && dashboard.user_id && dashboard.user_id !== userId) {
      throw new ForbiddenError('You do not have access to this dashboard');
    }

    return dashboard;
  }

  /**
   * Create dashboard
   * @param {Object} dashboardData - Dashboard data
   * @returns {Object} Created dashboard
   */
  async createDashboard(dashboardData) {
    // Start transaction
    const t = await this.db.sequelize.transaction();

    try {
      // Create dashboard
      const dashboard = await this.Dashboard.create(dashboardData, { transaction: t });

      // Create widgets if provided
      if (dashboardData.widgets && Array.isArray(dashboardData.widgets)) {
        await Promise.all(
          dashboardData.widgets.map((widget, index) =>
            this.DashboardWidget.create({
              ...widget,
              dashboard_id: dashboard.id,
              position: widget.position || index,
            }, { transaction: t })
          )
        );
      }

      // Commit transaction
      await t.commit();

      // Return dashboard with widgets
      return this.getDashboardById(dashboard.id);
    } catch (error) {
      // Rollback transaction
      await t.rollback();
      throw error;
    }
  }

  /**
   * Update dashboard
   * @param {string} id - Dashboard ID
   * @param {Object} dashboardData - Dashboard data
   * @param {Object} options - Update options
   * @returns {Object} Updated dashboard
   */
  async updateDashboard(id, dashboardData, options = {}) {
    const { userId } = options;

    // Get dashboard
    const dashboard = await this.getDashboardById(id, { includeWidgets: false });

    // Check ownership
    if (dashboard.user_id && dashboard.user_id !== userId) {
      throw new ForbiddenError('You do not have permission to update this dashboard');
    }

    // Start transaction
    const t = await this.db.sequelize.transaction();

    try {
      // Update dashboard
      await dashboard.update(dashboardData, { transaction: t });

      // Update widgets if provided
      if (dashboardData.widgets && Array.isArray(dashboardData.widgets)) {
        // Delete existing widgets
        await this.DashboardWidget.destroy({
          where: { dashboard_id: id },
          transaction: t,
        });

        // Create new widgets
        await Promise.all(
          dashboardData.widgets.map((widget, index) =>
            this.DashboardWidget.create({
              ...widget,
              dashboard_id: id,
              position: widget.position || index,
            }, { transaction: t })
          )
        );
      }

      // Commit transaction
      await t.commit();

      // Return updated dashboard
      return this.getDashboardById(id);
    } catch (error) {
      // Rollback transaction
      await t.rollback();
      throw error;
    }
  }

  /**
   * Delete dashboard
   * @param {string} id - Dashboard ID
   * @param {Object} options - Delete options
   * @returns {boolean} Success
   */
  async deleteDashboard(id, options = {}) {
    const { userId } = options;

    // Get dashboard
    const dashboard = await this.getDashboardById(id, { includeWidgets: false });

    // Check ownership
    if (dashboard.user_id && dashboard.user_id !== userId) {
      throw new ForbiddenError('You do not have permission to delete this dashboard');
    }

    // Start transaction
    const t = await this.db.sequelize.transaction();

    try {
      // Delete widgets
      await this.DashboardWidget.destroy({
        where: { dashboard_id: id },
        transaction: t,
      });

      // Delete dashboard
      await dashboard.destroy({ transaction: t });

      // Commit transaction
      await t.commit();

      return true;
    } catch (error) {
      // Rollback transaction
      await t.rollback();
      throw error;
    }
  }

  /**
   * Get dashboard widgets
   * @param {string} id - Dashboard ID
   * @returns {Array} Widgets
   */
  async getDashboardWidgets(id) {
    // Validate dashboard
    await this.getDashboardById(id, { includeWidgets: false });

    // Get widgets
    const widgets = await this.DashboardWidget.findAll({
      where: { dashboard_id: id },
      order: [['position', 'ASC']],
    });

    return widgets;
  }

  /**
   * Add widget to dashboard
   * @param {string} id - Dashboard ID
   * @param {Object} widgetData - Widget data
   * @param {Object} options - Add options
   * @returns {Object} Created widget
   */
  async addDashboardWidget(id, widgetData, options = {}) {
    const { userId } = options;

    // Validate dashboard
    const dashboard = await this.getDashboardById(id, { includeWidgets: false });

    // Check ownership
    if (dashboard.user_id && dashboard.user_id !== userId) {
      throw new ForbiddenError('You do not have permission to modify this dashboard');
    }

    // Get current max position
    const maxPositionWidget = await this.DashboardWidget.findOne({
      where: { dashboard_id: id },
      order: [['position', 'DESC']],
    });

    const position = maxPositionWidget ? maxPositionWidget.position + 1 : 0;

    // Create widget
    const widget = await this.DashboardWidget.create({
      ...widgetData,
      dashboard_id: id,
      position: widgetData.position || position,
    });

    return widget;
  }

  /**
   * Update dashboard widget
   * @param {string} id - Dashboard ID
   * @param {string} widgetId - Widget ID
   * @param {Object} widgetData - Widget data
   * @param {Object} options - Update options
   * @returns {Object} Updated widget
   */
  async updateDashboardWidget(id, widgetId, widgetData, options = {}) {
    const { userId } = options;

    // Validate dashboard
    const dashboard = await this.getDashboardById(id, { includeWidgets: false });

    // Check ownership
    if (dashboard.user_id && dashboard.user_id !== userId) {
      throw new ForbiddenError('You do not have permission to modify this dashboard');
    }

    // Get widget
    const widget = await this.DashboardWidget.findOne({
      where: {
        id: widgetId,
        dashboard_id: id,
      },
    });

    if (!widget) {
      throw new NotFoundError(`Widget with ID ${widgetId} not found on dashboard ${id}`);
    }

    // Update widget
    await widget.update(widgetData);

    return widget;
  }

  /**
   * Delete dashboard widget
   * @param {string} id - Dashboard ID
   * @param {string} widgetId - Widget ID
   * @param {Object} options - Delete options
   * @returns {boolean} Success
   */
  async deleteDashboardWidget(id, widgetId, options = {}) {
    const { userId } = options;

    // Validate dashboard
    const dashboard = await this.getDashboardById(id, { includeWidgets: false });

    // Check ownership
    if (dashboard.user_id && dashboard.user_id !== userId) {
      throw new ForbiddenError('You do not have permission to modify this dashboard');
    }

    // Get widget
    const widget = await this.DashboardWidget.findOne({
      where: {
        id: widgetId,
        dashboard_id: id,
      },
    });

    if (!widget) {
      throw new NotFoundError(`Widget with ID ${widgetId} not found on dashboard ${id}`);
    }

    // Delete widget
    await widget.destroy();

    // Reorder remaining widgets
    const remainingWidgets = await this.DashboardWidget.findAll({
      where: { dashboard_id: id },
      order: [['position', 'ASC']],
    });

    // Update positions
    await Promise.all(
      remainingWidgets.map((w, index) => w.update({ position: index }))
    );

    return true;
  }

  /**
   * Get widget data
   * @param {string} id - Dashboard ID
   * @param {string} widgetId - Widget ID
   * @returns {Object} Widget data
   */
  async getWidgetData(id, widgetId) {
    // Get widget
    const widget = await this.DashboardWidget.findOne({
      where: {
        id: widgetId,
        dashboard_id: id,
      },
    });

    if (!widget) {
      throw new NotFoundError(`Widget with ID ${widgetId} not found on dashboard ${id}`);
    }

    // Get data based on widget type and configuration
    const config = widget.config || {};
    let data = null;

    switch (widget.type) {
      case 'metric':
        if (config.metric_id) {
          data = await this.metricService.calculateMetricValue(config.metric_id, {
            startDate: config.start_date,
            endDate: config.end_date,
            period: config.period || 'daily',
          });
        }
        break;
      case 'chart':
        if (config.metric_ids && Array.isArray(config.metric_ids)) {
          data = await Promise.all(
            config.metric_ids.map(metricId =>
              this.metricService.getMetricData(metricId, {
                startDate: config.start_date,
                endDate: config.end_date,
                period: config.period || 'daily',
                includeForecasts: config.include_forecasts || false,
              })
            )
          );
        }
        break;
      case 'kpi':
        if (config.kpi_ids && Array.isArray(config.kpi_ids)) {
          data = await Promise.all(
            config.kpi_ids.map(kpiId =>
              this.metricService.calculateMetricValue(kpiId, {
                startDate: config.start_date,
                endDate: config.end_date,
                period: config.period || 'daily',
              })
            )
          );
        }
        break;
      default:
        data = { message: 'No data available for this widget type' };
    }

    return {
      widget,
      data,
    };
  }

  /**
   * Get default dashboard for user
   * @param {string} userId - User ID
   * @returns {Object} Default dashboard
   */
  async getDefaultDashboard(userId) {
    // Try to find user's default dashboard
    let dashboard = await this.Dashboard.findOne({
      where: {
        user_id: userId,
        is_default: true,
      },
    });

    // If not found, try to find role-based default dashboard
    if (!dashboard) {
      // Note: In a real implementation, you would get the user's roles from the auth service
      // and then find a dashboard for one of those roles
      dashboard = await this.Dashboard.findOne({
        where: {
          is_default: true,
          is_public: true,
        },
      });
    }

    // If still not found, get the first public dashboard
    if (!dashboard) {
      dashboard = await this.Dashboard.findOne({
        where: {
          is_public: true,
        },
      });
    }

    if (!dashboard) {
      throw new NotFoundError('No default dashboard found');
    }

    return this.getDashboardById(dashboard.id, { userId });
  }
}

module.exports = DashboardService;
