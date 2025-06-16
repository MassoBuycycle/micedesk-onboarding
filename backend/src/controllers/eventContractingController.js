import pool from '../db/config.js';

/**
 * Get contracting info for an event
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const getContractingByEventId = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const eventId = parseInt(req.params.eventId);
    
    // Check if event exists
    const [events] = await connection.query(
      'SELECT id FROM onboarding_events WHERE id = ?',
      [eventId]
    );
    
    if (events.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Get contracting info
    const [contractingInfo] = await connection.query(
      'SELECT * FROM event_contracting WHERE event_id = ?',
      [eventId]
    );
    
    if (contractingInfo.length === 0) {
      return res.status(404).json({ error: 'Contracting information not found for this event' });
    }
    
    res.status(200).json(contractingInfo[0]);
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Create or update contracting info for an event
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const createOrUpdateContracting = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const eventId = parseInt(req.params.eventId);
    const contractingData = req.body;
    
    // Validate required fields
    if (!eventId) {
      return res.status(400).json({ error: 'Event ID is required' });
    }
    
    // Check if event exists
    const [events] = await connection.query(
      'SELECT id FROM onboarding_events WHERE id = ?',
      [eventId]
    );
    
    if (events.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Check if contracting info already exists
    const [existingInfo] = await connection.query(
      'SELECT id FROM event_contracting WHERE event_id = ?',
      [eventId]
    );
    
    // Assign event_id to data
    contractingData.event_id = eventId;
    
    // Extract fields and values from contractingData
    const fields = Object.keys(contractingData);
    const values = Object.values(contractingData);
    
    let result;
    
    if (existingInfo.length === 0) {
      // Create new record
      const placeholders = fields.map(() => '?').join(', ');
      const query = `
        INSERT INTO event_contracting (${fields.join(', ')}, created_at, updated_at)
        VALUES (${placeholders}, NOW(), NOW())
      `;
      
      [result] = await connection.query(query, values);
    } else {
      // Update existing record
      const updateFields = fields.map(field => `${field} = ?`).join(', ');
      const query = `
        UPDATE event_contracting 
        SET ${updateFields}, updated_at = NOW()
        WHERE event_id = ?
      `;
      
      [result] = await connection.query(query, [...values, eventId]);
    }
    
    // Get the updated record
    const [contractingInfo] = await connection.query(
      'SELECT * FROM event_contracting WHERE event_id = ?',
      [eventId]
    );
    
    res.status(200).json({
      success: true,
      contracting: contractingInfo[0]
    });
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
}; 