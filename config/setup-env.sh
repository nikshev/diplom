#!/bin/bash

# Script to set up environment configuration for the ERP system
# Usage: ./setup-env.sh [environment]
# Example: ./setup-env.sh development

# Set default environment to development if not specified
ENV=${1:-development}

# Check if the environment is valid
if [ "$ENV" != "development" ] && [ "$ENV" != "testing" ] && [ "$ENV" != "production" ]; then
  echo "Error: Invalid environment. Choose from: development, testing, production"
  exit 1
fi

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "Setting up $ENV environment..."

# Create .env files for each service
services=("api-gateway" "auth-service" "order-service" "crm-service" "inventory-service" "finance-service" "analytics-service" "frontend")

for service in "${services[@]}"; do
  # Source environment file
  ENV_FILE="$SCRIPT_DIR/environments/$ENV/$service.env"
  
  # Target .env file in the service directory
  if [ "$service" == "frontend" ]; then
    TARGET_DIR="$PROJECT_ROOT/frontend"
  else
    TARGET_DIR="$PROJECT_ROOT/backend/$service"
  fi
  
  # Create .env file
  if [ -f "$ENV_FILE" ]; then
    echo "Creating .env file for $service..."
    cp "$ENV_FILE" "$TARGET_DIR/.env"
    echo "✅ Created $TARGET_DIR/.env"
  else
    echo "⚠️ Warning: Environment file for $service not found at $ENV_FILE"
  fi
done

echo "Environment setup complete for $ENV!"
echo "You can now run 'docker-compose up' to start the services."
