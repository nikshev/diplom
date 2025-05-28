/**
 * Shared migrations configuration for Node.js microservices
 * This module provides utilities for managing database migrations
 */

const { Sequelize } = require('sequelize');
const { Umzug, SequelizeStorage } = require('umzug');
const path = require('path');
const fs = require('fs');

/**
 * Create a migration instance for a service
 * @param {Sequelize} sequelize - Sequelize instance
 * @param {string} migrationsDir - Directory containing migration files
 * @returns {Umzug} Umzug instance for running migrations
 */
function createMigrationInstance(sequelize, migrationsDir) {
  return new Umzug({
    migrations: {
      glob: path.join(migrationsDir, '*.js'),
      resolve: ({ name, path, context }) => {
        const migration = require(path);
        return {
          name,
          up: async () => migration.up(context, Sequelize),
          down: async () => migration.down(context, Sequelize)
        };
      }
    },
    context: sequelize.getQueryInterface(),
    storage: new SequelizeStorage({ sequelize }),
    logger: console
  });
}

/**
 * Run pending migrations
 * @param {Sequelize} sequelize - Sequelize instance
 * @param {string} migrationsDir - Directory containing migration files
 * @returns {Promise<Array>} List of executed migrations
 */
async function runMigrations(sequelize, migrationsDir) {
  if (!fs.existsSync(migrationsDir)) {
    console.log(`Migrations directory '${migrationsDir}' does not exist. Creating...`);
    fs.mkdirSync(migrationsDir, { recursive: true });
  }

  const umzug = createMigrationInstance(sequelize, migrationsDir);
  
  try {
    const pending = await umzug.pending();
    if (pending.length === 0) {
      console.log('No pending migrations to run.');
      return [];
    }
    
    console.log(`Running ${pending.length} pending migrations...`);
    const executed = await umzug.up();
    console.log(`Successfully executed ${executed.length} migrations.`);
    return executed;
  } catch (error) {
    console.error('Error running migrations:', error);
    throw error;
  }
}

/**
 * Rollback migrations
 * @param {Sequelize} sequelize - Sequelize instance
 * @param {string} migrationsDir - Directory containing migration files
 * @param {Object} options - Rollback options
 * @param {number} options.count - Number of migrations to rollback (default: 1)
 * @param {string} options.to - Rollback to a specific migration
 * @returns {Promise<Array>} List of rolled back migrations
 */
async function rollbackMigrations(sequelize, migrationsDir, options = {}) {
  const umzug = createMigrationInstance(sequelize, migrationsDir);
  
  try {
    let executed;
    
    if (options.to) {
      console.log(`Rolling back to migration '${options.to}'...`);
      executed = await umzug.down({ to: options.to });
    } else {
      const count = options.count || 1;
      console.log(`Rolling back ${count} migrations...`);
      executed = await umzug.down({ step: count });
    }
    
    console.log(`Successfully rolled back ${executed.length} migrations.`);
    return executed;
  } catch (error) {
    console.error('Error rolling back migrations:', error);
    throw error;
  }
}

/**
 * Create a new migration file
 * @param {string} migrationsDir - Directory to store migration files
 * @param {string} name - Migration name
 * @returns {string} Path to the created migration file
 */
function createMigration(migrationsDir, name) {
  if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/[-T:\.Z]/g, '');
  const filename = `${timestamp}-${name}.js`;
  const filePath = path.join(migrationsDir, filename);
  
  const template = `'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', {
     *   id: {
     *     type: Sequelize.UUID,
     *     defaultValue: Sequelize.UUIDV4,
     *     primaryKey: true
     *   },
     *   name: {
     *     type: Sequelize.STRING,
     *     allowNull: false
     *   },
     *   created_at: {
     *     type: Sequelize.DATE,
     *     allowNull: false,
     *     defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
     *   },
     *   updated_at: {
     *     type: Sequelize.DATE,
     *     allowNull: false,
     *     defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
     *   }
     * });
     */
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
`;
  
  fs.writeFileSync(filePath, template);
  console.log(`Created migration file: ${filePath}`);
  
  return filePath;
}

/**
 * Get migration status
 * @param {Sequelize} sequelize - Sequelize instance
 * @param {string} migrationsDir - Directory containing migration files
 * @returns {Promise<Object>} Migration status
 */
async function getMigrationStatus(sequelize, migrationsDir) {
  const umzug = createMigrationInstance(sequelize, migrationsDir);
  
  try {
    const executed = await umzug.executed();
    const pending = await umzug.pending();
    
    return {
      executed,
      pending,
      executedCount: executed.length,
      pendingCount: pending.length
    };
  } catch (error) {
    console.error('Error getting migration status:', error);
    throw error;
  }
}

module.exports = {
  createMigrationInstance,
  runMigrations,
  rollbackMigrations,
  createMigration,
  getMigrationStatus
};
