/**
 * OrderStatusHistory model for order service
 */

module.exports = (sequelize, DataTypes) => {
  const OrderStatusHistory = sequelize.define('OrderStatusHistory', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    order_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'orders',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('new', 'processing', 'shipped', 'delivered', 'cancelled'),
      allowNull: false
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'order_status_history',
    schema: 'order_service',
    timestamps: true,
    updatedAt: false,
    underscored: true
  });

  OrderStatusHistory.associate = function(models) {
    OrderStatusHistory.belongsTo(models.Order, {
      foreignKey: 'order_id',
      as: 'order'
    });
  };

  return OrderStatusHistory;
};
