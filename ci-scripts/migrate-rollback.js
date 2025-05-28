#!/usr/bin/env node

/**
 * Database migration rollback script for ERP System
 * This script rolls back database migrations for all services or a specific service
 * Usage: node migrate-rollback.js [environment] [service] [steps]
 * Example: node migrate-rollback.js development auth-service 1
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Get environment from command line arguments or use development as default
const environment = process.argv[2] || 'development';
// Get specific service to rollback (optional)
const specificService = process.argv[3];
// Get number of steps to rollback (optional, default: 1)
const steps = process.argv[4] || 1;

console.log(`Rolling back migrations for ${environment} environment${specificService ? ` (service: ${specificService})` : ''}, steps: ${steps}`);

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

// Filter services if a specific service is provided
const servicesToRollback = specificService 
  ? services.filter(service => service === specificService)
  : services;

// Check if the specified service exists
if (specificService && !services.includes(specificService)) {
  console.error(`Error: Service '${specificService}' not found. Available services: ${services.join(', ')}`);
  process.exit(1);
}

// Load environment variables for the specified environment
try {
  require('dotenv').config({ 
    path: path.join(rootDir, 'config', 'environments', environment, 'api-gateway.env') 
  });
} catch (error) {
  console.error(`Error loading environment variables: ${error.message}`);
  process.exit(1);
}

// Rollback migrations for each service
servicesToRollback.forEach(service => {
  const serviceDir = path.join(rootDir, 'backend', service);
  
  // Check if service directory exists
  if (!fs.existsSync(serviceDir)) {
    console.error(`Service directory not found: ${serviceDir}`);
    return;
  }
  
  console.log(`\nRolling back migrations for ${service}...`);
  
  try {
    // Load service-specific environment variables
    require('dotenv').config({ 
      path: path.join(rootDir, 'config', 'environments', environment, `${service}.env`) 
    });
    
    // Check if this is a Python service or Node.js service
    if (pythonServices.includes(service)) {
      // Run Alembic migration rollback command for Python services
      execSync(`cd backend/${service} && python -m alembic downgrade -${steps}`, {
        cwd: rootDir,
        stdio: 'inherit'
      });
    } else {
      // Run rollback command for Node.js services
      // First check if the service has a package.json with a db:rollback script
      const packageJsonPath = path.join(serviceDir, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = require(packageJsonPath);
        if (packageJson.scripts && packageJson.scripts['db:rollback']) {
          execSync(`npm run db:rollback -- --steps=${steps}`, {
            cwd: serviceDir,
            stdio: 'inherit'
          });
        } else {
          // If no db:rollback script, try to run rollback directly
          const migrationsDir = path.join(serviceDir, 'migrations');
          if (fs.existsSync(migrationsDir) && fs.existsSync(path.join(migrationsDir, 'index.js'))) {
            console.log(`Running rollback using migrations/index.js for ${service}...`);
            // Use Node.js to run the rollback
            execSync(`node -e "require('./migrations').rollback({steps: ${steps}}).catch(err => { console.error(err); process.exit(1); })"`, {
              cwd: serviceDir,
              stdio: 'inherit'
            });
          } else {
            console.warn(`No rollback script found for ${service}, skipping...`);
          }
        }
      } else {
        console.warn(`No package.json found for ${service}, skipping...`);
      }
    }
    
    console.log(`Rollback for ${service} completed successfully`);
  } catch (error) {
    console.error(`Error rolling back migrations for ${service}: ${error.message}`);
    process.exit(1);
  }
});

console.log('\nAll rollbacks completed successfully');
