/**
 * Models index file for Analytics Service
 */

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const config = require('../config');
const logger = require('../config/logger');

const basename = path.basename(__filename);
const db = {};

// Create Sequelize instance
const sequelize = new Sequelize(
  config.database.name,
  config.database.username,
  config.database.password,
  {
    host: config.database.host,
    port: config.database.port,
    dialect: 'postgres',
    logging: (msg) => logger.debug(msg),
    define: {
      underscored: true,
      timestamps: true,
    },
  }
);

// Load models
fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js'
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });

// Associate models
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Add Sequelize and sequelize to db
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
