const { getDbInstance } = require('./db-instance');

async function addColumns() {
  try {
    const { sequelize } = await getDbInstance();
    
    // Add company_name column
    await sequelize.query(`
      ALTER TABLE crm_service.customers 
      ADD COLUMN IF NOT EXISTS company_name VARCHAR(255);
    `);
    
    // Add tax_id column
    await sequelize.query(`
      ALTER TABLE crm_service.customers 
      ADD COLUMN IF NOT EXISTS tax_id VARCHAR(50);
    `);
    
    console.log('Columns added successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error adding columns:', error);
    process.exit(1);
  }
}

addColumns();
