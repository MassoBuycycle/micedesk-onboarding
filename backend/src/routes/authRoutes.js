import express from 'express';
import { login, verifyToken, getCurrentUser } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/login', login);
router.post('/verify', verifyToken);

// Protected routes
router.get('/me', authenticate, getCurrentUser);

export default router; 