'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create schema if not exists
    await queryInterface.sequelize.query('CREATE SCHEMA IF NOT EXISTS finance_service;');
    
    // Create accounts table
    await queryInterface.createTable('accounts', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      account_number: {
        type: Sequelize.STRING(50),
        allowNull: true,
        unique: true
      },
      type: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      currency: {
        type: Sequelize.STRING(3),
        allowNull: false,
        defaultValue: 'UAH'
      },
      balance: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    }, {
      schema: 'finance_service'
    });
    
    // Create transaction_categories table
    await queryInterface.createTable('transaction_categories', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      type: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      parent_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: {
            tableName: 'transaction_categories',
            schema: 'finance_service'
          },
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    }, {
      schema: 'finance_service'
    });
    
    // Create transactions table
    await queryInterface.createTable('transactions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      transaction_number: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      type: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false
      },
      currency: {
        type: Sequelize.STRING(3),
        allowNull: false,
        defaultValue: 'UAH'
      },
      account_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: {
            tableName: 'accounts',
            schema: 'finance_service'
          },
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      target_account_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: {
            tableName: 'accounts',
            schema: 'finance_service'
          },
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      category_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: {
            tableName: 'transaction_categories',
            schema: 'finance_service'
          },
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      reference_id: {
        type: Sequelize.UUID,
        allowNull: true
      },
      reference_type: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      transaction_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      status: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'completed'
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    }, {
      schema: 'finance_service'
    });
    
    // Create invoices table
    await queryInterface.createTable('invoices', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      invoice_number: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      customer_id: {
        type: Sequelize.UUID,
        allowNull: false
      },
      order_id: {
        type: Sequelize.UUID,
        allowNull: true
      },
      amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false
      },
      tax_amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      total_amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false
      },
      currency: {
        type: Sequelize.STRING(3),
        allowNull: false,
        defaultValue: 'UAH'
      },
      status: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'draft'
      },
      issue_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      due_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      payment_terms: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    }, {
      schema: 'finance_service'
    });
    
    // Create invoice_items table
    await queryInterface.createTable('invoice_items', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      invoice_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: {
            tableName: 'invoices',
            schema: 'finance_service'
          },
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      product_id: {
        type: Sequelize.UUID,
        allowNull: true
      },
      description: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      quantity: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 1.00
      },
      unit_price: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false
      },
      tax_rate: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      tax_amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      total_amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    }, {
      schema: 'finance_service'
    });
    
    // Create invoice_payments table
    await queryInterface.createTable('invoice_payments', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      invoice_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: {
            tableName: 'invoices',
            schema: 'finance_service'
          },
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      transaction_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: {
            tableName: 'transactions',
            schema: 'finance_service'
          },
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false
      },
      payment_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      payment_method: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      reference_number: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    }, {
      schema: 'finance_service'
    });
    
    // Create indexes
    await queryInterface.addIndex('finance_service.accounts', ['account_number'], {
      name: 'accounts_account_number_idx',
      unique: true
    });
    
    await queryInterface.addIndex('finance_service.accounts', ['type'], {
      name: 'accounts_type_idx'
    });
    
    await queryInterface.addIndex('finance_service.transaction_categories', ['parent_id'], {
      name: 'transaction_categories_parent_id_idx'
    });
    
    await queryInterface.addIndex('finance_service.transaction_categories', ['type'], {
      name: 'transaction_categories_type_idx'
    });
    
    await queryInterface.addIndex('finance_service.transactions', ['transaction_number'], {
      name: 'transactions_transaction_number_idx',
      unique: true
    });
    
    await queryInterface.addIndex('finance_service.transactions', ['account_id'], {
      name: 'transactions_account_id_idx'
    });
    
    await queryInterface.addIndex('finance_service.transactions', ['target_account_id'], {
      name: 'transactions_target_account_id_idx'
    });
    
    await queryInterface.addIndex('finance_service.transactions', ['category_id'], {
      name: 'transactions_category_id_idx'
    });
    
    await queryInterface.addIndex('finance_service.transactions', ['transaction_date'], {
      name: 'transactions_transaction_date_idx'
    });
    
    await queryInterface.addIndex('finance_service.transactions', ['reference_id', 'reference_type'], {
      name: 'transactions_reference_idx'
    });
    
    await queryInterface.addIndex('finance_service.invoices', ['invoice_number'], {
      name: 'invoices_invoice_number_idx',
      unique: true
    });
    
    await queryInterface.addIndex('finance_service.invoices', ['customer_id'], {
      name: 'invoices_customer_id_idx'
    });
    
    await queryInterface.addIndex('finance_service.invoices', ['order_id'], {
      name: 'invoices_order_id_idx'
    });
    
    await queryInterface.addIndex('finance_service.invoices', ['status'], {
      name: 'invoices_status_idx'
    });
    
    await queryInterface.addIndex('finance_service.invoices', ['issue_date'], {
      name: 'invoices_issue_date_idx'
    });
    
    await queryInterface.addIndex('finance_service.invoices', ['due_date'], {
      name: 'invoices_due_date_idx'
    });
    
    await queryInterface.addIndex('finance_service.invoice_items', ['invoice_id'], {
      name: 'invoice_items_invoice_id_idx'
    });
    
    await queryInterface.addIndex('finance_service.invoice_items', ['product_id'], {
      name: 'invoice_items_product_id_idx'
    });
    
    await queryInterface.addIndex('finance_service.invoice_payments', ['invoice_id'], {
      name: 'invoice_payments_invoice_id_idx'
    });
    
    await queryInterface.addIndex('finance_service.invoice_payments', ['transaction_id'], {
      name: 'invoice_payments_transaction_id_idx'
    });
    
    await queryInterface.addIndex('finance_service.invoice_payments', ['payment_date'], {
      name: 'invoice_payments_payment_date_idx'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Drop tables in reverse order
    await queryInterface.dropTable({ tableName: 'invoice_payments', schema: 'finance_service' });
    await queryInterface.dropTable({ tableName: 'invoice_items', schema: 'finance_service' });
    await queryInterface.dropTable({ tableName: 'invoices', schema: 'finance_service' });
    await queryInterface.dropTable({ tableName: 'transactions', schema: 'finance_service' });
    await queryInterface.dropTable({ tableName: 'transaction_categories', schema: 'finance_service' });
    await queryInterface.dropTable({ tableName: 'accounts', schema: 'finance_service' });
    
    // Drop schema
    await queryInterface.sequelize.query('DROP SCHEMA IF EXISTS finance_service CASCADE;');
  }
};
