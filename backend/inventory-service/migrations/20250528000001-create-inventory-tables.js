'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create schema if not exists
    await queryInterface.sequelize.query('CREATE SCHEMA IF NOT EXISTS inventory_service;');
    
    // Create categories table
    await queryInterface.createTable('categories', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      parent_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: {
            tableName: 'categories',
            schema: 'inventory_service'
          },
          key: 'id'
        },
        onDelete: 'SET NULL'
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
      schema: 'inventory_service'
    });
    
    // Create products table
    await queryInterface.createTable('products', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      sku: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      category_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: {
            tableName: 'categories',
            schema: 'inventory_service'
          },
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      cost: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0.00
      },
      weight: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: true
      },
      weight_unit: {
        type: Sequelize.STRING(10),
        allowNull: true,
        defaultValue: 'kg'
      },
      dimensions: {
        type: Sequelize.JSON,
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
      schema: 'inventory_service'
    });
    
    // Create warehouses table
    await queryInterface.createTable('warehouses', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      code: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      city: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      postal_code: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      country: {
        type: Sequelize.STRING(100),
        allowNull: true,
        defaultValue: 'Україна'
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
      schema: 'inventory_service'
    });
    
    // Create inventory table
    await queryInterface.createTable('inventory', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      product_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: {
            tableName: 'products',
            schema: 'inventory_service'
          },
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      warehouse_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: {
            tableName: 'warehouses',
            schema: 'inventory_service'
          },
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      quantity_reserved: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      min_quantity: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      max_quantity: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      location: {
        type: Sequelize.STRING(100),
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
      schema: 'inventory_service'
    });
    
    // Create inventory_transactions table
    await queryInterface.createTable('inventory_transactions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      inventory_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: {
            tableName: 'inventory',
            schema: 'inventory_service'
          },
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      type: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      reference_id: {
        type: Sequelize.UUID,
        allowNull: true
      },
      reference_type: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      notes: {
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
      schema: 'inventory_service'
    });
    
    // Create indexes
    await queryInterface.addIndex('inventory_service.categories', ['parent_id'], {
      name: 'categories_parent_id_idx'
    });
    
    await queryInterface.addIndex('inventory_service.products', ['sku'], {
      name: 'products_sku_idx',
      unique: true
    });
    
    await queryInterface.addIndex('inventory_service.products', ['category_id'], {
      name: 'products_category_id_idx'
    });
    
    await queryInterface.addIndex('inventory_service.warehouses', ['code'], {
      name: 'warehouses_code_idx',
      unique: true
    });
    
    await queryInterface.addIndex('inventory_service.inventory', ['product_id', 'warehouse_id'], {
      name: 'inventory_product_warehouse_idx',
      unique: true
    });
    
    await queryInterface.addIndex('inventory_service.inventory_transactions', ['inventory_id'], {
      name: 'inventory_transactions_inventory_id_idx'
    });
    
    await queryInterface.addIndex('inventory_service.inventory_transactions', ['type'], {
      name: 'inventory_transactions_type_idx'
    });
    
    await queryInterface.addIndex('inventory_service.inventory_transactions', ['reference_id', 'reference_type'], {
      name: 'inventory_transactions_reference_idx'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Drop tables in reverse order
    await queryInterface.dropTable({ tableName: 'inventory_transactions', schema: 'inventory_service' });
    await queryInterface.dropTable({ tableName: 'inventory', schema: 'inventory_service' });
    await queryInterface.dropTable({ tableName: 'warehouses', schema: 'inventory_service' });
    await queryInterface.dropTable({ tableName: 'products', schema: 'inventory_service' });
    await queryInterface.dropTable({ tableName: 'categories', schema: 'inventory_service' });
    
    // Drop schema
    await queryInterface.sequelize.query('DROP SCHEMA IF EXISTS inventory_service CASCADE;');
  }
};
