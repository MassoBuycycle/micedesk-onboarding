#!/bin/bash

echo "🚀 Setting up deployment environment for Onboarding Tool..."
echo "Architecture: Frontend (Vercel) + Backend (Railway) + Your Database"
echo ""

# Generate secure keys
JWT_SECRET=$(openssl rand -base64 32)
ENCRYPTION_KEY=$(openssl rand -hex 16)

echo "🔐 Generated secure keys:"
echo "JWT_SECRET: $JWT_SECRET"
echo "ENCRYPTION_KEY: $ENCRYPTION_KEY"
echo ""

# Create frontend production env
cat > frontend/.env.production << EOF
# Production API Configuration
VITE_API_BASE_URL=https://your-railway-app.railway.app/api
VITE_API_LOGGING_ENABLED=false

# NOTE: Replace 'your-railway-app' with your actual Railway app name
EOF

echo "✅ Created frontend/.env.production"

# Create Railway environment template with generated keys
cat > backend/.env.production.example << EOF
# Database Configuration (your existing database)
DB_HOST=your-database-host-or-ip
DB_PORT=3306
DB_USER=your-database-username
DB_PASSWORD=your-database-password
DB_NAME=your-database-name
TABLE_PREFIX=onboarding_

# Server Configuration
PORT=3001
NODE_ENV=production

# CORS Configuration (update with your Vercel frontend URL)
CORS_ORIGIN=https://your-app-name.vercel.app

# JWT Configuration (generated secure key)
JWT_SECRET=$JWT_SECRET

# AWS S3 Configuration (for file uploads - optional)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
S3_BUCKET_NAME=your-s3-bucket-name

# Encryption key for secure data (generated secure key)
ENCRYPTION_KEY=$ENCRYPTION_KEY
EOF

echo "✅ Created backend/.env.production.example"

echo ""
echo "📝 Next steps:"
echo "1. Update database details in backend/.env.production.example"
echo "2. Configure your database server for Railway access"
echo "3. Deploy backend to Railway with these environment variables"
echo "4. Deploy frontend to Vercel"
echo "5. Update CORS_ORIGIN in Railway with your Vercel URL"
echo ""
echo "📖 See DEPLOYMENT.md for detailed instructions"
echo ""
echo "🔧 Your secure keys (save these for Railway):"
echo "JWT_SECRET: $JWT_SECRET"
echo "ENCRYPTION_KEY: $ENCRYPTION_KEY" 