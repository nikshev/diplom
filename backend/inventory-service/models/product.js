/**
 * Product model for inventory service
 */

module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    sku: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    category_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'categories',
        key: 'id'
      }
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    cost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0.00
    },
    weight: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true
    },
    weight_unit: {
      type: DataTypes.STRING(10),
      allowNull: true,
      defaultValue: 'kg'
    },
    dimensions: {
      type: DataTypes.JSON,
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
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
    tableName: 'products',
    schema: 'inventory_service',
    timestamps: true,
    underscored: true
  });

  Product.associate = function(models) {
    Product.belongsTo(models.Category, {
      foreignKey: 'category_id',
      as: 'category'
    });
    
    Product.hasMany(models.Inventory, {
      foreignKey: 'product_id',
      as: 'inventory'
    });
  };

  return Product;
};
