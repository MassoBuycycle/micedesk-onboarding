import pool from '../db/config.js';

/**
 * Get all AV equipment for an event
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const getAvEquipmentByEventId = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const eventId = parseInt(req.params.eventId);
    
    // Check if event exists
    const [events] = await connection.query(
      'SELECT id FROM events WHERE id = ?',
      [eventId]
    );
    
    if (events.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Get equipment for this event
    const [equipment] = await connection.query(
      'SELECT * FROM event_equipment WHERE event_id = ?',
      [eventId]
    );
    
    res.status(200).json(equipment);
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Get AV equipment by ID
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const getAvEquipmentById = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const equipmentId = parseInt(req.params.id);
    
    const [equipment] = await connection.query(
      'SELECT * FROM event_equipment WHERE id = ?',
      [equipmentId]
    );
    
    if (equipment.length === 0) {
      return res.status(404).json({ error: 'AV equipment not found' });
    }
    
    res.status(200).json(equipment[0]);
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Create AV equipment for an event
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const createAvEquipment = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const eventId = parseInt(req.params.eventId);
    const { equipment_id, quantity, price } = req.body; // Matches event_equipment schema

    if (!eventId || equipment_id === undefined) {
      return res.status(400).json({ error: 'Missing required fields: eventId (param) and equipment_id (body) are required' });
    }

    // Optional: Check if eventId and equipment_id exist in their respective tables
    // const [events] = await connection.query('SELECT id FROM events WHERE id = ?', [eventId]);
    // const [eqTypes] = await connection.query('SELECT id FROM equipment_types WHERE id = ?', [equipment_id]);
    // if (events.length === 0 || eqTypes.length === 0) { ... return 404 ... }

    const [result] = await connection.query(
      'INSERT INTO event_equipment (event_id, equipment_id, quantity, price, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
      [eventId, equipment_id, quantity ?? 0, price ?? 0] // Use defaults if not provided
    );

    // Cannot get insertId for composite key easily. Fetch the created row.
    const [equipmentRows] = await connection.query(
      'SELECT ee.*, et.name as equipment_name FROM event_equipment ee JOIN equipment_types et ON ee.equipment_id = et.id WHERE ee.event_id = ? AND ee.equipment_id = ?',
      [eventId, equipment_id]
    );

    res.status(201).json({
      success: true,
      // Return the created data, maybe composite key info
      equipment: equipmentRows[0] 
    });
  } catch (error) {
     // Handle potential duplicate primary key error (trying to add same equipment to same event twice)
    if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: `Equipment ID ${req.body.equipment_id} already exists for Event ID ${req.params.eventId}` });
    }
    // Handle FK constraint errors if event or equipment type doesn't exist
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        // Check which FK failed - requires more specific error parsing or pre-checks
         return res.status(400).json({ error: `Invalid event_id or equipment_id provided.` });
    }
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Bulk create AV equipment for an event
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const bulkCreateAvEquipment = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const eventId = parseInt(req.params.eventId);
    const equipmentList = req.body; // Expects an array: [{equipment_id, quantity, price}, ...]

    if (!eventId || !Array.isArray(equipmentList) || equipmentList.length === 0) {
      return res.status(400).json({ error: 'Missing eventId (param) or invalid/empty equipment list in body' });
    }

    // Optional: Check if eventId exists

    // Prepare bulk insert data
    const insertValues = equipmentList.map(eq => [
      eventId,
      eq.equipment_id,
      eq.quantity ?? 0,
      eq.price ?? 0,
      // Assuming NOW() for created_at, updated_at handled by DB default/trigger
    ]);

    // Validate all equipment_id values are provided
    if (insertValues.some(val => val[1] === undefined)) {
        return res.status(400).json({ error: 'Each item in equipment list must have an equipment_id' });
    }

    // Note: INSERT IGNORE might be useful to skip duplicates if desired
    // Or use INSERT ... ON DUPLICATE KEY UPDATE quantity = VALUES(quantity), price = VALUES(price)
    const [result] = await connection.query(
      'INSERT INTO event_equipment (event_id, equipment_id, quantity, price) VALUES ? ON DUPLICATE KEY UPDATE quantity=VALUES(quantity), price=VALUES(price), updated_at=NOW()',
      [insertValues]
    );

    // result.affectedRows gives count of affected rows (inserted or updated)
    // result.insertId is not useful for bulk inserts

    res.status(201).json({
      success: true,
      affectedRows: result.affectedRows,
      message: `${result.affectedRows} equipment entries created or updated.`
    });
  } catch (error) {
    // Handle FK errors etc.
     if (error.code === 'ER_NO_REFERENCED_ROW_2') {
         return res.status(400).json({ error: `Invalid event_id or one or more equipment_id values provided.` });
    }
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Update AV equipment for an event - NEEDS REWORK
 * Original route PUT /equipment/:id assumes single numeric ID
 * New table `event_equipment` has composite key (event_id, equipment_id)
 * Route should likely be PUT /events/:eventId/equipment/:equipmentId
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const updateAvEquipment = async (req, res, next) => {
    return res.status(501).json({ error: 'Update equipment endpoint needs rework for new schema (composite key)'});
  // Logic would involve getting event_id and equipment_id from params
  // Then updating quantity/price for that specific row in event_equipment
};

/**
 * Delete AV equipment for an event - NEEDS REWORK
 * Original route DELETE /equipment/:id assumes single numeric ID
 * New table `event_equipment` has composite key (event_id, equipment_id)
 * Route should likely be DELETE /events/:eventId/equipment/:equipmentId
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const deleteAvEquipment = async (req, res, next) => {
   return res.status(501).json({ error: 'Delete equipment endpoint needs rework for new schema (composite key)'});
  // Logic would involve getting event_id and equipment_id from params
  // Then deleting that specific row from event_equipment
}; 