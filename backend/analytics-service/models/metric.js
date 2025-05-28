/**
 * Metric model for Analytics Service
 */

module.exports = (sequelize, DataTypes) => {
  const Metric = sequelize.define('Metric', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    display_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Category of the metric (e.g., financial, operational, customer)',
    },
    data_source: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Source service of the data (e.g., finance, inventory, order)',
    },
    data_type: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Type of data (e.g., number, percentage, currency)',
    },
    calculation_method: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Method used to calculate the metric (e.g., sum, average, count)',
    },
    calculation_formula: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Formula used to calculate the metric',
    },
    aggregation_period: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'daily',
      comment: 'Period for which the metric is aggregated (e.g., daily, weekly, monthly)',
    },
    unit: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Unit of measurement (e.g., $, %, days)',
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    is_kpi: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Whether this metric is a KPI',
    },
    target_value: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: 'Target value for the metric (for KPIs)',
    },
    target_period: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Period for the target value (e.g., daily, monthly, quarterly, yearly)',
    },
    visualization_type: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Default visualization type (e.g., line, bar, pie)',
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
    tableName: 'metrics',
    timestamps: true,
    underscored: true,
  });

  Metric.associate = (models) => {
    Metric.hasMany(models.MetricData, {
      foreignKey: 'metric_id',
      as: 'data',
    });
    
    Metric.hasMany(models.Dashboard, {
      foreignKey: 'metric_id',
      as: 'dashboards',
    });
  };

  return Metric;
};
