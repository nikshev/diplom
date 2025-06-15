'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      { tableName: 'customers', schema: 'crm_service' },
      'company_name',
      {
        type: Sequelize.STRING(255),
        allowNull: true
      }
    );

    await queryInterface.addColumn(
      { tableName: 'customers', schema: 'crm_service' },
      'tax_id',
      {
        type: Sequelize.STRING(50),
        allowNull: true
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn(
      { tableName: 'customers', schema: 'crm_service' },
      'company_name'
    );

    await queryInterface.removeColumn(
      { tableName: 'customers', schema: 'crm_service' },
      'tax_id'
    );
  }
};
