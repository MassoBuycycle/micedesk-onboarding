# 🏨 Onboarding Tool

A comprehensive hotel onboarding and management system built with modern web technologies.

## 🚀 Features

- **Hotel Management**: Complete hotel profile creation and management
- **User Authentication**: Secure role-based access control  
- **Event Management**: Meeting rooms, equipment, and booking systems
- **Food & Beverage**: Restaurant and catering management
- **Document Management**: File uploads and policy management
- **Multi-language Support**: Internationalization ready

## 🛠️ Tech Stack

**Frontend**: React + TypeScript + Vite + Tailwind CSS  
**Backend**: Node.js + Express + TypeScript  
**Database**: MySQL with automatic table prefixing (`onboarding_`)  
**Authentication**: JWT + bcrypt  
**File Storage**: AWS S3 (optional)

## 📦 Project Structure

```
onboarding-tool/
├── frontend/          # React application
├── backend/           # Express API server
├── scripts/           # Deployment utilities
└── DEPLOYMENT.md      # Production deployment guide
```

## 🏃‍♂️ Quick Start

### Development Setup

```bash
# Install dependencies
npm install
cd frontend && npm install
cd ../backend && npm install

# Start development servers
npm run dev
```

This starts:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

### Production Deployment

```bash
# Generate deployment configuration
npm run setup

# Follow the deployment guide
open DEPLOYMENT.md
```

**Deployment Architecture**:
- **Frontend**: Vercel (Static hosting)
- **Backend**: Railway (Node.js hosting)  
- **Database**: Your existing MySQL database

## 📖 Documentation

- **[Deployment Guide](DEPLOYMENT.md)**: Complete production deployment instructions
- **[API Documentation](backend/API_DOCUMENTATION.md)**: Backend API reference
- **Database Schema**: Auto-generated tables with `onboarding_` prefix

## 🔧 Configuration

### Environment Variables

**Frontend** (`.env`):
```bash
VITE_API_BASE_URL=http://localhost:3001/api
VITE_API_LOGGING_ENABLED=true
```

**Backend** (`.env`):
```bash
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=hotel_cms
TABLE_PREFIX=onboarding_
JWT_SECRET=your-secret-key
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Role-based Access**: Admin, Editor, Contributor, Viewer roles
- **Data Encryption**: Sensitive data encryption
- **CORS Protection**: Configurable cross-origin policies
- **Input Validation**: Comprehensive request validation

## 🚀 Deployment

The application is designed for cloud deployment:

1. **Generate Config**: `npm run setup`
2. **Deploy Backend**: Railway (auto-deploys from GitHub)
3. **Deploy Frontend**: Vercel (auto-deploys from GitHub)
4. **Configure Database**: Direct MySQL connection (no SSH tunnels needed)

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

## 📊 Database Schema

The system automatically creates tables with the `onboarding_` prefix:
- `onboarding_hotels` - Hotel information
- `onboarding_users` - User accounts and authentication
- `onboarding_events` - Meeting and event spaces
- `onboarding_files` - Document and media management
- And more...

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is proprietary software. All rights reserved.

---

**Ready to deploy?** See [DEPLOYMENT.md](DEPLOYMENT.md) for step-by-step instructions. 