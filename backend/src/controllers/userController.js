import pool from '../db/config.js';
import bcrypt from 'bcrypt'; // Assuming bcrypt is used for password hashing

const SALT_ROUNDS = 10;

/**
 * Get all users
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const getAllUsers = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const [users] = await connection.query('SELECT id, first_name, last_name, email, status, created_at, updated_at FROM users');
    res.status(200).json(users);
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Get user by ID
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const getUserById = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const userId = parseInt(req.params.id);
    const [users] = await connection.query(
      'SELECT id, first_name, last_name, email, status, created_at, updated_at FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(200).json(users[0]);
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Create a new user
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const createUser = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const { first_name, last_name, email, password, status = 'pending', roleId } = req.body;

    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Begin transaction to handle user creation and role assignment
    await connection.beginTransaction();
    
    try {
      // Insert user
      const [result] = await connection.query(
        'INSERT INTO users (first_name, last_name, email, password, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
        [first_name, last_name, email, hashedPassword, status]
      );

      const userId = result.insertId;

      // Assign role if roleId is provided
      if (roleId) {
        // Check if role exists
        const [roleCheck] = await connection.query('SELECT id FROM roles WHERE id = ?', [roleId]);
        
        if (roleCheck.length === 0) {
          throw new Error('Invalid role ID');
        }
        
        // Assign role to user
        await connection.query(
          'INSERT INTO user_roles (user_id, role_id, created_by) VALUES (?, ?, ?)',
          [userId, roleId, req.user ? req.user.id : userId] // If no authenticated user, use the new user's ID
        );
      }

      await connection.commit();

      const [users] = await connection.query(
        'SELECT id, first_name, last_name, email, status, created_at, updated_at FROM users WHERE id = ?', // Exclude password hash
        [userId]
      );

      res.status(201).json({
        success: true,
        userId,
        user: users[0]
      });
    } catch (err) {
      await connection.rollback();
      throw err;
    }
  } catch (error) {
    // Handle potential duplicate email error (error.code === 'ER_DUP_ENTRY')
    if (error.code === 'ER_DUP_ENTRY') {
       return res.status(409).json({ error: 'Email already exists' });
    }
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Update an existing user
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const updateUser = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const userId = parseInt(req.params.id);
    const { first_name, last_name, email, status, password, roleId } = req.body;

    // Build dynamic update query
    let updateFields = [];
    let queryParams = [];

    if (first_name !== undefined) { updateFields.push('first_name = ?'); queryParams.push(first_name); }
    if (last_name !== undefined) { updateFields.push('last_name = ?'); queryParams.push(last_name); }
    if (email !== undefined) { updateFields.push('email = ?'); queryParams.push(email); }
    if (status !== undefined) { updateFields.push('status = ?'); queryParams.push(status); }
    
    // Handle password update if provided
    if (password !== undefined) {
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      updateFields.push('password = ?'); 
      queryParams.push(hashedPassword);
    }

    if (updateFields.length === 0 && roleId === undefined) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    // Begin transaction
    await connection.beginTransaction();
    
    try {
      // Update user info if there are fields to update
      if (updateFields.length > 0) {
        updateFields.push('updated_at = NOW()');
        queryParams.push(userId);

        await connection.query(
          `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
          queryParams
        );
      }

      // Update role if provided
      if (roleId !== undefined) {
        // First remove all existing roles
        await connection.query('DELETE FROM user_roles WHERE user_id = ?', [userId]);
        
        // Then add the new role
        if (roleId) {
          // Check if role exists
          const [roleCheck] = await connection.query('SELECT id FROM roles WHERE id = ?', [roleId]);
          
          if (roleCheck.length === 0) {
            throw new Error('Invalid role ID');
          }
          
          // Assign new role
          await connection.query(
            'INSERT INTO user_roles (user_id, role_id, created_by) VALUES (?, ?, ?)',
            [userId, roleId, req.user ? req.user.id : userId]
          );
        }
      }

      await connection.commit();

      // Get updated user
      const [users] = await connection.query(
        'SELECT id, first_name, last_name, email, status, created_at, updated_at FROM users WHERE id = ?',
        [userId]
      );

      if (users.length === 0) {
        return res.status(404).json({ error: 'User not found after update' }); // Should not happen if update worked
      }

      // Get user's role
      const [userRoles] = await connection.query(
        `SELECT r.id, r.name 
        FROM roles r
        JOIN user_roles ur ON r.id = ur.role_id
        WHERE ur.user_id = ?
        LIMIT 1`,
        [userId]
      );

      const user = users[0];
      if (userRoles.length > 0) {
        user.role = userRoles[0];
      }

      res.status(200).json({
        success: true,
        user
      });
    } catch (err) {
      await connection.rollback();
      throw err;
    }
  } catch (error) {
     // Handle potential duplicate email error on update
    if (error.code === 'ER_DUP_ENTRY') {
       return res.status(409).json({ error: 'Email already exists for another user' });
    }
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Delete a user
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const deleteUser = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const userId = parseInt(req.params.id);
    
    // Check if user exists
    const [existingUsers] = await connection.query(
      'SELECT id FROM users WHERE id = ?',
      [userId]
    );
    
    if (existingUsers.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Delete the user
    await connection.query(
      'DELETE FROM users WHERE id = ?',
      [userId]
    );
    
    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Get user's current role
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const getUserRole = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const userId = parseInt(req.params.id);
    
    // Get user's role
    const [userRoles] = await connection.query(
      `SELECT r.id, r.name, r.description 
      FROM roles r
      JOIN user_roles ur ON r.id = ur.role_id
      WHERE ur.user_id = ?
      LIMIT 1`,
      [userId]
    );
    
    if (userRoles.length === 0) {
      return res.status(200).json({ role: null });
    }
    
    res.status(200).json({ role: userRoles[0] });
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
}; 