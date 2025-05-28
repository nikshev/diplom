/**
 * Category model for inventory service
 */

module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define('Category', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    parent_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'categories',
        key: 'id'
      }
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
    tableName: 'categories',
    schema: 'inventory_service',
    timestamps: true,
    underscored: true
  });

  Category.associate = function(models) {
    Category.belongsTo(models.Category, {
      foreignKey: 'parent_id',
      as: 'parent'
    });
    
    Category.hasMany(models.Category, {
      foreignKey: 'parent_id',
      as: 'subcategories'
    });
    
    Category.hasMany(models.Product, {
      foreignKey: 'category_id',
      as: 'products'
    });
  };

  return Category;
};
