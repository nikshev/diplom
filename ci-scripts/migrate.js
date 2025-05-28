#!/usr/bin/env node

/**
 * Database migration script for ERP System
 * This script runs database migrations for all services
 * Usage: node migrate.js [environment]
 * Example: node migrate.js production
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Get environment from command line arguments or use development as default
const environment = process.argv[2] || 'development';
console.log(`Running migrations for ${environment} environment`);

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

// Run migrations for each service
services.forEach(service => {
  const serviceDir = path.join(rootDir, 'backend', service);
  
  // Check if service directory exists
  if (!fs.existsSync(serviceDir)) {
    console.error(`Service directory not found: ${serviceDir}`);
    return;
  }
  
  console.log(`Running migrations for ${service}...`);
  
  try {
    // Load service-specific environment variables
    require('dotenv').config({ 
      path: path.join(rootDir, 'config', 'environments', environment, `${service}.env`) 
    });
    
    // Check if this is a Python service or Node.js service
    if (pythonServices.includes(service)) {
      // Run Alembic migration command for Python services
      execSync('cd backend/' + service + ' && python -m alembic upgrade head', {
        cwd: rootDir,
        stdio: 'inherit'
      });
    } else {
      // Run migration command for Node.js services
      // First check if the service has a package.json with a db:migrate script
      const packageJsonPath = path.join(serviceDir, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = require(packageJsonPath);
        if (packageJson.scripts && packageJson.scripts['db:migrate']) {
          execSync('npm run db:migrate', {
            cwd: serviceDir,
            stdio: 'inherit'
          });
        } else {
          // If no db:migrate script, try to run migrations directly
          const migrationsDir = path.join(serviceDir, 'migrations');
          if (fs.existsSync(migrationsDir) && fs.existsSync(path.join(migrationsDir, 'index.js'))) {
            console.log(`Running migrations using migrations/index.js for ${service}...`);
            // Use Node.js to run the migrations
            execSync(`node -e "require('./migrations').migrate().catch(err => { console.error(err); process.exit(1); })"`, {
              cwd: serviceDir,
              stdio: 'inherit'
            });
          } else {
            console.warn(`No migration script found for ${service}, skipping...`);
          }
        }
      } else {
        console.warn(`No package.json found for ${service}, skipping...`);
      }
    }
    
    console.log(`Migrations for ${service} completed successfully`);
  } catch (error) {
    console.error(`Error running migrations for ${service}: ${error.message}`);
    process.exit(1);
  }
});

console.log('All migrations completed successfully');
