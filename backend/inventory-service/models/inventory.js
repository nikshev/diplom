/**
 * Inventory model for inventory service
 */

module.exports = (sequelize, DataTypes) => {
  const Inventory = sequelize.define('Inventory', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id'
      }
    },
    warehouse_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'warehouses',
        key: 'id'
      }
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    quantity_reserved: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    quantity_available: {
      type: DataTypes.VIRTUAL,
      get() {
        return Math.max(0, this.get('quantity') - this.get('quantity_reserved'));
      }
    },
    min_quantity: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    max_quantity: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    location: {
      type: DataTypes.STRING(100),
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
    tableName: 'inventory',
    schema: 'inventory_service',
    timestamps: true,
    underscored: true
  });

  Inventory.associate = function(models) {
    Inventory.belongsTo(models.Product, {
      foreignKey: 'product_id',
      as: 'product'
    });
    
    Inventory.belongsTo(models.Warehouse, {
      foreignKey: 'warehouse_id',
      as: 'warehouse'
    });
    
    Inventory.hasMany(models.InventoryTransaction, {
      foreignKey: 'inventory_id',
      as: 'transactions'
    });
  };

  return Inventory;
};
