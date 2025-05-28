'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create schema if not exists
    await queryInterface.sequelize.query('CREATE SCHEMA IF NOT EXISTS crm_service;');
    
    // Create customers table
    await queryInterface.createTable('customers', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      first_name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      last_name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: true,
        unique: true
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: true
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
      status: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'active'
      },
      type: {
        type: Sequelize.STRING(50),
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
      schema: 'crm_service'
    });
    
    // Create contacts table
    await queryInterface.createTable('contacts', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      customer_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: {
            tableName: 'customers',
            schema: 'crm_service'
          },
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      first_name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      last_name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      position: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      is_primary: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
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
      schema: 'crm_service'
    });
    
    // Create interactions table
    await queryInterface.createTable('interactions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      customer_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: {
            tableName: 'customers',
            schema: 'crm_service'
          },
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false
      },
      type: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      subject: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
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
      schema: 'crm_service'
    });
    
    // Create indexes
    await queryInterface.addIndex('crm_service.customers', ['email'], {
      name: 'customers_email_idx',
      unique: true
    });
    
    await queryInterface.addIndex('crm_service.customers', ['phone'], {
      name: 'customers_phone_idx'
    });
    
    await queryInterface.addIndex('crm_service.contacts', ['customer_id'], {
      name: 'contacts_customer_id_idx'
    });
    
    await queryInterface.addIndex('crm_service.interactions', ['customer_id'], {
      name: 'interactions_customer_id_idx'
    });
    
    await queryInterface.addIndex('crm_service.interactions', ['date'], {
      name: 'interactions_date_idx'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Drop tables in reverse order
    await queryInterface.dropTable({ tableName: 'interactions', schema: 'crm_service' });
    await queryInterface.dropTable({ tableName: 'contacts', schema: 'crm_service' });
    await queryInterface.dropTable({ tableName: 'customers', schema: 'crm_service' });
    
    // Drop schema
    await queryInterface.sequelize.query('DROP SCHEMA IF EXISTS crm_service CASCADE;');
  }
};
