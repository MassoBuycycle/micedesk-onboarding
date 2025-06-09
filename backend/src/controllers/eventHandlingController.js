import pool from '../db/config.js';

/**
 * Get handling info for an event
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const getHandlingByEventId = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const eventId = parseInt(req.params.eventId);
    
    // Check if event exists
    const [events] = await connection.query(
      'SELECT id FROM event_main WHERE id = ?',
      [eventId]
    );
    
    if (events.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Get handling info
    const [handlingInfo] = await connection.query(
      'SELECT * FROM event_handling WHERE event_id = ?',
      [eventId]
    );
    
    if (handlingInfo.length === 0) {
      return res.status(404).json({ error: 'Handling information not found for this event' });
    }
    
    res.status(200).json(handlingInfo[0]);
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Create or update handling info for an event
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const createOrUpdateHandling = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const eventId = parseInt(req.params.eventId);
    const handlingData = req.body;
    
    // Validate required fields
    if (!eventId) {
      return res.status(400).json({ error: 'Event ID is required' });
    }
    
    // Check if event exists
    const [events] = await connection.query(
      'SELECT id FROM event_main WHERE id = ?',
      [eventId]
    );
    
    if (events.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Check if handling info already exists
    const [existingInfo] = await connection.query(
      'SELECT id FROM event_handling WHERE event_id = ?',
      [eventId]
    );
    
    // Assign event_id to data
    handlingData.event_id = eventId;
    
    // Special handling for JSON fields
    if (handlingData.payment_methods_events && typeof handlingData.payment_methods_events !== 'string') {
      handlingData.payment_methods_events = JSON.stringify(handlingData.payment_methods_events);
    }
    
    // Extract fields and values from handlingData
    const fields = Object.keys(handlingData);
    const values = Object.values(handlingData);
    
    let result;
    
    if (existingInfo.length === 0) {
      // Create new record
      const placeholders = fields.map(() => '?').join(', ');
      const query = `
        INSERT INTO event_handling (${fields.join(', ')}, created_at, updated_at)
        VALUES (${placeholders}, NOW(), NOW())
      `;
      
      [result] = await connection.query(query, values);
    } else {
      // Update existing record
      const updateFields = fields.map(field => `${field} = ?`).join(', ');
      const query = `
        UPDATE event_handling 
        SET ${updateFields}, updated_at = NOW()
        WHERE event_id = ?
      `;
      
      [result] = await connection.query(query, [...values, eventId]);
    }
    
    // Get the updated record
    const [handlingInfo] = await connection.query(
      'SELECT * FROM event_handling WHERE event_id = ?',
      [eventId]
    );
    
    // Parse JSON fields for response
    if (handlingInfo[0] && handlingInfo[0].payment_methods_events) {
      try {
        handlingInfo[0].payment_methods_events = JSON.parse(handlingInfo[0].payment_methods_events);
      } catch (e) {
        // If parsing fails, keep the original string
      }
    }
    
    res.status(200).json({
      success: true,
      handling: handlingInfo[0]
    });
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
}; 