#!/usr/bin/env node

/**
 * Database migration status script for ERP System
 * This script checks the status of database migrations for all services
 * Usage: node migration-status.js [environment]
 * Example: node migration-status.js production
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Get environment from command line arguments or use development as default
const environment = process.argv[2] || 'development';
console.log(`Checking migration status for ${environment} environment`);

// List of services that require database migrations
const services = [
  'auth-service',
  'order-service',
  'crm-service',
  'inventory-service',
  'finance-service',
  'analytics-service'
];

// Define which services use Python (Alembic) instead of Node.js (Sequelize)
const pythonServices = [
  'analytics-service'
];

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

// Check migration status for each service
services.forEach(service => {
  const serviceDir = path.join(rootDir, 'backend', service);
  
  // Check if service directory exists
  if (!fs.existsSync(serviceDir)) {
    console.error(`Service directory not found: ${serviceDir}`);
    return;
  }
  
  console.log(`\n=== Checking migration status for ${service} ===`);
  
  try {
    // Load service-specific environment variables
    require('dotenv').config({ 
      path: path.join(rootDir, 'config', 'environments', environment, `${service}.env`) 
    });
    
    // Check if this is a Python service or Node.js service
    if (pythonServices.includes(service)) {
      // Run Alembic migration status command for Python services
      console.log(execSync('cd backend/' + service + ' && python -m alembic current', {
        cwd: rootDir,
        encoding: 'utf8'
      }));
      
      console.log(execSync('cd backend/' + service + ' && python -m alembic history --verbose', {
        cwd: rootDir,
        encoding: 'utf8'
      }));
    } else {
      // Check migration status for Node.js services
      // First check if the service has a package.json with a db:status script
      const packageJsonPath = path.join(serviceDir, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = require(packageJsonPath);
        if (packageJson.scripts && packageJson.scripts['db:status']) {
          console.log(execSync('npm run db:status', {
            cwd: serviceDir,
            encoding: 'utf8'
          }));
        } else {
          // If no db:status script, try to run status directly
          const migrationsDir = path.join(serviceDir, 'migrations');
          if (fs.existsSync(migrationsDir) && fs.existsSync(path.join(migrationsDir, 'index.js'))) {
            console.log(`Running migration status using migrations/index.js for ${service}...`);
            // Use Node.js to run the migration status
            console.log(execSync(`node -e "require('./migrations').status().then(status => { console.log(JSON.stringify(status, null, 2)); }).catch(err => { console.error(err); process.exit(1); })"`, {
              cwd: serviceDir,
              encoding: 'utf8'
            }));
          } else {
            console.warn(`No migration status script found for ${service}, skipping...`);
          }
        }
      } else {
        console.warn(`No package.json found for ${service}, skipping...`);
      }
    }
  } catch (error) {
    console.error(`Error checking migration status for ${service}: ${error.message}`);
  }
});

console.log('\nMigration status check completed');
