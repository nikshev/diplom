/**
 * Order model for order service
 */

module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    customer_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    order_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    status: {
      type: DataTypes.ENUM('new', 'processing', 'shipped', 'delivered', 'cancelled'),
      allowNull: false,
      defaultValue: 'new'
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    shipping_address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    shipping_city: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    shipping_postal_code: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    shipping_country: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    shipping_method: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    payment_method: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
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
    tableName: 'orders',
    schema: 'order_service',
    timestamps: true,
    underscored: true
  });

  Order.associate = function(models) {
    Order.hasMany(models.OrderItem, {
      foreignKey: 'order_id',
      as: 'items'
    });
    
    Order.hasMany(models.OrderStatusHistory, {
      foreignKey: 'order_id',
      as: 'status_history'
    });
  };

  return Order;
};
