/**
 * TransactionCategory model for finance service
 */

module.exports = (sequelize, DataTypes) => {
  const TransactionCategory = sequelize.define('TransactionCategory', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        isIn: [['income', 'expense', 'both']]
      }
    },
    parent_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'transaction_categories',
        key: 'id'
      }
    },
    description: {
      type: DataTypes.TEXT,
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
    tableName: 'transaction_categories',
    schema: 'finance_service',
    timestamps: true,
    underscored: true
  });

  TransactionCategory.associate = function(models) {
    TransactionCategory.belongsTo(models.TransactionCategory, {
      foreignKey: 'parent_id',
      as: 'parent'
    });
    
    TransactionCategory.hasMany(models.TransactionCategory, {
      foreignKey: 'parent_id',
      as: 'subcategories'
    });
    
    TransactionCategory.hasMany(models.Transaction, {
      foreignKey: 'category_id',
      as: 'transactions'
    });
  };

  return TransactionCategory;
};
