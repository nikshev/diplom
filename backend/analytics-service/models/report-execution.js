/**
 * Report Execution model for Analytics Service
 */

module.exports = (sequelize, DataTypes) => {
  const ReportExecution = sequelize.define('ReportExecution', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    report_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'reports',
        key: 'id',
      },
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'pending',
      comment: 'Execution status (e.g., pending, processing, completed, failed)',
    },
    parameters: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Parameters used for this execution',
    },
    start_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    end_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Execution duration in milliseconds',
    },
    file_path: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Path to the generated report file',
    },
    file_size: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Size of the generated report file in bytes',
    },
    error: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Error message if execution failed',
    },
    is_scheduled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Whether this execution was triggered by a schedule',
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  }, {
    tableName: 'report_executions',
    timestamps: true,
    underscored: true,
  });

  ReportExecution.associate = (models) => {
    ReportExecution.belongsTo(models.Report, {
      foreignKey: 'report_id',
      as: 'report',
    });
  };

  return ReportExecution;
};
