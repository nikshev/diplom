/**
 * Dashboard Widget model for Analytics Service
 */

module.exports = (sequelize, DataTypes) => {
  const DashboardWidget = sequelize.define('DashboardWidget', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    dashboard_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'dashboards',
        key: 'id',
      },
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Widget type (e.g., chart, table, kpi, custom)',
    },
    size: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'medium',
      comment: 'Widget size (e.g., small, medium, large)',
    },
    position: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Position order on the dashboard',
    },
    config: {
      type: DataTypes.JSONB,
      allowNull: false,
      comment: 'Widget configuration (metrics, visualization type, filters, etc.)',
    },
    refresh_interval: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Refresh interval in seconds',
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    updated_by: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  }, {
    tableName: 'dashboard_widgets',
    timestamps: true,
    underscored: true,
  });

  DashboardWidget.associate = (models) => {
    DashboardWidget.belongsTo(models.Dashboard, {
      foreignKey: 'dashboard_id',
      as: 'dashboard',
    });
  };

  return DashboardWidget;
};
