/**
 * Metric Data model for Analytics Service
 */

module.exports = (sequelize, DataTypes) => {
  const MetricData = sequelize.define('MetricData', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    metric_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'metrics',
        key: 'id',
      },
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    value: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    period: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Period type (e.g., daily, weekly, monthly, quarterly, yearly)',
    },
    period_start: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: 'Start date of the period',
    },
    period_end: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: 'End date of the period',
    },
    source_data: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Source data used to calculate the metric',
    },
    is_forecasted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Whether this data point is forecasted',
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  }, {
    tableName: 'metric_data',
    timestamps: true,
    underscored: true,
  });

  MetricData.associate = (models) => {
    MetricData.belongsTo(models.Metric, {
      foreignKey: 'metric_id',
      as: 'metric',
    });
  };

  return MetricData;
};
