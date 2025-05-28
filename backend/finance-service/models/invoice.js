/**
 * Invoice model for finance service
 */

module.exports = (sequelize, DataTypes) => {
  const Invoice = sequelize.define('Invoice', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    invoice_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    customer_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    order_id: {
      type: DataTypes.UUID,
      allowNull: true
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    },
    tax_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    total_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: 'UAH'
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'draft',
      validate: {
        isIn: [['draft', 'sent', 'paid', 'partially_paid', 'overdue', 'cancelled']]
      }
    },
    issue_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    due_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    payment_terms: {
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
    tableName: 'invoices',
    schema: 'finance_service',
    timestamps: true,
    underscored: true,
    hooks: {
      beforeValidate: (invoice) => {
        // Автоматичний розрахунок загальної суми
        if (invoice.amount !== undefined && invoice.tax_amount !== undefined) {
          invoice.total_amount = parseFloat(invoice.amount) + parseFloat(invoice.tax_amount);
        }
      }
    }
  });

  Invoice.associate = function(models) {
    Invoice.hasMany(models.InvoiceItem, {
      foreignKey: 'invoice_id',
      as: 'items'
    });
    
    Invoice.hasMany(models.InvoicePayment, {
      foreignKey: 'invoice_id',
      as: 'payments'
    });
  };

  return Invoice;
};
