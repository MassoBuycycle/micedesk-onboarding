#!/bin/bash

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
  echo "Creating .env file..."
  npm run create-env
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d node_modules ]; then
  echo "Installing dependencies..."
  npm install
fi

# Build and start the API
echo "Building and starting API..."
npm run build
npm start 