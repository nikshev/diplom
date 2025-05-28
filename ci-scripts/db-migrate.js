#!/usr/bin/env node

/**
 * Database migration script for ERP System
 * This script runs database migrations for a specific service or all services
 * Usage: node db-migrate.js [service] [command] [options]
 * Example: node db-migrate.js auth-service up
 * Example: node db-migrate.js all up
 */

const path = require('path');
const fs = require('fs');

// Root directory of the project
const rootDir = path.resolve(__dirname, '..');

// Available services with migrations
const services = [
  'auth-service',
  'order-service',
  'crm-service',
  'inventory-service',
  'finance-service'
];

// Available commands
const commands = ['up', 'down', 'status', 'create'];

// Parse command line arguments
const args = process.argv.slice(2);
const service = args[0] || 'all';
const command = args[1] || 'up';
const options = args.slice(2);

// Validate service
if (service !== 'all' && !services.includes(service)) {
  console.error(`Invalid service: ${service}`);
  console.error(`Available services: ${services.join(', ')} or 'all'`);
  process.exit(1);
}

// Validate command
if (!commands.includes(command)) {
  console.error(`Invalid command: ${command}`);
  console.error(`Available commands: ${commands.join(', ')}`);
  process.exit(1);
}

// Run migrations for a specific service
async function runServiceMigrations(serviceName) {
  try {
    const migrationsPath = path.join(rootDir, 'backend', serviceName, 'migrations');
    
    // Check if migrations directory exists
    if (!fs.existsSync(migrationsPath)) {
      console.error(`Migrations directory not found for service: ${serviceName}`);
      return false;
    }
    
    // Import migrations module
    const migrations = require(path.join(migrationsPath, 'index.js'));
    
    console.log(`Running '${command}' for service: ${serviceName}`);
    
    // Execute command
    switch (command) {
      case 'up':
        const executed = await migrations.migrate();
        console.log(`Executed ${executed.length} migrations for ${serviceName}`);
        break;
      case 'down':
        const count = options[0] ? parseInt(options[0], 10) : 1;
        const rolledBack = await migrations.rollback({ count });
        console.log(`Rolled back ${rolledBack.length} migrations for ${serviceName}`);
        break;
      case 'status':
        const status = await migrations.status();
        console.log(`Migration status for ${serviceName}:`);
        console.log(`- Executed: ${status.executedCount}`);
        console.log(`- Pending: ${status.pendingCount}`);
        break;
      case 'create':
        const name = options[0];
        if (!name) {
          console.error('Migration name is required for create command');
          return false;
        }
        const filePath = migrations.create(name);
        console.log(`Created migration file: ${filePath}`);
        break;
    }
    
    return true;
  } catch (error) {
    console.error(`Error running migrations for ${serviceName}:`, error);
    return false;
  }
}

// Run migrations for all services
async function runAllMigrations() {
  let success = true;
  
  for (const serviceName of services) {
    const result = await runServiceMigrations(serviceName);
    success = success && result;
  }
  
  return success;
}

// Main function
async function main() {
  try {
    // Load environment variables
    require('dotenv').config();
    
    // Run migrations
    let success;
    
    if (service === 'all') {
      success = await runAllMigrations();
    } else {
      success = await runServiceMigrations(service);
    }
    
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  }
}

// Run main function
main();
