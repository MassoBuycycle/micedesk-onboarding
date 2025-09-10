import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import hotelRoutes from './routes/hotelRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import userRoutes from './routes/userRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import fbRoutes from './routes/fbRoutes.js';
import fileRoutes from './routes/fileRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userHotelRoutes from './routes/userHotelRoutes.js';
import roleRoutes from './routes/roleRoutes.js';
import approvalRoutes from './routes/approvalRoutes.js';
import secureDataRoutes from './routes/secureDataRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js';
import informationPoliciesRoutes from './routes/informationPoliciesRoutes.js';
import contractRoutes from './routes/contractRoutes.js';
import translationsRouter from './routes/translations.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';
import { requestLogger } from './middleware/requestLogger.js';
import { authenticate } from './middleware/auth.js';
import pool from './db/config.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Trust reverse proxy (Railway)
app.set('trust proxy', 1);

// Configure CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204
}));

// Handle preflight requests
app.options('*', cors());

// Parse JSON bodies
app.use(express.json());

// Request logger
app.use(requestLogger);

// Auth routes (unprotected)
app.use('/api/auth', authRoutes);

// Protected API routes
app.use('/api/users', authenticate, userRoutes);
app.use('/api/rooms', authenticate, roomRoutes);
app.use('/api/hotels', authenticate, hotelRoutes);
app.use('/api/events', authenticate, eventRoutes);
app.use('/api/hotels/:hotelId/fb', authenticate, fbRoutes);
app.use('/api/hotels/:hotelId/contract', authenticate, contractRoutes);
app.use('/api/files', authenticate, fileRoutes);
app.use('/api/user-hotels', authenticate, userHotelRoutes);
app.use('/api/roles', authenticate, roleRoutes);
app.use('/api/approval', authenticate, approvalRoutes);
app.use('/api/information-policies', authenticate, informationPoliciesRoutes);
app.use('/api', authenticate, secureDataRoutes);
app.use('/api', authenticate, announcementRoutes);
app.use('/api/translations', translationsRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Readiness probe (checks DB connectivity)
app.get('/ready', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ready' });
  } catch (error) {
    res.status(503).json({ status: 'not_ready', error: error.message });
  }
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Hotel Data Hub API',
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
      rooms: '/api/rooms',
      hotels: '/api/hotels',
      files: '/api/files'
    }
  });
});

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

// Start server only if not in test environment
let server;
if (process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

  // Harden HTTP server against slowloris and hanging requests
  // KeepAlive must be < headersTimeout to allow proper cleanup
  server.keepAliveTimeout = 61 * 1000; // 61s
  server.headersTimeout = 65 * 1000;   // 65s
  server.requestTimeout = 30 * 1000;   // 30s per request
}

// Graceful shutdown
let isShuttingDown = false;
async function shutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`[${signal}] Received. Shutting down gracefully...`);
  try {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    await pool.end();
    console.log('Shutdown complete.');
    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown:', err);
    process.exit(1);
  }
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
  shutdown('unhandledRejection');
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  shutdown('uncaughtException');
});

export default app; 