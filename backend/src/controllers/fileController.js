import pool from '../db/config.js';
import { getSignedUrl, deleteFile, moveFile } from '../services/s3Service.js';

/**
 * Upload a file
 * Note: This controller is used after the uploadMiddleware processes the file
 */
export const uploadFile = async (req, res) => {
  try {
    // Verbose logging for debugging uploads
    console.log('[UPLOAD] Incoming request', {
      params: req.params,
      headers: {
        'content-type': req.headers['content-type'],
        'content-length': req.headers['content-length'],
        'user-agent': req.headers['user-agent']
      }
    });

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { 
      entityType, 
      entityId, 
      category,
      fileTypeCode 
    } = req.params;
    
    const {
      originalname,
      mimetype,
      size,
      key,
      location
    } = req.file;
    
    console.log('[UPLOAD] File processed by multer', {
      originalname,
      mimetype,
      size,
      key,
      location
    });
    
    // Get the file type ID
    const [fileTypeRows] = await pool.query(
      'SELECT id FROM file_types WHERE code = ? AND category = ?',
      [fileTypeCode, category]
    );
    
    console.log('[UPLOAD] File type query result:', {
      fileTypeCode,
      category,
      foundRows: fileTypeRows.length,
      fileTypeId: fileTypeRows.length > 0 ? fileTypeRows[0].id : null
    });
    
    if (fileTypeRows.length === 0) {
      // Delete the file from S3 if file type not found
      await deleteFile(key);
      return res.status(404).json({ error: 'File type not found' });
    }
    
    const fileTypeId = fileTypeRows[0].id;
    
    // Handle special case for 'new' entityId
    // For 'new' entityId, we store the file but it can be reassigned later
    const effectiveEntityId = entityId === 'new' ? 0 : entityId;
    
    console.log('[UPLOAD] About to insert file record:', {
      originalname,
      key,
      fileTypeId,
      entityType,
      effectiveEntityId,
      size,
      mimetype,
      isTemporary: entityId === 'new' ? 1 : 0
    });
    
    // Save file metadata to database
    const [result] = await pool.query(
      `INSERT INTO files (
        original_name, 
        storage_path, 
        file_type_id, 
        entity_type, 
        entity_id, 
        size, 
        mime_type,
        is_temporary
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        originalname,
        key,
        fileTypeId,
        entityType,
        effectiveEntityId,
        size,
        mimetype,
        entityId === 'new' ? 1 : 0 // Mark as temporary if entityId is 'new'
      ]
    );
    
    console.log('[UPLOAD] File record inserted:', {
      insertId: result.insertId,
      affectedRows: result.affectedRows
    });
    
    // Get the inserted file
    const [fileRows] = await pool.query(
      'SELECT * FROM files WHERE id = ?',
      [result.insertId]
    );
    
    // Return file metadata with pre-signed URL
    const file = fileRows[0];
    const signedUrl = await getSignedUrl(file.storage_path);
    
    console.log('[UPLOAD] File upload completed successfully:', {
      fileId: file.id,
      storagePath: file.storage_path,
      entityType: file.entity_type,
      entityId: file.entity_id,
      isTemporary: file.is_temporary
    });
    
    res.status(201).json({
      ...file,
      url: signedUrl
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
};

/**
 * Get files for an entity
 */
export const getFilesByEntity = async (req, res) => {
  const { entityType, entityId } = req.params;
  
  try {
    const [rows] = await pool.query(
      `SELECT f.*, ft.name as file_type_name, ft.code as file_type_code, ft.category 
       FROM files f
       JOIN file_types ft ON f.file_type_id = ft.id
       WHERE f.entity_type = ? AND f.entity_id = ?
       ORDER BY f.created_at DESC`,
      [entityType, entityId]
    );
    
    // Generate pre-signed URLs for all files
    const filesWithUrls = await Promise.all(
      rows.map(async (file) => {
        const signedUrl = await getSignedUrl(file.storage_path);
        return { ...file, url: signedUrl };
      })
    );
    
    res.status(200).json(filesWithUrls);
  } catch (error) {
    console.error(`Error getting files for ${entityType} ${entityId}:`, error);
    res.status(500).json({ error: 'Failed to get files' });
  }
};

/**
 * Get files for an entity by category
 */
export const getFilesByEntityAndCategory = async (req, res) => {
  const { entityType, entityId, category } = req.params;
  
  try {
    const [rows] = await pool.query(
      `SELECT f.*, ft.name as file_type_name, ft.code as file_type_code, ft.category 
       FROM files f
       JOIN file_types ft ON f.file_type_id = ft.id
       WHERE f.entity_type = ? AND f.entity_id = ? AND ft.category = ?
       ORDER BY f.created_at DESC`,
      [entityType, entityId, category]
    );
    
    // Generate pre-signed URLs for all files
    const filesWithUrls = await Promise.all(
      rows.map(async (file) => {
        const signedUrl = await getSignedUrl(file.storage_path);
        return { ...file, url: signedUrl };
      })
    );
    
    res.status(200).json(filesWithUrls);
  } catch (error) {
    console.error(`Error getting ${category} files for ${entityType} ${entityId}:`, error);
    res.status(500).json({ error: 'Failed to get files' });
  }
};

/**
 * Get file by ID
 */
export const getFileById = async (req, res) => {
  const { fileId } = req.params;
  
  try {
    const [rows] = await pool.query(
      `SELECT f.*, ft.name as file_type_name, ft.code as file_type_code, ft.category 
       FROM files f
       JOIN file_types ft ON f.file_type_id = ft.id
       WHERE f.id = ?`,
      [fileId]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    const file = rows[0];
    const signedUrl = await getSignedUrl(file.storage_path);
    
    res.status(200).json({
      ...file,
      url: signedUrl
    });
  } catch (error) {
    console.error(`Error getting file ${fileId}:`, error);
    res.status(500).json({ error: 'Failed to get file' });
  }
};

/**
 * Delete a file
 */
export const deleteFileById = async (req, res) => {
  const { fileId } = req.params;
  
  try {
    // Get file details first
    const [fileRows] = await pool.query('SELECT * FROM files WHERE id = ?', [fileId]);
    
    if (fileRows.length === 0) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    const file = fileRows[0];
    
    // Delete from S3
    await deleteFile(file.storage_path);
    
    // Delete from database
    await pool.query('DELETE FROM files WHERE id = ?', [fileId]);
    
    res.status(200).json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error(`Error deleting file ${fileId}:`, error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
};

/**
 * Assign temporary files to an entity
 * This allows files uploaded with 'new' entityId to be reassigned to a real entity
 */
export const assignTemporaryFiles = async (req, res) => {
  const { entityType, entityId } = req.params;
  
  try {
    // Fetch all temporary files that need to be reassigned
    const [tempFiles] = await pool.query(
      `SELECT id, storage_path 
       FROM files 
       WHERE entity_type = ? AND is_temporary = 1 AND entity_id = 0`,
      [entityType]
    );

    // No files to process – return early
    if (tempFiles.length === 0) {
      return res.status(200).json({ message: 'No temporary files found' });
    }

    let movedCount = 0;

    // Process each file sequentially (or could be done in parallel with Promise.all)
    for (const file of tempFiles) {
      const sourceKey = file.storage_path; // e.g. hotels/new/general/images/filename.jpg

      // Build destination key by swapping second path segment (entityId)
      const pathParts = sourceKey.split('/');
      if (pathParts.length < 2) {
        console.warn(`Unexpected key format for ${sourceKey}. Skipping.`);
        continue;
      }

      pathParts[1] = String(entityId); // Replace 'new' with actual id
      const destinationKey = pathParts.join('/');

      // Move the file in S3
      await moveFile(sourceKey, destinationKey);

      // Update DB record for this file
      await pool.query(
        `UPDATE files 
         SET entity_id = ?, is_temporary = 0, storage_path = ? 
         WHERE id = ?`,
        [entityId, destinationKey, file.id]
      );

      movedCount += 1;
    }

    res.status(200).json({
      message: 'Temporary files assigned successfully',
      updatedCount: movedCount
    });
  } catch (error) {
    console.error(`Error assigning temporary files for ${entityType} ${entityId}:`, error);
    res.status(500).json({ error: 'Failed to assign temporary files' });
  }
};

/**
 * Service function to assign temporary files to room categories
 * This can be called from other controllers
 */
export const assignRoomCategoryFilesService = async (roomCategoryId) => {
  try {
    console.log(`[ASSIGN] Starting file assignment for room category ${roomCategoryId}`);
    
    // Fetch all temporary files that need to be reassigned for room categories
    const [tempFiles] = await pool.query(
      `SELECT id, storage_path 
       FROM files 
       WHERE entity_type = 'room-categories' AND is_temporary = 1 AND entity_id = 0`,
      []
    );

    console.log(`[ASSIGN] Found ${tempFiles.length} temporary files to assign`);

    // No files to process – return early
    if (tempFiles.length === 0) {
      console.log('[ASSIGN] No temporary files found');
      return { message: 'No temporary room category files found', updatedCount: 0 };
    }

    let movedCount = 0;

    // Process each file sequentially
    for (const file of tempFiles) {
      console.log(`[ASSIGN] Processing file ${file.id} with path ${file.storage_path}`);
      
      const sourceKey = file.storage_path; // e.g. room-categories/new/room-category-images/images/filename.jpg

      // Build destination key by swapping second path segment (entityId)
      const pathParts = sourceKey.split('/');
      if (pathParts.length < 2) {
        console.warn(`Unexpected key format for ${sourceKey}. Skipping.`);
        continue;
      }

      pathParts[1] = String(roomCategoryId); // Replace 'new' with actual room category id
      const destinationKey = pathParts.join('/');

      console.log(`[ASSIGN] Moving file from ${sourceKey} to ${destinationKey}`);

      // Move the file in S3
      await moveFile(sourceKey, destinationKey);

      // Update DB record for this file
      await pool.query(
        `UPDATE files 
         SET entity_id = ?, is_temporary = 0, storage_path = ? 
         WHERE id = ?`,
        [roomCategoryId, destinationKey, file.id]
      );

      console.log(`[ASSIGN] Updated file ${file.id} with entity_id ${roomCategoryId} and new path ${destinationKey}`);

      movedCount += 1;
    }

    console.log(`[ASSIGN] Successfully assigned ${movedCount} files to room category ${roomCategoryId}`);

    return {
      message: 'Room category files assigned successfully',
      updatedCount: movedCount
    };
  } catch (error) {
    console.error(`Error assigning room category files for room category ${roomCategoryId}:`, error);
    throw error;
  }
};

/**
 * Assign temporary files to room categories
 * This allows files uploaded with 'new' entityId to be reassigned to room categories
 */
export const assignRoomCategoryFiles = async (req, res) => {
  const { roomCategoryId } = req.params;
  
  try {
    const result = await assignRoomCategoryFilesService(roomCategoryId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to assign room category files' });
  }
};

/**
 * Get all room-category files for every room belonging to a hotel
 */
export const getRoomFilesByHotel = async (req, res) => {
  const { hotelId } = req.params;
  if (!hotelId) return res.status(400).json({ error: 'hotelId required' });
  try {
    const [rows] = await pool.query(
      `SELECT f.*, ft.name as file_type_name, ft.code as file_type_code, ft.category, r.id AS room_id 
       FROM files f
       JOIN file_types ft ON ft.id = f.file_type_id
       JOIN rooms r ON r.id = f.entity_id
       WHERE r.hotel_id = ? AND f.entity_type = 'rooms' AND ft.category = 'room'
       ORDER BY f.created_at DESC`,
      [hotelId]
    );

    const filesWithUrls = await Promise.all(rows.map(async file => ({
      ...file,
      url: await getSignedUrl(file.storage_path)
    })));

    res.json(filesWithUrls);
  } catch (err) {
    console.error('Error getRoomFilesByHotel', err);
    res.status(500).json({ error: 'Failed to get room files for hotel' });
  }
}; 