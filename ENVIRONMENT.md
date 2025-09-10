## Environment Configuration

Create `.env` files using the examples below.

### Backend (`backend/.env`)
```
PORT=3001
CORS_ORIGIN=http://localhost:5173

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=hotel_cms
TABLE_PREFIX=onboarding_

DB_CONNECT_TIMEOUT_MS=10000
DB_KEEPALIVE_DELAY_MS=10000
DB_KEEPALIVE_INTERVAL_MS=45000
DB_KEEPALIVE=true

JWT_SECRET=change-me

# Optional AWS S3
AWS_REGION=eu-central-1
AWS_S3_BUCKET=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
```

### Frontend (`frontend/.env`)
```
VITE_API_BASE_URL=http://localhost:3001/api
VITE_API_LOGGING_ENABLED=false
```

