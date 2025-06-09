import pool from '../db/config.js';

/**
 * Get all file types
 */
export const getAllFileTypes = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM file_types ORDER BY category, name');
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error getting file types:', error);
    res.status(500).json({ error: 'Failed to get file types' });
  }
};

/**
 * Get file types by category
 */
export const getFileTypesByCategory = async (req, res) => {
  const { category } = req.params;
  
  try {
    const [rows] = await pool.query(
      'SELECT * FROM file_types WHERE category = ? ORDER BY name',
      [category]
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error(`Error getting file types for category ${category}:`, error);
    res.status(500).json({ error: 'Failed to get file types for category' });
  }
};

/**
 * Get file type by ID
 */
export const getFileTypeById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const [rows] = await pool.query('SELECT * FROM file_types WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'File type not found' });
    }
    
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error(`Error getting file type ${id}:`, error);
    res.status(500).json({ error: 'Failed to get file type' });
  }
};

/**
 * Get file type by code and category
 */
export const getFileTypeByCodeAndCategory = async (req, res) => {
  const { code, category } = req.params;
  
  try {
    const [rows] = await pool.query(
      'SELECT * FROM file_types WHERE code = ? AND category = ?',
      [code, category]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'File type not found' });
    }
    
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error(`Error getting file type ${code} for category ${category}:`, error);
    res.status(500).json({ error: 'Failed to get file type' });
  }
};

/**
 * Create a new file type
 */
export const createFileType = async (req, res) => {
  const { name, code, category, allowed_extensions, max_size } = req.body;
  
  if (!name || !code || !category || !allowed_extensions || !max_size) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  
  try {
    // Check for duplicate code in the same category
    const [existingRows] = await pool.query(
      'SELECT * FROM file_types WHERE code = ? AND category = ?',
      [code, category]
    );
    
    if (existingRows.length > 0) {
      return res.status(409).json({ error: 'A file type with this code already exists for this category' });
    }
    
    // Convert array to JSON string if needed
    const extensionsValue = Array.isArray(allowed_extensions) 
      ? JSON.stringify(allowed_extensions) 
      : allowed_extensions;
    
    const [result] = await pool.query(
      `INSERT INTO file_types (name, code, category, allowed_extensions, max_size) 
       VALUES (?, ?, ?, ?, ?)`,
      [name, code, category, extensionsValue, max_size]
    );
    
    const [insertedRows] = await pool.query(
      'SELECT * FROM file_types WHERE id = ?',
      [result.insertId]
    );
    
    res.status(201).json(insertedRows[0]);
  } catch (error) {
    console.error('Error creating file type:', error);
    res.status(500).json({ error: 'Failed to create file type' });
  }
};

/**
 * Update an existing file type
 */
export const updateFileType = async (req, res) => {
  const { id } = req.params;
  const { name, allowed_extensions, max_size } = req.body;
  
  if (!name && !allowed_extensions && !max_size) {
    return res.status(400).json({ error: 'At least one field must be provided for update' });
  }
  
  try {
    // Check if file type exists
    const [existingRows] = await pool.query(
      'SELECT * FROM file_types WHERE id = ?', 
      [id]
    );
    
    if (existingRows.length === 0) {
      return res.status(404).json({ error: 'File type not found' });
    }
    
    // Build the SET clause and values dynamically
    const updates = [];
    const values = [];
    
    if (name) {
      updates.push('name = ?');
      values.push(name);
    }
    
    if (allowed_extensions) {
      // Convert array to JSON string if needed
      const extensionsValue = Array.isArray(allowed_extensions) 
        ? JSON.stringify(allowed_extensions) 
        : allowed_extensions;
      updates.push('allowed_extensions = ?');
      values.push(extensionsValue);
    }
    
    if (max_size) {
      updates.push('max_size = ?');
      values.push(max_size);
    }
    
    // Add ID as the last parameter
    values.push(id);
    
    const updateQuery = `
      UPDATE file_types 
      SET ${updates.join(', ')} 
      WHERE id = ?
    `;
    
    await pool.query(updateQuery, values);
    
    // Get the updated record
    const [updatedRows] = await pool.query(
      'SELECT * FROM file_types WHERE id = ?',
      [id]
    );
    
    res.status(200).json(updatedRows[0]);
  } catch (error) {
    console.error(`Error updating file type ${id}:`, error);
    res.status(500).json({ error: 'Failed to update file type' });
  }
};

/**
 * Delete a file type
 */
export const deleteFileType = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Check if file type exists
    const [existingRows] = await pool.query(
      'SELECT * FROM file_types WHERE id = ?', 
      [id]
    );
    
    if (existingRows.length === 0) {
      return res.status(404).json({ error: 'File type not found' });
    }
    
    // Check if files are using this file type
    const [filesRows] = await pool.query(
      'SELECT COUNT(*) as count FROM files WHERE file_type_id = ?', 
      [id]
    );
    
    if (parseInt(filesRows[0].count) > 0) {
      return res.status(409).json({ 
        error: 'Cannot delete file type that is being used by files',
        count: parseInt(filesRows[0].count)
      });
    }
    
    await pool.query('DELETE FROM file_types WHERE id = ?', [id]);
    
    res.status(200).json({ message: 'File type deleted successfully' });
  } catch (error) {
    console.error(`Error deleting file type ${id}:`, error);
    res.status(500).json({ error: 'Failed to delete file type' });
  }
};

/**
 * Middleware to validate and set file type for upload
 */
export const validateFileType = async (req, res, next) => {
  const { category, fileTypeCode } = req.params;
  
  try {
    const [rows] = await pool.query(
      'SELECT * FROM file_types WHERE category = ? AND code = ?',
      [category, fileTypeCode]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'File type not found' });
    }
    
    // Set file type in request for use by uploadMiddleware
    req.fileType = rows[0];
    
    // Parse allowed_extensions from JSON if needed
    if (req.fileType.allowed_extensions && typeof req.fileType.allowed_extensions === 'string') {
      try {
        req.fileType.allowed_extensions = JSON.parse(req.fileType.allowed_extensions);
      } catch (err) {
        console.error('Error parsing allowed_extensions:', err);
      }
    }
    
    next();
  } catch (error) {
    console.error(`Error validating file type ${fileTypeCode} for category ${category}:`, error);
    res.status(500).json({ error: 'Failed to validate file type' });
  }
}; 