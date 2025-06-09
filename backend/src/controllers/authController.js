import pool from '../db/config.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// JWT Secret (in production, this should be in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRY = '24h'; // Token expiry time

/**
 * Login user
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const login = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    const [users] = await connection.query(
      'SELECT id, first_name, last_name, email, password, status FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = users[0];

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(403).json({ error: 'Account is not active. Please contact an administrator.' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        name: `${user.first_name} ${user.last_name}`
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    // Return user info and token (without password)
    delete user.password;
    res.json({
      user,
      token
    });
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Verify JWT token
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const verifyToken = async (req, res, next) => {
  try {
    // Get token from the request header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Get user from database to ensure they still exist and are active
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

      // Fetch permissions for this user via roles
      const [permRows] = await connection.query(`
        SELECT DISTINCT p.code
        FROM permissions p
        JOIN role_permissions rp ON p.id = rp.permission_id
        JOIN user_roles ur ON rp.role_id = ur.role_id
        WHERE ur.user_id = ?
      `, [user.id]);

      let permissions = permRows.map(p => p.code);

      // If user has Admin role, grant all permissions
      const [adminRole] = await connection.query(`
        SELECT 1 FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = ? AND r.name = 'Admin'
        LIMIT 1
      `, [user.id]);

      if (adminRole.length > 0) {
        const [allPermRows] = await connection.query('SELECT code FROM permissions');
        permissions = allPermRows.map(p => p.code);
      }

      // Add user to request object
      req.user = {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        status: user.status
      };
      req.permissions = permissions;
      
      // Token is valid and user is active
      res.json({ valid: true, user: req.user, permissions });
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

/**
 * Get current user information
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const getCurrentUser = async (req, res, next) => {
  try {
    // This will only execute if the auth middleware has already verified the token
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    // req.permissions may have been attached by auth middleware; if not, fetch
    let permissions = req.permissions;
    if (!permissions) {
      const connection = await pool.getConnection();
      try {
        const [permRows] = await connection.query(`
          SELECT DISTINCT p.code
          FROM permissions p
          JOIN role_permissions rp ON p.id = rp.permission_id
          JOIN user_roles ur ON rp.role_id = ur.role_id
          WHERE ur.user_id = ?
        `, [req.user.id]);
        permissions = permRows.map(p => p.code);
        // Admin override
        const [adminRole] = await connection.query(`
          SELECT 1 FROM user_roles ur
          JOIN roles r ON ur.role_id = r.id
          WHERE ur.user_id = ? AND r.name = 'Admin'
          LIMIT 1
        `, [req.user.id]);
        if (adminRole.length > 0) {
          const [allPermRows] = await connection.query('SELECT code FROM permissions');
          permissions = allPermRows.map(p => p.code);
        }
      } finally {
        connection.release();
      }
    }
    
    res.json({ user: req.user, permissions });
  } catch (error) {
    next(error);
  }
}; 