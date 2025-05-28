#!/usr/bin/env node

/**
 * Database maintenance script for ERP System
 * This script performs maintenance operations on the PostgreSQL database
 * Usage: node db-maintenance.js [environment] [operation]
 * Operations: vacuum, reindex, analyze, all (default)
 * Example: node db-maintenance.js production vacuum
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Get environment from command line arguments or use development as default
const environment = process.argv[2] || 'development';
// Get operation to perform (vacuum, reindex, analyze, all)
const operation = process.argv[3] || 'all';

console.log(`Performing database maintenance (${operation}) for ${environment} environment`);

// Root directory of the project
const rootDir = path.resolve(__dirname, '..');

// Load environment variables for the specified environment
try {
  require('dotenv').config({ 
    path: path.join(rootDir, 'config', 'environments', environment, 'api-gateway.env') 
  });
} catch (error) {
  console.error(`Error loading environment variables: ${error.message}`);
  process.exit(1);
}

// Database connection parameters
const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = process.env.DB_PORT || '5432';
const dbName = process.env.DB_NAME || 'erp_system';
const dbUser = process.env.DB_USER || 'postgres';
const dbPassword = process.env.DB_PASSWORD || 'postgres';

// Connection string for psql commands
const connectionString = `postgresql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`;

// List of schemas to maintain
const schemas = [
  'auth_service',
  'order_service',
  'crm_service',
  'inventory_service',
  'finance_service',
  'analytics_service'
];

// Perform vacuum operation
function performVacuum() {
  console.log('\n=== Performing VACUUM ===');
  
  try {
    // Vacuum the entire database
    console.log('Vacuuming entire database...');
    execSync(`PGPASSWORD=${dbPassword} psql -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -c "VACUUM;"`, {
      stdio: 'inherit'
    });
    
    // Vacuum each schema separately
    schemas.forEach(schema => {
      console.log(`\nVacuuming ${schema} schema...`);
      
      // Get list of tables in the schema
      const tablesResult = execSync(
        `PGPASSWORD=${dbPassword} psql -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -t -c "SELECT tablename FROM pg_tables WHERE schemaname = '${schema}';"`,
        { encoding: 'utf8' }
      );
      
      // Split result into lines and remove empty lines
      const tables = tablesResult.split('\n')
        .map(table => table.trim())
        .filter(table => table.length > 0);
      
      // Vacuum each table
      tables.forEach(table => {
        console.log(`Vacuuming ${schema}.${table}...`);
        execSync(
          `PGPASSWORD=${dbPassword} psql -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -c "VACUUM ${schema}.${table};"`,
          { stdio: 'inherit' }
        );
      });
    });
    
    console.log('\nVACUUM completed successfully');
  } catch (error) {
    console.error(`Error performing VACUUM: ${error.message}`);
    process.exit(1);
  }
}

// Perform analyze operation
function performAnalyze() {
  console.log('\n=== Performing ANALYZE ===');
  
  try {
    // Analyze the entire database
    console.log('Analyzing entire database...');
    execSync(`PGPASSWORD=${dbPassword} psql -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -c "ANALYZE;"`, {
      stdio: 'inherit'
    });
    
    // Analyze each schema separately
    schemas.forEach(schema => {
      console.log(`\nAnalyzing ${schema} schema...`);
      
      // Get list of tables in the schema
      const tablesResult = execSync(
        `PGPASSWORD=${dbPassword} psql -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -t -c "SELECT tablename FROM pg_tables WHERE schemaname = '${schema}';"`,
        { encoding: 'utf8' }
      );
      
      // Split result into lines and remove empty lines
      const tables = tablesResult.split('\n')
        .map(table => table.trim())
        .filter(table => table.length > 0);
      
      // Analyze each table
      tables.forEach(table => {
        console.log(`Analyzing ${schema}.${table}...`);
        execSync(
          `PGPASSWORD=${dbPassword} psql -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -c "ANALYZE ${schema}.${table};"`,
          { stdio: 'inherit' }
        );
      });
    });
    
    console.log('\nANALYZE completed successfully');
  } catch (error) {
    console.error(`Error performing ANALYZE: ${error.message}`);
    process.exit(1);
  }
}

// Perform reindex operation
function performReindex() {
  console.log('\n=== Performing REINDEX ===');
  
  try {
    // Reindex each schema separately
    schemas.forEach(schema => {
      console.log(`\nReindexing ${schema} schema...`);
      
      // Get list of indexes in the schema
      const indexesResult = execSync(
        `PGPASSWORD=${dbPassword} psql -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -t -c "SELECT indexname FROM pg_indexes WHERE schemaname = '${schema}';"`,
        { encoding: 'utf8' }
      );
      
      // Split result into lines and remove empty lines
      const indexes = indexesResult.split('\n')
        .map(index => index.trim())
        .filter(index => index.length > 0);
      
      // Reindex each index
      indexes.forEach(index => {
        console.log(`Reindexing ${schema}.${index}...`);
        execSync(
          `PGPASSWORD=${dbPassword} psql -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -c "REINDEX INDEX ${schema}.${index};"`,
          { stdio: 'inherit' }
        );
      });
    });
    
    console.log('\nREINDEX completed successfully');
  } catch (error) {
    console.error(`Error performing REINDEX: ${error.message}`);
    process.exit(1);
  }
}

// Perform database backup
function performBackup() {
  console.log('\n=== Performing BACKUP ===');
  
  try {
    // Create backups directory if it doesn't exist
    const backupsDir = path.join(rootDir, 'backups');
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true });
    }
    
    // Create timestamp for backup filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupsDir, `${dbName}_${environment}_${timestamp}.dump`);
    
    // Perform backup
    console.log(`Creating backup to ${backupFile}...`);
    execSync(
      `PGPASSWORD=${dbPassword} pg_dump -h ${dbHost} -p ${dbPort} -U ${dbUser} -F c -f "${backupFile}" ${dbName}`,
      { stdio: 'inherit' }
    );
    
    console.log('\nBACKUP completed successfully');
  } catch (error) {
    console.error(`Error performing BACKUP: ${error.message}`);
    process.exit(1);
  }
}

// Perform maintenance operations based on the specified operation
switch (operation.toLowerCase()) {
  case 'vacuum':
    performVacuum();
    break;
  case 'analyze':
    performAnalyze();
    break;
  case 'reindex':
    performReindex();
    break;
  case 'backup':
    performBackup();
    break;
  case 'all':
    performVacuum();
    performAnalyze();
    performReindex();
    performBackup();
    break;
  default:
    console.error(`Unknown operation: ${operation}`);
    console.error('Available operations: vacuum, analyze, reindex, backup, all');
    process.exit(1);
}

console.log('\nDatabase maintenance completed successfully');
