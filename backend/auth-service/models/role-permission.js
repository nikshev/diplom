/**
 * RolePermission model for auth service
 */

module.exports = (sequelize, DataTypes) => {
  const RolePermission = sequelize.define('RolePermission', {
    role_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'roles',
        key: 'id'
      }
    },
    permission_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'permissions',
        key: 'id'
      }
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'role_permissions',
    schema: 'auth_service',
    timestamps: true,
    updatedAt: false,
    underscored: true
  });

  return RolePermission;
};
