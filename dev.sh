#!/bin/bash

echo "Starting backend and frontend servers..."
npx concurrently "cd backend && npm run dev" "cd frontend && npm run dev"
