'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create schema if not exists
    await queryInterface.sequelize.query('CREATE SCHEMA IF NOT EXISTS auth_service;');
    
    // Create users table
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      password_hash: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      first_name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      last_name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      role: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'employee'
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
      schema: 'auth_service'
    });
    
    // Create roles table
    await queryInterface.createTable('roles', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
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
      schema: 'auth_service'
    });
    
    // Create permissions table
    await queryInterface.createTable('permissions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      resource: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      action: {
        type: Sequelize.STRING(50),
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
      schema: 'auth_service'
    });
    
    // Create role_permissions table
    await queryInterface.createTable('role_permissions', {
      role_id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        references: {
          model: {
            tableName: 'roles',
            schema: 'auth_service'
          },
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      permission_id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        references: {
          model: {
            tableName: 'permissions',
            schema: 'auth_service'
          },
          key: 'id'
        },
        onDelete: 'CASCADE'
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
      schema: 'auth_service'
    });
    
    // Create refresh_tokens table
    await queryInterface.createTable('refresh_tokens', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: {
            tableName: 'users',
            schema: 'auth_service'
          },
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      token: {
        type: Sequelize.TEXT,
        allowNull: false,
        unique: true
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    }, {
      schema: 'auth_service'
    });
    
    // Create indexes
    await queryInterface.addIndex('auth_service.users', ['email'], {
      name: 'users_email_idx',
      unique: true
    });
    
    await queryInterface.addIndex('auth_service.refresh_tokens', ['user_id'], {
      name: 'refresh_tokens_user_id_idx'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Drop tables in reverse order
    await queryInterface.dropTable({ tableName: 'refresh_tokens', schema: 'auth_service' });
    await queryInterface.dropTable({ tableName: 'role_permissions', schema: 'auth_service' });
    await queryInterface.dropTable({ tableName: 'permissions', schema: 'auth_service' });
    await queryInterface.dropTable({ tableName: 'roles', schema: 'auth_service' });
    await queryInterface.dropTable({ tableName: 'users', schema: 'auth_service' });
    
    // Drop schema
    await queryInterface.sequelize.query('DROP SCHEMA IF EXISTS auth_service CASCADE;');
  }
};
