# Deployment Guide for Vercel

## Prerequisites
1. Make sure you have a Vercel account at [vercel.com](https://vercel.com)
2. Install Vercel CLI: `npm install -g vercel`

## Deployment Steps

### 1. Login to Vercel
```bash
vercel login
```

### 2. Deploy the Project
```bash
vercel --prod
```

### 3. Configuration During Deployment
When prompted, answer the following:
- **Set up and deploy**: `Y` (Yes)
- **Which scope**: Choose your personal account or team
- **Link to existing project**: `N` (No, create new)
- **Project name**: `micedesk-onboarding` (or your preferred name)
- **Directory**: `.` (current directory)

### 4. Environment Variables
After deployment, you'll need to set up environment variables in the Vercel dashboard:

1. Go to your project in Vercel dashboard
2. Navigate to Settings → Environment Variables
3. Add the following variables:
   - `VITE_API_BASE_URL`: Your backend API URL (you'll need to deploy the backend separately)

### 5. Backend Deployment Options

#### Option A: Deploy Backend to Vercel as Serverless Functions
1. Create a new Vercel project for the backend
2. Configure the backend as serverless functions

#### Option B: Deploy Backend to Railway/Render/Heroku
1. Deploy the backend to a service like Railway, Render, or Heroku
2. Update the `VITE_API_BASE_URL` environment variable with the backend URL

#### Option C: Use Vercel's Full-Stack Features
1. Convert backend routes to Vercel serverless functions in `/api` directory

## Project Structure for Vercel
The current configuration in `vercel.json` is set up to:
- Build the frontend from the `frontend/` directory
- Output static files from `frontend/dist`
- Handle client-side routing with rewrites

## Post-Deployment
1. Test the deployed frontend
2. Configure the backend API URL
3. Test the full application functionality

## Troubleshooting
- If build fails, check the build logs in Vercel dashboard
- Ensure all dependencies are listed in `package.json`
- Check that environment variables are properly set 