# 🚀 Production Deployment Guide

This guide will walk you through deploying your Onboarding Tool with:
- **Backend**: Railway (Node.js + MySQL)
- **Frontend**: Vercel (React/Vite)

---

## 📋 Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
3. **GitHub Repository**: Push your code to GitHub
4. **AWS Account**: For S3 file uploads (optional)

---

## 🚂 Part 1: Backend Deployment on Railway

### Step 1.1: Create Railway Project

1. **Login to Railway**: Go to [railway.app](https://railway.app) and sign in
2. **New Project**: Click "New Project"
3. **Deploy from GitHub**: Select "Deploy from GitHub repo"
4. **Connect Repository**: Connect your GitHub repository
5. **Select Root Path**: Set root path to `backend/`

### Step 1.2: Add MySQL Database

1. **Add Service**: In your Railway project, click "New"
2. **Add Database**: Select "MySQL"
3. **Wait for Deployment**: Railway will provision your MySQL instance
4. **Note Connection Details**: Railway will auto-generate connection variables

### Step 1.3: Configure Environment Variables

In Railway project settings, add these environment variables:

```bash
# Database (Railway auto-populates these)
DB_HOST=${{MySQL.MYSQL_HOST}}
DB_USER=${{MySQL.MYSQL_USER}}  
DB_PASSWORD=${{MySQL.MYSQL_PASSWORD}}
DB_NAME=${{MySQL.MYSQL_DATABASE}}
TABLE_PREFIX=onboarding_

# Server Configuration
PORT=3001
NODE_ENV=production

# CORS (Update after frontend deployment)
CORS_ORIGIN=https://your-app-name.vercel.app

# Security
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
ENCRYPTION_KEY=exactly-32-character-encryption-key

# AWS S3 (for file uploads)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
S3_BUCKET_NAME=your-s3-bucket-name
```

### Step 1.4: Deploy Database Schema

1. **Access Railway MySQL**: Use Railway's built-in database client
2. **Connect to MySQL**: Copy connection string from Railway dashboard
3. **Run Schema Script**:
   ```bash
   mysql -h your-host -u your-user -p your-database < backend/src/db/onboarding_full_schema.sql
   ```
   
   Or using Railway CLI:
   ```bash
   railway connect mysql
   source backend/src/db/onboarding_full_schema.sql
   ```

### Step 1.5: Test Backend Deployment

1. **Get Backend URL**: Copy the generated Railway URL (e.g., `https://your-app.railway.app`)
2. **Test Health Check**: Visit `https://your-app.railway.app/health`
3. **Expected Response**: `{"status":"ok"}`

---

## 🌐 Part 2: Frontend Deployment on Vercel

### Step 2.1: Prepare Frontend Configuration

Update the API base URL to point to your Railway backend:

1. **Create Production Environment**: Create `frontend/.env.production`
   ```bash
   VITE_API_BASE_URL=https://your-railway-app.railway.app/api
   VITE_API_LOGGING_ENABLED=false
   ```

### Step 2.2: Update Vercel Configuration

The project already has `vercel.json` configured. Verify it looks like this:

```json
{
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/dist",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Step 2.3: Deploy to Vercel

**Option A: Vercel Dashboard (Recommended)**
1. **Login to Vercel**: Go to [vercel.com](https://vercel.com)
2. **New Project**: Click "Add New..." → "Project"
3. **Import Repository**: Select your GitHub repository
4. **Configure Project**: 
   - **Framework Preset**: Vite
   - **Root Directory**: `.` (project root)
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Output Directory**: `frontend/dist`

**Option B: Vercel CLI**
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy from project root
vercel --prod
```

### Step 2.4: Configure Environment Variables in Vercel

1. **Project Settings**: Go to your Vercel project → Settings → Environment Variables
2. **Add Variables**:
   ```
   VITE_API_BASE_URL = https://your-railway-app.railway.app/api
   VITE_API_LOGGING_ENABLED = false
   ```
3. **Redeploy**: Trigger a new deployment to apply environment variables

---

## 🔗 Part 3: Connect Frontend to Backend

### Step 3.1: Update CORS in Railway

1. **Go to Railway Project**: Open your backend project
2. **Environment Variables**: Update `CORS_ORIGIN`
   ```
   CORS_ORIGIN=https://your-vercel-app.vercel.app
   ```
3. **Redeploy**: Railway will auto-redeploy with new environment

### Step 3.2: Test Full Integration

1. **Visit Frontend**: Go to your Vercel app URL
2. **Test API Calls**: Try logging in, creating hotels, etc.
3. **Check Network Tab**: Ensure API calls reach Railway backend
4. **Verify Database**: Check Railway MySQL for data persistence

---

## 🔐 Part 4: Security & Production Setup

### Step 4.1: Secure Environment Variables

**Strong JWT Secret** (32+ characters):
```bash
openssl rand -base64 32
```

**Encryption Key** (exactly 32 characters):
```bash
openssl rand -hex 16
```

### Step 4.2: Set Up AWS S3 (for file uploads)

1. **Create S3 Bucket**: In AWS Console
2. **Configure CORS**: Allow requests from your domain
3. **Create IAM User**: With S3 permissions
4. **Add Credentials**: To Railway environment variables

### Step 4.3: Database Backups

1. **Railway Backups**: Enable automatic backups in Railway MySQL settings
2. **Manual Backup**: 
   ```bash
   railway connect mysql
   mysqldump > backup-$(date +%Y%m%d).sql
   ```

---

## 🚨 Part 5: Troubleshooting

### Common Issues:

**Backend Won't Start**
- Check Railway logs: `railway logs`
- Verify environment variables are set
- Ensure database connection is working

**Frontend API Errors**
- Verify `VITE_API_BASE_URL` in Vercel
- Check CORS settings in Railway
- Test backend endpoints directly

**Database Connection Issues**
- Confirm Railway MySQL is running
- Verify connection string format
- Check if schema was properly imported

**File Upload Issues**
- Verify AWS credentials
- Check S3 bucket permissions
- Ensure CORS is configured on S3

---

## 🎯 Part 6: Final Verification Checklist

- [ ] ✅ Backend deployed to Railway
- [ ] ✅ MySQL database created and schema imported
- [ ] ✅ All environment variables configured in Railway
- [ ] ✅ Frontend deployed to Vercel
- [ ] ✅ Environment variables configured in Vercel
- [ ] ✅ CORS properly configured
- [ ] ✅ API endpoints responding correctly
- [ ] ✅ Frontend can connect to backend
- [ ] ✅ Database operations working
- [ ] ✅ File uploads working (if AWS S3 configured)
- [ ] ✅ Authentication flow working

---

## 📞 Support

If you encounter issues:
1. Check Railway logs: `railway logs`
2. Check Vercel function logs in dashboard
3. Verify all environment variables
4. Test endpoints individually
5. Check browser network tab for API calls

**Your Production URLs:**
- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-app.railway.app`
- Database: Managed by Railway

---

## 🔄 Continuous Deployment

Both Railway and Vercel will automatically redeploy when you push to your main branch:
- **Railway**: Redeploys backend on `backend/` changes
- **Vercel**: Redeploys frontend on any changes

**Happy Deploying! 🚀** 