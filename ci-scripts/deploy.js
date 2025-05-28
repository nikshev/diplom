#!/usr/bin/env node

/**
 * Deployment script for ERP System
 * This script handles deployment to Railway for different environments
 * Usage: node deploy.js [environment]
 * Example: node deploy.js production
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Get environment from command line arguments or use development as default
const environment = process.argv[2] || 'development';
console.log(`Deploying to ${environment} environment`);

// Root directory of the project
const rootDir = path.resolve(__dirname, '..');

// Check if Railway CLI is installed
try {
  execSync('railway --version', { stdio: 'ignore' });
} catch (error) {
  console.error('Railway CLI is not installed. Please install it with: npm install -g @railway/cli');
  process.exit(1);
}

// Check if RAILWAY_TOKEN is set
if (!process.env.RAILWAY_TOKEN) {
  console.error('RAILWAY_TOKEN environment variable is not set');
  process.exit(1);
}

// Deploy services to Railway
try {
  console.log(`Deploying services to Railway (${environment})...`);
  
  // Run Railway up command with environment
  execSync(`railway up --environment ${environment}`, {
    stdio: 'inherit',
    env: {
      ...process.env,
      RAILWAY_TOKEN: process.env.RAILWAY_TOKEN
    }
  });
  
  console.log('Deployment completed successfully');
} catch (error) {
  console.error(`Deployment failed: ${error.message}`);
  process.exit(1);
}

// Run database migrations
try {
  console.log('Running database migrations...');
  
  execSync(`node ${path.join(rootDir, 'ci-scripts', 'migrate.js')} ${environment}`, {
    stdio: 'inherit'
  });
  
  console.log('Database migrations completed successfully');
} catch (error) {
  console.error(`Database migrations failed: ${error.message}`);
  process.exit(1);
}

// Run smoke tests
try {
  console.log('Running smoke tests...');
  
  execSync(`node ${path.join(rootDir, 'ci-scripts', 'smoke-tests.js')} ${environment}`, {
    stdio: 'inherit'
  });
  
  console.log('Smoke tests completed successfully');
} catch (error) {
  console.error(`Smoke tests failed: ${error.message}`);
  
  // Rollback deployment if smoke tests fail
  console.log('Rolling back deployment...');
  
  try {
    execSync(`railway rollback --environment ${environment}`, {
      stdio: 'inherit',
      env: {
        ...process.env,
        RAILWAY_TOKEN: process.env.RAILWAY_TOKEN
      }
    });
    
    console.log('Rollback completed successfully');
  } catch (rollbackError) {
    console.error(`Rollback failed: ${rollbackError.message}`);
  }
  
  process.exit(1);
}

console.log(`🚀 Deployment to ${environment} completed successfully!`);
