#!/usr/bin/env node

/**
 * Smoke tests for ERP System
 * This script runs basic smoke tests to verify that all services are running correctly
 * Usage: node smoke-tests.js [environment]
 * Example: node smoke-tests.js production
 */

const axios = require('axios');
const path = require('path');
const fs = require('fs');

// Get environment from command line arguments or use development as default
const environment = process.argv[2] || 'development';
console.log(`Running smoke tests for ${environment} environment`);

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

// Define service endpoints to test
const services = [
  { name: 'API Gateway', url: process.env.API_GATEWAY_URL || 'http://localhost:8000/health' },
  { name: 'Auth Service', url: process.env.AUTH_SERVICE_URL || 'http://localhost:8001/health' },
  { name: 'Order Service', url: process.env.ORDER_SERVICE_URL || 'http://localhost:8002/health' },
  { name: 'CRM Service', url: process.env.CRM_SERVICE_URL || 'http://localhost:8003/health' },
  { name: 'Inventory Service', url: process.env.INVENTORY_SERVICE_URL || 'http://localhost:8004/health' },
  { name: 'Finance Service', url: process.env.FINANCE_SERVICE_URL || 'http://localhost:8005/health' },
  { name: 'Analytics Service', url: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:8006/health' }
];

// Run smoke tests for each service
async function runSmokeTests() {
  let failedTests = 0;
  
  for (const service of services) {
    try {
      console.log(`Testing ${service.name} at ${service.url}...`);
      
      const response = await axios.get(service.url, { timeout: 5000 });
      
      if (response.status === 200 && response.data.status === 'ok') {
        console.log(`✅ ${service.name} is healthy`);
      } else {
        console.error(`❌ ${service.name} returned unexpected response: ${JSON.stringify(response.data)}`);
        failedTests++;
      }
    } catch (error) {
      console.error(`❌ ${service.name} health check failed: ${error.message}`);
      failedTests++;
    }
  }
  
  // Test authentication flow
  try {
    console.log('Testing authentication flow...');
    
    const authUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:8001';
    
    // Test login endpoint
    const loginResponse = await axios.post(`${authUrl}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    }, { timeout: 5000 });
    
    if (loginResponse.status === 200 && loginResponse.data.token) {
      console.log('✅ Authentication flow is working');
    } else {
      console.error(`❌ Authentication flow returned unexpected response: ${JSON.stringify(loginResponse.data)}`);
      failedTests++;
    }
  } catch (error) {
    console.error(`❌ Authentication flow test failed: ${error.message}`);
    failedTests++;
  }
  
  // Summary
  if (failedTests === 0) {
    console.log('🎉 All smoke tests passed!');
    return 0;
  } else {
    console.error(`❌ ${failedTests} smoke tests failed`);
    return 1;
  }
}

// Run tests and exit with appropriate code
runSmokeTests()
  .then(exitCode => {
    process.exit(exitCode);
  })
  .catch(error => {
    console.error(`Error running smoke tests: ${error.message}`);
    process.exit(1);
  });
