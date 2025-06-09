.PHONY: dev start build install

# Default target - run both in development mode
dev:
	@echo "Starting backend and frontend in development mode..."
	npx concurrently "cd backend && npm run dev" "cd frontend && npm run dev"

# Production mode
start:
	@echo "Starting backend and frontend in production mode..."
	npx concurrently "cd backend && npm start" "cd frontend && npm run preview"

# Build both backend and frontend
build:
	@echo "Building backend..."
	cd backend && npm run build
	@echo "Building frontend..."
	cd frontend && npm run build

# Install all dependencies
install:
	@echo "Installing root dependencies..."
	npm install
	@echo "Installing backend dependencies..."
	cd backend && npm install
	@echo "Installing frontend dependencies..."
	cd frontend && npm install

help:
	@echo "Available commands:"
	@echo "  make dev      - Run both backend and frontend in development mode"
	@echo "  make start    - Run both backend and frontend in production mode"
	@echo "  make build    - Build both backend and frontend"
	@echo "  make install  - Install all dependencies"
