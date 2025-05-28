#!/bin/bash

# Script to switch between different environment configurations
# Usage: ./switch-env.sh [environment]
# Example: ./switch-env.sh production

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

echo "Switching to $ENV environment..."

# Update docker-compose.yml to use the selected environment
sed -i.bak "s|./config/environments/[a-z]*/|./config/environments/$ENV/|g" "$PROJECT_ROOT/docker-compose.yml"

# Clean up backup file
rm "$PROJECT_ROOT/docker-compose.yml.bak"

echo "✅ Updated docker-compose.yml to use $ENV environment"
echo "You can now run 'docker-compose up' to start the services with $ENV configuration."
