/**
 * Report model for Analytics Service
 */

module.exports = (sequelize, DataTypes) => {
  const Report = sequelize.define('Report', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Report type (e.g., financial, operational, customer, inventory)',
    },
    format: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'pdf',
      comment: 'Report format (e.g., pdf, excel, csv)',
    },
    template: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Report template configuration',
    },
    parameters: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Report parameters (filters, date ranges, etc.)',
    },
    schedule: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Schedule configuration for automated reports',
    },
    is_scheduled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    last_generated_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    recipients: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'List of recipients for scheduled reports',
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
    tableName: 'reports',
    timestamps: true,
    underscored: true,
  });

  Report.associate = (models) => {
    Report.hasMany(models.ReportExecution, {
      foreignKey: 'report_id',
      as: 'executions',
    });
  };

  return Report;
};
