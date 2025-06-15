/**
 * Migrations index for order service
 */

const path = require('path');
const { createDatabaseConnection } = require('../shared/database');
const { runMigrations, rollbackMigrations, getMigrationStatus, createMigration } = require('../shared/migrations');

// Schema name for order service
const SCHEMA = 'order_service';
// Migrations directory
const MIGRATIONS_DIR = __dirname;

/**
 * Run pending migrations for order service
 * @returns {Promise<Array>} List of executed migrations
 */
async function migrate() {
  const sequelize = createDatabaseConnection(SCHEMA);
  
  try {
    // Create schema if not exists
    await sequelize.query(`CREATE SCHEMA IF NOT EXISTS "${SCHEMA}"`);
    
    // Run migrations
    const migrations = await runMigrations(sequelize, MIGRATIONS_DIR);
    return migrations;
  } finally {
    await sequelize.close();
  }
}

/**
 * Rollback migrations for order service
 * @param {Object} options - Rollback options
 * @returns {Promise<Array>} List of rolled back migrations
 */
async function rollback(options = {}) {
  const sequelize = createDatabaseConnection(SCHEMA);
  
  try {
    // Rollback migrations
    const migrations = await rollbackMigrations(sequelize, MIGRATIONS_DIR, options);
    return migrations;
  } finally {
    await sequelize.close();
  }
}

/**
 * Get migration status for order service
 * @returns {Promise<Object>} Migration status
 */
async function status() {
  const sequelize = createDatabaseConnection(SCHEMA);
  
  try {
    // Get migration status
    const status = await getMigrationStatus(sequelize, MIGRATIONS_DIR);
    return status;
  } finally {
    await sequelize.close();
  }
}

/**
 * Create a new migration file for order service
 * @param {string} name - Migration name
 * @returns {string} Path to the created migration file
 */
function create(name) {
  return createMigration(MIGRATIONS_DIR, name);
}

module.exports = {
  migrate,
  rollback,
  status,
  create
};
