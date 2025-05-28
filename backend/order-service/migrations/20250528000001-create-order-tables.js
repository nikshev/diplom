'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create schema if not exists
    await queryInterface.sequelize.query('CREATE SCHEMA IF NOT EXISTS order_service;');
    
    // Create orders table
    await queryInterface.createTable('orders', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      customer_id: {
        type: Sequelize.UUID,
        allowNull: false
      },
      order_number: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      status: {
        type: Sequelize.ENUM('new', 'processing', 'shipped', 'delivered', 'cancelled'),
        allowNull: false,
        defaultValue: 'new'
      },
      total_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      shipping_address: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      shipping_city: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      shipping_postal_code: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      shipping_country: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      shipping_method: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      payment_method: {
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
      schema: 'order_service'
    });
    
    // Create order_items table
    await queryInterface.createTable('order_items', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      order_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: {
            tableName: 'orders',
            schema: 'order_service'
          },
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      product_id: {
        type: Sequelize.UUID,
        allowNull: false
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      unit_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      total_price: {
        type: Sequelize.DECIMAL(10, 2),
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
      schema: 'order_service'
    });
    
    // Create order_status_history table
    await queryInterface.createTable('order_status_history', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      order_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: {
            tableName: 'orders',
            schema: 'order_service'
          },
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      status: {
        type: Sequelize.ENUM('new', 'processing', 'shipped', 'delivered', 'cancelled'),
        allowNull: false
      },
      comment: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    }, {
      schema: 'order_service'
    });
    
    // Create indexes
    await queryInterface.addIndex('order_service.orders', ['customer_id'], {
      name: 'orders_customer_id_idx'
    });
    
    await queryInterface.addIndex('order_service.orders', ['order_number'], {
      name: 'orders_order_number_idx',
      unique: true
    });
    
    await queryInterface.addIndex('order_service.orders', ['status'], {
      name: 'orders_status_idx'
    });
    
    await queryInterface.addIndex('order_service.orders', ['created_at'], {
      name: 'orders_created_at_idx'
    });
    
    await queryInterface.addIndex('order_service.order_items', ['order_id'], {
      name: 'order_items_order_id_idx'
    });
    
    await queryInterface.addIndex('order_service.order_items', ['product_id'], {
      name: 'order_items_product_id_idx'
    });
    
    await queryInterface.addIndex('order_service.order_status_history', ['order_id'], {
      name: 'order_status_history_order_id_idx'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Drop tables in reverse order
    await queryInterface.dropTable({ tableName: 'order_status_history', schema: 'order_service' });
    await queryInterface.dropTable({ tableName: 'order_items', schema: 'order_service' });
    await queryInterface.dropTable({ tableName: 'orders', schema: 'order_service' });
    
    // Drop enum types
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "order_service"."enum_orders_status";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "order_service"."enum_order_status_history_status";');
    
    // Drop schema
    await queryInterface.sequelize.query('DROP SCHEMA IF EXISTS order_service CASCADE;');
  }
};
