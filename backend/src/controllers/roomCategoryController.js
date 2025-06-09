import pool from '../db/config.js';

/**
 * Get all categories for a specific room type
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const getRoomCategories = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const roomId = parseInt(req.params.roomId);
    
    // Check if room type exists
    const [roomTypes] = await connection.query(
      'SELECT * FROM room_types WHERE id = ?',
      [roomId]
    );
    
    if (roomTypes.length === 0) {
      return res.status(404).json({ error: 'Room type not found' });
    }
    
    // Get all categories for this room type
    const [categories] = await connection.query(
      'SELECT * FROM room_category_infos WHERE room_id = ?',
      [roomId]
    );
    
    res.status(200).json(categories);
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Get a specific category by ID
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const getRoomCategoryById = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const categoryId = parseInt(req.params.id);
    
    const [categories] = await connection.query(
      'SELECT * FROM room_category_infos WHERE id = ?',
      [categoryId]
    );
    
    if (categories.length === 0) {
      return res.status(404).json({ error: 'Room category not found' });
    }
    
    res.status(200).json(categories[0]);
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Create a new room category for a specific room type
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const createRoomCategory = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const roomId = parseInt(req.params.roomId);
    
    // Check if room type exists
    const [roomTypes] = await connection.query(
      'SELECT * FROM room_types WHERE id = ?',
      [roomId]
    );
    
    if (roomTypes.length === 0) {
      return res.status(404).json({ error: 'Room type not found' });
    }
    
    const {
      category_name,
      pms_name,
      num_rooms,
      size,
      bed_type,
      surcharges_upsell,
      room_features,
      second_person_surcharge,
      extra_bed_surcharge,
      baby_bed_available,
      extra_bed_available
    } = req.body;
    
    // Validate required fields
    if (!category_name) {
      return res.status(400).json({ error: 'Category name is required' });
    }
    
    // Insert the new category
    const [result] = await connection.query(
      `INSERT INTO room_category_infos (
        room_id,
        category_name,
        pms_name,
        num_rooms,
        size,
        bed_type,
        surcharges_upsell,
        room_features,
        second_person_surcharge,
        extra_bed_surcharge,
        baby_bed_available,
        extra_bed_available,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        roomId,
        category_name,
        pms_name || '',
        num_rooms || 0,
        size || 0,
        bed_type || '',
        surcharges_upsell || '',
        room_features || '',
        second_person_surcharge || 0,
        extra_bed_surcharge || 0,
        baby_bed_available ? 1 : 0,
        extra_bed_available ? 1 : 0
      ]
    );
    
    const categoryId = result.insertId;
    
    // Get the newly created category
    const [categories] = await connection.query(
      'SELECT * FROM room_category_infos WHERE id = ?',
      [categoryId]
    );
    
    res.status(201).json({
      success: true,
      categoryId,
      category: categories[0]
    });
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Update an existing room category
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const updateRoomCategory = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const categoryId = parseInt(req.params.id);
    
    // Check if category exists
    const [existingCategories] = await connection.query(
      'SELECT * FROM room_category_infos WHERE id = ?',
      [categoryId]
    );
    
    if (existingCategories.length === 0) {
      return res.status(404).json({ error: 'Room category not found' });
    }
    
    const {
      category_name,
      pms_name,
      num_rooms,
      size,
      bed_type,
      surcharges_upsell,
      room_features,
      second_person_surcharge,
      extra_bed_surcharge,
      baby_bed_available,
      extra_bed_available
    } = req.body;
    
    // Build dynamic update query
    let updateFields = [];
    let queryParams = [];
    
    if (category_name !== undefined) {
      updateFields.push('category_name = ?');
      queryParams.push(category_name);
    }
    
    if (pms_name !== undefined) {
      updateFields.push('pms_name = ?');
      queryParams.push(pms_name);
    }
    
    if (num_rooms !== undefined) {
      updateFields.push('num_rooms = ?');
      queryParams.push(num_rooms);
    }
    
    if (size !== undefined) {
      updateFields.push('size = ?');
      queryParams.push(size);
    }
    
    if (bed_type !== undefined) {
      updateFields.push('bed_type = ?');
      queryParams.push(bed_type);
    }
    
    if (surcharges_upsell !== undefined) {
      updateFields.push('surcharges_upsell = ?');
      queryParams.push(surcharges_upsell);
    }
    
    if (room_features !== undefined) {
      updateFields.push('room_features = ?');
      queryParams.push(room_features);
    }
    
    if (second_person_surcharge !== undefined) {
      updateFields.push('second_person_surcharge = ?');
      queryParams.push(second_person_surcharge);
    }
    
    if (extra_bed_surcharge !== undefined) {
      updateFields.push('extra_bed_surcharge = ?');
      queryParams.push(extra_bed_surcharge);
    }
    
    if (baby_bed_available !== undefined) {
      updateFields.push('baby_bed_available = ?');
      queryParams.push(baby_bed_available ? 1 : 0);
    }
    
    if (extra_bed_available !== undefined) {
      updateFields.push('extra_bed_available = ?');
      queryParams.push(extra_bed_available ? 1 : 0);
    }
    
    updateFields.push('updated_at = NOW()');
    
    // Add category ID to params
    queryParams.push(categoryId);
    
    if (updateFields.length > 1) { // At least one field plus updated_at
      // Execute update query
      await connection.query(
        `UPDATE room_category_infos SET ${updateFields.join(', ')} WHERE id = ?`,
        queryParams
      );
    }
    
    // Get the updated category
    const [categories] = await connection.query(
      'SELECT * FROM room_category_infos WHERE id = ?',
      [categoryId]
    );
    
    res.status(200).json({
      success: true,
      categoryId,
      category: categories[0]
    });
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Delete a room category
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const deleteRoomCategory = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const categoryId = parseInt(req.params.id);
    
    // Check if category exists
    const [existingCategories] = await connection.query(
      'SELECT * FROM room_category_infos WHERE id = ?',
      [categoryId]
    );
    
    if (existingCategories.length === 0) {
      return res.status(404).json({ error: 'Room category not found' });
    }
    
    // Delete the category
    await connection.query(
      'DELETE FROM room_category_infos WHERE id = ?',
      [categoryId]
    );
    
    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
}; 