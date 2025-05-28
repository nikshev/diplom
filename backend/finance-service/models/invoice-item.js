/**
 * InvoiceItem model for finance service
 */

module.exports = (sequelize, DataTypes) => {
  const InvoiceItem = sequelize.define('InvoiceItem', {
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
    product_id: {
      type: DataTypes.UUID,
      allowNull: true
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 1.00
    },
    unit_price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    },
    tax_rate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0.00
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
    tableName: 'invoice_items',
    schema: 'finance_service',
    timestamps: true,
    underscored: true,
    hooks: {
      beforeValidate: (invoiceItem) => {
        // Автоматичний розрахунок податку та загальної суми
        if (invoiceItem.unit_price !== undefined && invoiceItem.quantity !== undefined) {
          const amount = parseFloat(invoiceItem.unit_price) * parseFloat(invoiceItem.quantity);
          const taxAmount = amount * (parseFloat(invoiceItem.tax_rate) / 100);
          
          invoiceItem.tax_amount = taxAmount;
          invoiceItem.total_amount = amount + taxAmount;
        }
      }
    }
  });

  InvoiceItem.associate = function(models) {
    InvoiceItem.belongsTo(models.Invoice, {
      foreignKey: 'invoice_id',
      as: 'invoice'
    });
  };

  return InvoiceItem;
};
