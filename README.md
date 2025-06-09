# Hotel Onboarding Tool

A comprehensive hotel management system with both frontend and backend components.

## Running the Application

You have multiple options to run both the backend and frontend servers simultaneously:

### Option 1: Using Make (Recommended)

We've created a Makefile with useful commands to simplify development.

```bash
# Run both backend and frontend in development mode
make dev

# Build both backend and frontend
make build

# Run in production mode
make start

# Install all dependencies
make install
```

### Option 2: Using the Dev Script

We also provide a simple bash script:

```bash
# First make it executable (only needed once)
chmod +x dev.sh

# Then run it
./dev.sh
```

### Option 3: Manual Method

If you prefer to run the servers manually in separate terminals:

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## Accessing the Application

- Frontend: http://localhost:5173 (or the port shown in the console)
- Backend API: http://localhost:3001 

# Hotel Management System - File Upload Functionality

This document describes the file upload functionality that has been added to the hotel management system.

## Overview

The file upload system allows users to:

1. Upload and manage files for hotels, events, rooms, and F&B
2. Create and manage file types with specific extensions and size limitations
3. Organize files by entity type, entity ID, category, and file type
4. View and download files via pre-signed S3 URLs

## Technical Implementation

### Backend

- Uses AWS S3 for secure, scalable file storage
- PostgreSQL for file metadata and file type definitions
- Express routes for file operations (upload, delete, list)
- Multer and multer-s3 for handling file uploads

### Frontend

- React components for file upload with drag-and-drop
- File browser with download and delete capabilities
- File type management interface
- Progress indicators for uploads

## Configuration

To use the file upload system, you need to set the following environment variables:

```
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_REGION=eu-central-1  # or your preferred region
AWS_S3_BUCKET=micedesk-onboarding  # or your bucket name
```

## File Structure in S3

Files are organized in S3 with the following structure:

```
micedesk-onboarding/
  hotels/
    {hotel_id}/
      {category}/
        {file_type}/
          {timestamp}_{filename}
  events/
    {event_id}/
    ...
```

## Database Schema

Two tables manage the file system:

1. `file_types` - Defines allowable file types and their properties
2. `files` - Stores metadata about uploaded files

## API Endpoints

### File Types

- GET `/api/files/types` - Get all file types
- GET `/api/files/types/category/:category` - Get file types by category
- POST `/api/files/types` - Create a new file type
- PUT `/api/files/types/:id` - Update a file type
- DELETE `/api/files/types/:id` - Delete a file type

### Files

- GET `/api/files/:entityType/:entityId` - Get all files for an entity
- GET `/api/files/:entityType/:entityId/:category` - Get files by category
- POST `/api/files/upload/:entityType/:entityId/:category/:fileTypeCode` - Upload a file
- DELETE `/api/files/id/:fileId` - Delete a file

## Usage

The file upload functionality is accessible through the admin interface at `/admin/files`. 