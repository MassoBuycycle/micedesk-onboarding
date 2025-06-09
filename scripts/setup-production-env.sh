#!/bin/bash

echo "🚀 Setting up production environment files..."

# Create frontend production env
cat > frontend/.env.production << 'EOF'
# Production API Configuration
VITE_API_BASE_URL=https://your-railway-app.railway.app/api
VITE_API_LOGGING_ENABLED=false

# NOTE: Replace 'your-railway-app' with your actual Railway app name
# You'll get this URL after deploying to Railway
EOF

echo "✅ Created frontend/.env.production"

# Create backend production env template
cat > backend/.env.production.template << 'EOF'
# Database Configuration (Railway will provide these)
DB_HOST=your-railway-mysql-host
DB_USER=your-railway-mysql-user
DB_PASSWORD=your-railway-mysql-password
DB_NAME=railway
TABLE_PREFIX=onboarding_

# Server Configuration
PORT=3001
NODE_ENV=production

# CORS Configuration (update with your Vercel frontend URL)
CORS_ORIGIN=https://your-app-name.vercel.app

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-minimum-32-chars

# AWS S3 Configuration (for file uploads)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
S3_BUCKET_NAME=your-s3-bucket-name

# Encryption key for secure data (must be exactly 32 characters)
ENCRYPTION_KEY=abcdefghijklmnopqrstuvwxyz123456
EOF

echo "✅ Created backend/.env.production.template"

echo ""
echo "📝 Next steps:"
echo "1. Update frontend/.env.production with your Railway backend URL"
echo "2. Configure environment variables in Railway dashboard"
echo "3. Configure environment variables in Vercel dashboard"
echo ""
echo "🔧 Generate secure keys:"
echo "JWT Secret: openssl rand -base64 32"
echo "Encryption Key: openssl rand -hex 16" 