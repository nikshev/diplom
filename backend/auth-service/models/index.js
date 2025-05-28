/**
 * Models index for auth service
 */

const fs = require('fs');
const path = require('path');
const { initDatabase, ensureSchemaExists } = require('../../shared/database');

// Schema name for auth service
const SCHEMA = 'auth_service';

/**
 * Initialize database and load models
 * @returns {Promise<Object>} Database object with models
 */
async function init() {
  // Initialize database
  const db = await initDatabase(SCHEMA, __dirname);
  
  // Ensure schema exists
  await ensureSchemaExists(db.sequelize, SCHEMA);
  
  // Load models
  const modelFiles = fs.readdirSync(__dirname)
    .filter(file => file !== 'index.js' && file.endsWith('.js'));
  
  for (const file of modelFiles) {
    const model = require(path.join(__dirname, file))(db.sequelize, db.Sequelize);
    db[model.name] = model;
  }
  
  // Set up associations
  Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
      db[modelName].associate(db);
    }
  });
  
  return db;
}

module.exports = { init };
