/**
 * InventoryTransaction model for inventory service
 */

module.exports = (sequelize, DataTypes) => {
  const InventoryTransaction = sequelize.define('InventoryTransaction', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    inventory_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'inventory',
        key: 'id'
      }
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        isIn: [['receipt', 'shipment', 'adjustment', 'transfer', 'reservation', 'release']]
      }
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    reference_id: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: 'Reference to external entity (order, purchase, etc.)'
    },
    reference_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Type of reference (order, purchase, etc.)'
    },
    notes: {
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
    tableName: 'inventory_transactions',
    schema: 'inventory_service',
    timestamps: true,
    updatedAt: false,
    underscored: true
  });

  InventoryTransaction.associate = function(models) {
    InventoryTransaction.belongsTo(models.Inventory, {
      foreignKey: 'inventory_id',
      as: 'inventory'
    });
  };

  return InventoryTransaction;
};
