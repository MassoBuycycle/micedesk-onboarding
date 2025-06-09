import pool from '../db/config.js';

/**
 * Get all hotels assigned to a user
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const getHotelsByUserId = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const userId = parseInt(req.params.userId);
    
    // Check if the user has all hotels access
    const [allAccess] = await connection.query(
      'SELECT * FROM user_all_hotels_access WHERE user_id = ?',
      [userId]
    );
    
    if (allAccess.length > 0) {
      // User has access to all hotels
      const [hotels] = await connection.query('SELECT * FROM hotels');
      return res.status(200).json({
        hasAllAccess: true,
        hotels: hotels
      });
    }
    
    // Get specific hotel assignments
    const [hotels] = await connection.query(
      `SELECT h.* FROM hotels h
       INNER JOIN user_hotel_assignments uha ON h.id = uha.hotel_id
       WHERE uha.user_id = ?`,
      [userId]
    );
    
    res.status(200).json({
      hasAllAccess: false,
      hotels: hotels
    });
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Get all users assigned to a hotel
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const getUsersByHotelId = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const hotelId = parseInt(req.params.hotelId);
    
    // Get users with specific assignments to this hotel
    const [specificUsers] = await connection.query(
      `SELECT u.id, u.first_name, u.last_name, u.email, u.created_at, u.updated_at, FALSE as has_all_access
       FROM users u
       INNER JOIN user_hotel_assignments uha ON u.id = uha.user_id
       WHERE uha.hotel_id = ?`,
      [hotelId]
    );
    
    // Get users with all hotels access
    const [allAccessUsers] = await connection.query(
      `SELECT u.id, u.first_name, u.last_name, u.email, u.created_at, u.updated_at, TRUE as has_all_access
       FROM users u
       INNER JOIN user_all_hotels_access uaa ON u.id = uaa.user_id`
    );
    
    // Combine both result sets
    const users = [...specificUsers, ...allAccessUsers];
    
    res.status(200).json(users);
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Assign a user to a hotel
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const assignUserToHotel = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const { userId, hotelId, assignedBy } = req.body;
    
    if (!userId || !hotelId) {
      return res.status(400).json({ error: 'User ID and Hotel ID are required' });
    }
    
    // Check if the assignment already exists
    const [existingAssignments] = await connection.query(
      'SELECT * FROM user_hotel_assignments WHERE user_id = ? AND hotel_id = ?',
      [userId, hotelId]
    );
    
    if (existingAssignments.length > 0) {
      return res.status(409).json({ error: 'User is already assigned to this hotel' });
    }
    
    // Create the assignment
    await connection.query(
      'INSERT INTO user_hotel_assignments (user_id, hotel_id, assigned_by) VALUES (?, ?, ?)',
      [userId, hotelId, assignedBy || null]
    );
    
    res.status(201).json({ success: true, message: 'User assigned to hotel successfully' });
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Unassign a user from a hotel
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const unassignUserFromHotel = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const { userId, hotelId } = req.params;
    
    if (!userId || !hotelId) {
      return res.status(400).json({ error: 'User ID and Hotel ID are required' });
    }
    
    // Delete the assignment
    await connection.query(
      'DELETE FROM user_hotel_assignments WHERE user_id = ? AND hotel_id = ?',
      [userId, hotelId]
    );
    
    res.status(200).json({ success: true, message: 'User unassigned from hotel successfully' });
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Grant a user access to all hotels
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const grantAllHotelsAccess = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const { userId, assignedBy } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // Check if the all access already exists
    const [existingAccess] = await connection.query(
      'SELECT * FROM user_all_hotels_access WHERE user_id = ?',
      [userId]
    );
    
    if (existingAccess.length > 0) {
      return res.status(409).json({ error: 'User already has access to all hotels' });
    }
    
    // Grant all hotels access
    await connection.query(
      'INSERT INTO user_all_hotels_access (user_id, assigned_by) VALUES (?, ?)',
      [userId, assignedBy || null]
    );
    
    // Remove any specific hotel assignments since they're redundant
    await connection.query(
      'DELETE FROM user_hotel_assignments WHERE user_id = ?',
      [userId]
    );
    
    res.status(201).json({ success: true, message: 'User granted access to all hotels' });
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Revoke a user's access to all hotels
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const revokeAllHotelsAccess = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const userId = parseInt(req.params.userId);
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // Delete the all hotels access
    await connection.query(
      'DELETE FROM user_all_hotels_access WHERE user_id = ?',
      [userId]
    );
    
    res.status(200).json({ success: true, message: 'All hotels access revoked successfully' });
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
}; 