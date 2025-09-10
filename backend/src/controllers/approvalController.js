import pool from '../db/config.js';

/**
 * Submit changes for approval
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const submitChanges = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    // Only proceed if user has edit_with_approval permission (set by middleware)
    if (req.editPermissionType !== 'edit_with_approval') {
      return res.status(400).json({ 
        error: 'This endpoint is only for changes that require approval' 
      });
    }
    
    const { entryId, entryType, changeData, originalData } = req.body;
    
    if (!entryId || !entryType || !changeData || !originalData) {
      return res.status(400).json({ 
        error: 'Entry ID, entry type, change data, and original data are required' 
      });
    }
    
    // Validate entry type
    const validEntryTypes = ['hotel', 'room', 'event', 'room_operations', 'room_space', 'event_space', 'food_beverage'];
    if (!validEntryTypes.includes(entryType)) {
      return res.status(400).json({ 
        error: `Entry type must be one of: ${validEntryTypes.join(', ')}` 
      });
    }
    
    // Create pending change record
    
    const [result] = await connection.query(
      `INSERT INTO onboarding_pending_changes 
        (entry_id, entry_type, user_id, change_data, original_data)
      VALUES (?, ?, ?, ?, ?)`,
      [
        entryId,
        entryType,
        req.user.id,
        JSON.stringify(changeData),
        JSON.stringify(originalData)
      ]
    );
    
    res.status(201).json({
      success: true,
      message: 'Changes submitted for approval',
      changeId: result.insertId
    });
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Get pending changes
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const getPendingChanges = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    let query = `
      SELECT pc.*, 
        u.first_name as submitter_first_name, 
        u.last_name as submitter_last_name,
        u.email as submitter_email,
        rv.first_name as reviewer_first_name,
        rv.last_name as reviewer_last_name
      FROM onboarding_pending_changes pc
      JOIN onboarding_users u ON pc.user_id = u.id
      LEFT JOIN onboarding_users rv ON pc.reviewed_by = rv.id
    `;
    
    const params = [];
    
    // Filter by status if provided
    if (req.query.status) {
      query += ' WHERE pc.status = ?';
      params.push(req.query.status);
    } else {
      // Default to pending changes only
      query += ' WHERE pc.status = "pending"';
    }
    
    // Add entry type filter if provided
    if (req.query.entryType) {
      query += ' AND pc.entry_type = ?';
      params.push(req.query.entryType);
    }
    
    // Add entry ID filter if provided
    if (req.query.entryId) {
      query += ' AND pc.entry_id = ?';
      params.push(req.query.entryId);
    }
    
    // Add user ID filter if provided
    if (req.query.userId) {
      query += ' AND pc.user_id = ?';
      params.push(req.query.userId);
    }
    
    query += ' ORDER BY pc.created_at DESC';
    
    const [changes] = await connection.query(query, params);
    
    // Parse JSON fields for easier consumption by clients
    const parsedChanges = changes.map(change => {
      
      let parsedChangeData = change.change_data;
      let parsedOriginalData = change.original_data;
      
      // Handle case where MySQL might return JSON as string
      if (typeof change.change_data === 'string') {
        try {
          parsedChangeData = JSON.parse(change.change_data);
        } catch (e) {
          parsedChangeData = null;
        }
      }
      
      if (typeof change.original_data === 'string') {
        try {
          parsedOriginalData = JSON.parse(change.original_data);
        } catch (e) {
          parsedOriginalData = null;
        }
      }
      
      
      return {
        ...change,
        change_data: parsedChangeData,
        original_data: parsedOriginalData,
      };
    });
    
    res.json(parsedChanges);
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Get a specific pending change by ID
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const getPendingChangeById = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    
    const [changes] = await connection.query(
      `SELECT pc.*, 
        u.first_name as submitter_first_name, 
        u.last_name as submitter_last_name,
        u.email as submitter_email,
        rv.first_name as reviewer_first_name,
        rv.last_name as reviewer_last_name
      FROM onboarding_pending_changes pc
      JOIN onboarding_users u ON pc.user_id = u.id
      LEFT JOIN onboarding_users rv ON pc.reviewed_by = rv.id
      WHERE pc.id = ?`,
      [id]
    );
    
    if (changes.length === 0) {
      return res.status(404).json({ error: 'Pending change not found' });
    }
    
    // Parse the JSON data
    const change = changes[0];
    
    // Handle case where MySQL might return JSON as string
    if (typeof change.change_data === 'string') {
      try {
        change.change_data = JSON.parse(change.change_data);
      } catch (e) {
        change.change_data = null;
      }
    }
    
    if (typeof change.original_data === 'string') {
      try {
        change.original_data = JSON.parse(change.original_data);
      } catch (e) {
        change.original_data = null;
      }
    }
    
    
    res.json(change);
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Review a pending change (approve or reject)
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const reviewChange = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be either "approved" or "rejected"' });
    }
    
    // Check if the change exists and is pending
    const [changes] = await connection.query(
      'SELECT * FROM onboarding_pending_changes WHERE id = ?',
      [id]
    );
    
    if (changes.length === 0) {
      return res.status(404).json({ error: 'Pending change not found' });
    }
    
    const change = changes[0];
    
    if (change.status !== 'pending') {
      return res.status(400).json({ 
        error: 'This change has already been reviewed',
        currentStatus: change.status
      });
    }
    
    // Begin transaction
    await connection.beginTransaction();
    
    try {
      // Update change status
      await connection.query(
        `UPDATE onboarding_pending_changes 
        SET status = ?, reviewed_by = ?, review_notes = ?, updated_at = NOW()
        WHERE id = ?`,
        [status, req.user.id, notes || null, id]
      );
      
      // If approved, apply the changes to the actual data
      if (status === 'approved') {
        let changeData;
        
        // Handle case where MySQL might return JSON as string
        if (typeof change.change_data === 'string') {
          try {
            changeData = JSON.parse(change.change_data);
          } catch (e) {
            return res.status(400).json({ 
              error: 'Invalid change data format. Cannot apply changes.' 
            });
          }
        } else {
          changeData = change.change_data;
        }
        
        if (!changeData || typeof changeData !== 'object') {
          return res.status(400).json({ 
            error: 'Invalid change data format. Cannot apply changes.' 
          });
        }
        
        // Apply changes based on entry type
        if (change.entry_type === 'hotel') {
          await applyHotelChanges(connection, change.entry_id, changeData);
        } else if (change.entry_type === 'room') {
          await applyRoomChanges(connection, change.entry_id, changeData);
        } else if (change.entry_type === 'event') {
          await applyEventChanges(connection, change.entry_id, changeData);
        }
      }
      
      await connection.commit();
      
      res.json({
        success: true,
        message: `Change ${status === 'approved' ? 'approved and applied' : 'rejected'}`,
        changeId: id,
        status
      });
    } catch (err) {
      await connection.rollback();
      throw err;
    }
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Apply changes to a hotel
 * @param {import('mysql2/promise').PoolConnection} connection - Database connection
 * @param {number} hotelId - The hotel ID
 * @param {object} changeData - The data to update
 */
async function applyHotelChanges(connection, hotelId, changeData) {
  // Create query dynamically based on the fields in changeData
  const fields = Object.keys(changeData);
  
  if (fields.length === 0) return;
  
  const setClauses = fields.map(field => `${field} = ?`).join(', ');
  const values = fields.map(field => changeData[field]);
  
  // Add hotelId to values array
  values.push(hotelId);
  
  await connection.query(
    `UPDATE onboarding_hotels SET ${setClauses} WHERE id = ?`,
    values
  );
}

/**
 * Apply changes to a room
 * @param {import('mysql2/promise').PoolConnection} connection - Database connection
 * @param {number} roomId - The room ID
 * @param {object} changeData - The data to update
 */
async function applyRoomChanges(connection, roomId, changeData) {
  // Similar implementation as applyHotelChanges but for rooms table
  const fields = Object.keys(changeData);
  
  if (fields.length === 0) return;
  
  const setClauses = fields.map(field => `${field} = ?`).join(', ');
  const values = fields.map(field => changeData[field]);
  
  values.push(roomId);
  
  await connection.query(
    `UPDATE onboarding_rooms SET ${setClauses} WHERE id = ?`,
    values
  );
}

/**
 * Apply changes to an event
 * @param {import('mysql2/promise').PoolConnection} connection - Database connection
 * @param {number} eventId - The event ID
 * @param {object} changeData - The data to update
 */
async function applyEventChanges(connection, eventId, changeData) {
  // Similar implementation as applyHotelChanges but for events table
  const fields = Object.keys(changeData);
  
  if (fields.length === 0) return;
  
  const setClauses = fields.map(field => `${field} = ?`).join(', ');
  const values = fields.map(field => changeData[field]);
  
  values.push(eventId);
  
  await connection.query(
    `UPDATE onboarding_events SET ${setClauses} WHERE id = ?`,
    values
  );
}

/**
 * Get changes submitted by the current user
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const getMyChanges = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const userId = req.user.id;
    
    // Build query with optional status filter
    let query = `
      SELECT pc.*, 
        u.first_name as submitter_first_name, 
        u.last_name as submitter_last_name,
        rv.first_name as reviewer_first_name,
        rv.last_name as reviewer_last_name
      FROM onboarding_pending_changes pc
      JOIN onboarding_users u ON pc.user_id = u.id
      LEFT JOIN onboarding_users rv ON pc.reviewed_by = rv.id
      WHERE pc.user_id = ?
    `;
    
    const params = [userId];
    
    // Filter by status if provided
    if (req.query.status) {
      query += ' AND pc.status = ?';
      params.push(req.query.status);
    }
    
    query += ' ORDER BY pc.created_at DESC';
    
    const [changes] = await connection.query(query, params);
    
    const parsed = changes.map(change => {
      let parsedChangeData = change.change_data;
      let parsedOriginalData = change.original_data;
      
      // Handle case where MySQL might return JSON as string
      if (typeof change.change_data === 'string') {
        try {
          parsedChangeData = JSON.parse(change.change_data);
        } catch (e) {
          parsedChangeData = null;
        }
      }
      
      if (typeof change.original_data === 'string') {
        try {
          parsedOriginalData = JSON.parse(change.original_data);
        } catch (e) {
          parsedOriginalData = null;
        }
      }
      
      return {
        ...change,
        change_data: parsedChangeData,
        original_data: parsedOriginalData,
      };
    });
    
    res.json(parsed);
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Get entry assignments for a user
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const getUserAssignments = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const { userId } = req.params;
    
    // Get assignments with entry details
    const [assignments] = await connection.query(`
      SELECT ea.*, 
        u.first_name as assigned_by_first_name, 
        u.last_name as assigned_by_last_name,
        h.name as hotel_name
      FROM onboarding_entry_assignments ea
      JOIN onboarding_users u ON ea.assigned_by = u.id
      LEFT JOIN onboarding_hotels h ON ea.entry_id = h.id AND ea.entry_type = 'hotel'
      WHERE ea.user_id = ?
      ORDER BY ea.created_at DESC
    `, [userId]);
    
    res.json(assignments);
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Get users assigned to an entry
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const getEntryAssignments = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const { entryId, entryType } = req.params;
    
    // Get assignments with user details
    const [assignments] = await connection.query(`
      SELECT ea.*, 
        u.id as user_id,
        u.first_name, 
        u.last_name,
        u.email,
        a.first_name as assigned_by_first_name, 
        a.last_name as assigned_by_last_name
      FROM onboarding_entry_assignments ea
      JOIN onboarding_users u ON ea.user_id = u.id
      JOIN onboarding_users a ON ea.assigned_by = a.id
      WHERE ea.entry_id = ? AND ea.entry_type = ?
      ORDER BY u.last_name, u.first_name
    `, [entryId, entryType]);
    
    res.json(assignments);
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Assign an entry to a user
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const assignEntry = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const { userId, entryId, entryType } = req.body;
    
    if (!userId || !entryId || !entryType) {
      return res.status(400).json({ 
        error: 'User ID, entry ID, and entry type are required' 
      });
    }
    
    // Validate entry type
    const validEntryTypes = ['hotel', 'room', 'event', 'room_operations', 'room_space', 'event_space', 'food_beverage'];
    if (!validEntryTypes.includes(entryType)) {
      return res.status(400).json({ 
        error: `Entry type must be one of: ${validEntryTypes.join(', ')}` 
      });
    }
    
    // Check if user exists
    const [users] = await connection.query(
      'SELECT id FROM onboarding_users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if entry exists (for hotels)
    if (entryType === 'hotel') {
      const [hotels] = await connection.query(
        'SELECT id FROM onboarding_hotels WHERE id = ?',
        [entryId]
      );
      
      if (hotels.length === 0) {
        return res.status(404).json({ error: 'Hotel not found' });
      }
    }
    
    // Insert or update assignment
    await connection.query(`
      INSERT INTO onboarding_entry_assignments 
        (user_id, entry_id, entry_type, assigned_by)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        assigned_by = VALUES(assigned_by)
    `, [userId, entryId, entryType, req.user.id]);
    
    res.status(201).json({
      success: true,
      message: 'Entry assigned to user successfully'
    });
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Unassign an entry from a user
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const unassignEntry = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const { userId, entryId, entryType } = req.params;
    
    // Delete assignment
    await connection.query(
      'DELETE FROM onboarding_entry_assignments WHERE user_id = ? AND entry_id = ? AND entry_type = ?',
      [userId, entryId, entryType]
    );
    
    res.json({
      success: true,
      message: 'Entry unassigned from user successfully'
    });
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
}; 