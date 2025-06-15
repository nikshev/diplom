/**
 * Database instance singleton for auth service
 */

let dbInstance = null;

/**
 * Set the initialized database instance
 * @param {Object} db - Initialized database object
 */
const setDbInstance = (db) => {
  dbInstance = db;
};

/**
 * Get the initialized database instance
 * @returns {Object} Database object with models
 * @throws {Error} If database is not initialized
 */
const getDbInstance = () => {
  if (!dbInstance) {
    throw new Error('Database not initialized. Make sure to call setDbInstance() first.');
  }
  return dbInstance;
};

/**
 * Check if database is initialized
 * @returns {boolean} True if database is initialized
 */
const isDbInitialized = () => {
  return dbInstance !== null;
};

module.exports = {
  setDbInstance,
  getDbInstance,
  isDbInitialized,
};
