/**
 * Transaction model for finance service
 */

module.exports = (sequelize, DataTypes) => {
  const Transaction = sequelize.define('Transaction', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    transaction_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        isIn: [['income', 'expense', 'transfer']]
      }
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: 'UAH'
    },
    account_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'accounts',
        key: 'id'
      }
    },
    target_account_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'accounts',
        key: 'id'
      },
      comment: 'For transfer transactions, the target account'
    },
    category_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'transaction_categories',
        key: 'id'
      }
    },
    reference_id: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: 'Reference to external entity (order, invoice, etc.)'
    },
    reference_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Type of reference (order, invoice, etc.)'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    transaction_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'completed',
      validate: {
        isIn: [['pending', 'completed', 'failed', 'cancelled']]
      }
    },
    user_id: {
      type: DataTypes.UUID,
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
    tableName: 'transactions',
    schema: 'finance_service',
    timestamps: true,
    underscored: true
  });

  Transaction.associate = function(models) {
    Transaction.belongsTo(models.Account, {
      foreignKey: 'account_id',
      as: 'account'
    });
    
    Transaction.belongsTo(models.Account, {
      foreignKey: 'target_account_id',
      as: 'targetAccount'
    });
    
    Transaction.belongsTo(models.TransactionCategory, {
      foreignKey: 'category_id',
      as: 'category'
    });
  };

  return Transaction;
};
