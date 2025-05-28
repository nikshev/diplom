/**
 * OrderItem model for order service
 */

module.exports = (sequelize, DataTypes) => {
  const OrderItem = sequelize.define('OrderItem', {
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
    product_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    unit_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    total_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'order_items',
    schema: 'order_service',
    timestamps: true,
    underscored: true,
    hooks: {
      beforeValidate: (orderItem) => {
        // Автоматичний розрахунок загальної ціни
        if (orderItem.unit_price && orderItem.quantity) {
          orderItem.total_price = parseFloat(orderItem.unit_price) * orderItem.quantity;
        }
      }
    }
  });

  OrderItem.associate = function(models) {
    OrderItem.belongsTo(models.Order, {
      foreignKey: 'order_id',
      as: 'order'
    });
  };

  return OrderItem;
};
