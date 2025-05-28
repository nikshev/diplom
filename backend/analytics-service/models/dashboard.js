/**
 * Dashboard model for Analytics Service
 */

module.exports = (sequelize, DataTypes) => {
  const Dashboard = sequelize.define('Dashboard', {
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
    layout: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Layout configuration for the dashboard',
    },
    is_default: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    is_public: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: 'User ID if this is a personal dashboard',
    },
    role_id: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: 'Role ID if this is a role-specific dashboard',
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
    tableName: 'dashboards',
    timestamps: true,
    underscored: true,
  });

  Dashboard.associate = (models) => {
    Dashboard.hasMany(models.DashboardWidget, {
      foreignKey: 'dashboard_id',
      as: 'widgets',
    });
  };

  return Dashboard;
};
