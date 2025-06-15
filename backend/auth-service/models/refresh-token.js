/**
 * RefreshToken model for auth service
 */

module.exports = (sequelize, DataTypes) => {
  const RefreshToken = sequelize.define('RefreshToken', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    token: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'refresh_tokens',
    schema: 'auth_service',
    timestamps: true,
    updatedAt: false,
    underscored: true
  });

  RefreshToken.associate = function(models) {
    RefreshToken.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  };

  return RefreshToken;
};
