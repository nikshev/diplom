/**
 * InvoicePayment model for finance service
 */

module.exports = (sequelize, DataTypes) => {
  const InvoicePayment = sequelize.define('InvoicePayment', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    invoice_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'invoices',
        key: 'id'
      }
    },
    transaction_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'transactions',
        key: 'id'
      },
      comment: 'Reference to the transaction record if payment was recorded in the system'
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    },
    payment_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    payment_method: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    reference_number: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'External reference number (e.g., bank transaction ID)'
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
    tableName: 'invoice_payments',
    schema: 'finance_service',
    timestamps: true,
    underscored: true
  });

  InvoicePayment.associate = function(models) {
    InvoicePayment.belongsTo(models.Invoice, {
      foreignKey: 'invoice_id',
      as: 'invoice'
    });
    
    InvoicePayment.belongsTo(models.Transaction, {
      foreignKey: 'transaction_id',
      as: 'transaction'
    });
  };

  return InvoicePayment;
};
