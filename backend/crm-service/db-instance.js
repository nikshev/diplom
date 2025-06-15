/**
 * Database instance singleton for CRM service
 */

let dbInstance = null;

/**
 * Initialize database instance
 * @returns {Promise<Object>} Database instance
 */
async function initDbInstance() {
  if (!dbInstance) {
    const { init } = require('./models');
    dbInstance = await init();
  }
  return dbInstance;
}

/**
 * Get database instance
 * @returns {Object|null} Database instance or null if not initialized
 */
function getDbInstance() {
  return dbInstance;
}

module.exports = {
  initDbInstance,
  getDbInstance
};
