import jwt from 'jsonwebtoken';
import pool from '../db/config.js';

// JWT Secret (should match the one in authController.js)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * Authentication middleware - verifies JWT token and attaches user to request
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    
    // Get user from database (we need to ensure they still exist and are active)
    const connection = await pool.getConnection();
    try {
      const [users] = await connection.query(
        'SELECT id, first_name, last_name, email, status FROM users WHERE id = ?',
        [decoded.userId]
      );

      if (users.length === 0) {
        return res.status(401).json({ error: 'Invalid user' });
      }

      const user = users[0];
      
      // Check if user is active
      if (user.status !== 'active') {
        return res.status(403).json({ error: 'Account is not active' });
      }

      // Attach user to request
      req.user = {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        status: user.status
      };
      
      // Token is valid, proceed to next middleware
      next();
    } finally {
      connection.release();
    }
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
}; 