# 🚀 Deployment Guide

Deploy your Onboarding Tool with:
- **Frontend**: Vercel (React/Vite)
- **Backend**: Railway (Node.js/Express)
- **Database**: Your existing database (accessed directly, not via SSH)

---

## 📋 Prerequisites

1. **Accounts**: [Railway](https://railway.app) + [Vercel](https://vercel.com)
2. **Code**: Push your code to GitHub
3. **Database**: Your existing MySQL database
4. **Optional**: AWS S3 for file uploads

---

## 🚀 Quick Setup

### 1. Generate Environment Files

```bash
npm run setup
```

This creates:
- `frontend/.env.production` (for Vercel)  
- `backend/.env.production.example` (for Railway)
- Secure JWT and encryption keys

### 2. Configure Database Access

**⚠️ Important**: Railway cannot use SSH tunnels. Configure your database for direct connections:

```bash
# SSH into your database server
ssh your-user@your-database-server

# Edit MySQL config to allow external connections
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
# Comment out: bind-address = 127.0.0.1

# Restart MySQL
sudo systemctl restart mysql

# Create dedicated user for Railway
mysql -u root -p
```

```sql
CREATE USER 'onboarding_app'@'%' IDENTIFIED BY 'secure-password';
GRANT SELECT, INSERT, UPDATE, DELETE ON your_database.onboarding_* TO 'onboarding_app'@'%';
FLUSH PRIVILEGES;
```

```bash
# Configure firewall (allow Railway IPs only - check Railway docs)
sudo ufw allow from railway-ip-range to any port 3306
```

### 3. Deploy Database Schema

```bash
# Import schema to your database
mysql -u root -p your_database < backend/src/db/onboarding_full_schema.sql
```

### 4. Deploy Backend to Railway

1. **Create Project**: [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. **Configure**: 
   - Repository: Your GitHub repo
   - Root Path: `backend/`
3. **Environment Variables**: Copy from `backend/.env.production.example`:

```bash
# Database (update with YOUR details)
DB_HOST=your-database-server-ip
DB_PORT=3306
DB_USER=onboarding_app
DB_PASSWORD=secure-password
DB_NAME=your_database_name
TABLE_PREFIX=onboarding_

# Server
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://your-app.vercel.app

# Security (from setup script output)
JWT_SECRET=your-generated-jwt-secret
ENCRYPTION_KEY=your-generated-encryption-key

# Optional: AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
S3_BUCKET_NAME=your-bucket
```

4. **Test**: Visit `https://your-railway-app.railway.app/health`

### 5. Deploy Frontend to Vercel

1. **Create Project**: [vercel.com](https://vercel.com) → New Project → Import from GitHub
2. **Configure**:
   - Framework: Vite
   - Build Command: `cd frontend && npm install && npm run build`
   - Output Directory: `frontend/dist`
3. **Environment Variables**:

```bash
VITE_API_BASE_URL=https://your-railway-app.railway.app/api
VITE_API_LOGGING_ENABLED=false
```

### 6. Connect Frontend ↔ Backend

Update Railway CORS with your Vercel URL:
```bash
CORS_ORIGIN=https://your-vercel-app.vercel.app
```

---

## 🔐 Security Checklist

- [ ] Database user has minimal permissions (only `onboarding_*` tables)
- [ ] Firewall allows only Railway IPs  
- [ ] Strong passwords for database user
- [ ] SSL/TLS enabled for database connections
- [ ] Environment variables properly secured

---

## 🚨 Troubleshooting

### Database Connection Issues
```bash
# Check Railway logs
railway logs

# Test database connectivity from Railway
# Use Railway's console to test: mysql -h host -u user -p
```

### Common Problems

**Railway can't connect to database**
- Verify database accepts external connections
- Check firewall rules allow Railway IPs
- Ensure database user has remote access permissions
- Test with Railway's IP ranges

**Frontend can't reach backend**
- Verify `VITE_API_BASE_URL` in Vercel settings
- Check CORS configuration in Railway
- Test API endpoints directly

**Build failures**
- Check logs in Railway/Vercel dashboards
- Verify all environment variables are set
- Ensure Node.js version compatibility

---

## 📊 Architecture Overview

```
User Browser
    ↓ HTTPS
Frontend (Vercel)
    ↓ API calls 
Backend (Railway)
    ↓ Direct MySQL
Your Database Server
```

**Flow**:
1. User interacts with frontend on Vercel
2. Frontend makes API calls to Railway backend
3. Backend connects directly to your database
4. Data flows back through the chain

---

## 🔄 Continuous Deployment

- **Railway**: Auto-deploys on `backend/` changes
- **Vercel**: Auto-deploys on any changes
- **Database**: Schema updates require manual migration

---

## 📞 Support

**Production URLs**:
- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-app.railway.app`
- Health Check: `https://your-app.railway.app/health`

**Monitoring**:
- Railway logs: `railway logs`
- Vercel logs: Vercel dashboard → Functions tab
- Database: Your existing monitoring setup

---

## 🎯 Deployment Checklist

### Database Setup
- [ ] SSH into database server
- [ ] Configure MySQL for external connections
- [ ] Create dedicated `onboarding_app` user
- [ ] Import `onboarding_full_schema.sql`
- [ ] Configure firewall for Railway IPs

### Railway (Backend)
- [ ] Create Railway project from GitHub
- [ ] Set root path to `backend/`
- [ ] Add all environment variables
- [ ] Verify `/health` endpoint works
- [ ] Check logs for any errors

### Vercel (Frontend)  
- [ ] Create Vercel project from GitHub
- [ ] Configure build settings
- [ ] Add environment variables
- [ ] Verify frontend loads correctly

### Integration
- [ ] Update CORS in Railway with Vercel URL
- [ ] Test frontend → backend API calls
- [ ] Verify database operations work
- [ ] Test authentication flow
- [ ] Confirm data persistence

### Security
- [ ] Database user permissions are minimal
- [ ] Firewall configured correctly
- [ ] Strong passwords in use
- [ ] SSL/TLS enabled where possible

**🎉 You're live!** Both services auto-deploy on code changes. 

---

## 🛡️ Railway Reliability Settings (Prevent random unresponsiveness)

Configure these in your Railway service to keep the backend stable:

### Health checks
- Health Check Path: `/ready` (ensures DB connectivity)
- Expect status: 200-299
- Railway will only mark deployments healthy once this returns OK. Unhealthy services auto-restart.

### Restart policy and scale
- Restart Policy: On Failure (default) or Always (both are fine with health checks enabled)
- Min Instances: 1

### Prevent sleeping/idle shutdowns
- Free/dev plans may sleep on inactivity. To avoid:
  - Use a paid plan, or
  - Set an external uptime monitor (e.g., UptimeRobot) to ping `/health` every 5 minutes.

### Environment variables for stability
Add these in Railway → Variables (matching the new backend hardening):

```bash
# DB connection hardening
DB_CONNECT_TIMEOUT_MS=10000
DB_KEEPALIVE=true
DB_KEEPALIVE_INTERVAL_MS=45000
DB_KEEPALIVE_DELAY_MS=10000

# Server
NODE_ENV=production
PORT=3001
```

### Graceful shutdown
The server handles `SIGTERM`/`SIGINT`, finishes in-flight requests, closes the DB pool, then exits. Railway will roll to a new instance automatically on deploys.

### Timeouts
HTTP keep-alive, headers, and request timeouts are set in code to prevent slowloris/hanging requests. If you use a custom proxy in front of Railway, align its timeouts with:
- keepAliveTimeout ≈ 61s
- headersTimeout ≈ 65s
- requestTimeout ≈ 30s

### Monitoring & alerts
- Add a monitor to `/ready` to catch DB outages early.
- Enable Railway notifications to Slack/Discord for deploy failures and restarts.
- Use `railway logs` to inspect incidents.

### Troubleshooting unresponsive service
- Check `/health` (process up) vs `/ready` (process + DB ready).
- If `/health` is OK but `/ready` fails: investigate database connectivity, credentials, or firewall.
- Review recent deploys and logs for OOM or unhandled exceptions.