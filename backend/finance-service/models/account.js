/**
 * Account model for finance service
 */

module.exports = (sequelize, DataTypes) => {
  const Account = sequelize.define('Account', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    account_number: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        isIn: [['cash', 'bank', 'credit', 'savings', 'investment', 'other']]
      }
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: 'UAH'
    },
    balance: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    description: {
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
    tableName: 'accounts',
    schema: 'finance_service',
    timestamps: true,
    underscored: true
  });

  Account.associate = function(models) {
    Account.hasMany(models.Transaction, {
      foreignKey: 'account_id',
      as: 'transactions'
    });
    
    Account.hasMany(models.Transaction, {
      foreignKey: 'target_account_id',
      as: 'incomingTransfers'
    });
  };

  return Account;
};
