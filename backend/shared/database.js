/**
 * Shared database configuration for Node.js microservices
 * This module provides a common interface for connecting to PostgreSQL database
 */

const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');

/**
 * Create a Sequelize instance for database connection
 * @param {string} schema - Database schema name (usually the service name)
 * @param {Object} options - Additional connection options
 * @returns {Sequelize} Sequelize instance
 */
function createDatabaseConnection(schema, options = {}) {
  // Get database configuration from environment variables
  const {
    DB_HOST,
    DB_PORT,
    DB_NAME,
    DB_USER,
    DB_PASSWORD,
    NODE_ENV
  } = process.env;

  // Default options
  const defaultOptions = {
    host: DB_HOST || 'localhost',
    port: parseInt(DB_PORT, 10) || 5432,
    dialect: 'postgres',
    logging: NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  };

  // Create Sequelize instance
  const sequelize = new Sequelize(
    DB_NAME || 'erp_system',
    DB_USER || 'postgres',
    DB_PASSWORD || 'postgres',
    {
      ...defaultOptions,
      ...options
    }
  );

  // Set schema if provided
  if (schema) {
    sequelize.options.schema = schema;
    sequelize.options.schemaDelimiter = '.';
  }

  return sequelize;
}

/**
 * Initialize database connection and models
 * @param {string} schema - Database schema name
 * @param {string} modelsDir - Directory containing model definitions
 * @param {Object} options - Additional connection options
 * @returns {Object} Object containing sequelize instance and models
 */
async function initDatabase(schema, modelsDir, options = {}) {
  // Create database connection
  const sequelize = createDatabaseConnection(schema, options);
  const db = { sequelize, Sequelize };

  try {
    // Test connection
    await sequelize.authenticate();
    console.log(`Database connection to schema '${schema}' has been established successfully.`);

    // Load models
    if (modelsDir && fs.existsSync(modelsDir)) {
      const modelFiles = fs.readdirSync(modelsDir)
        .filter(file => file.endsWith('.js') && !file.startsWith('.'));

      // Import model definitions
      for (const file of modelFiles) {
        const model = require(path.join(modelsDir, file))(sequelize, Sequelize);
        db[model.name] = model;
      }

      // Set up associations
      Object.keys(db).forEach(modelName => {
        if (db[modelName].associate) {
          db[modelName].associate(db);
        }
      });

      console.log(`Loaded ${modelFiles.length} models for schema '${schema}'.`);
    }

    return db;
  } catch (error) {
    console.error(`Unable to connect to the database for schema '${schema}':`, error);
    throw error;
  }
}

/**
 * Create database schema if it doesn't exist
 * @param {Sequelize} sequelize - Sequelize instance
 * @param {string} schema - Schema name
 */
async function ensureSchemaExists(sequelize, schema) {
  try {
    await sequelize.query(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);
    console.log(`Schema '${schema}' created or already exists.`);
  } catch (error) {
    console.error(`Error creating schema '${schema}':`, error);
    throw error;
  }
}

module.exports = {
  createDatabaseConnection,
  initDatabase,
  ensureSchemaExists
};
