import pool from '../db/config.js';

/**
 * Get operations information for an event
 */
export const getEventOperations = async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    if (!eventId) {
      return res.status(400).json({ error: 'Event ID required' });
    }
    
    const connection = await pool.getConnection();
    try {
      // Check if event exists
      const [events] = await connection.query('SELECT id FROM events WHERE id = ?', [eventId]);
      if (events.length === 0) {
        return res.status(404).json({ error: 'Event not found' });
      }
      
      // Get operations data
      const [operations] = await connection.query(
        'SELECT * FROM event_operations WHERE event_id = ?',
        [eventId]
      );
      
      if (operations.length === 0) {
        return res.status(404).json({ error: 'Operations information not found for this event' });
      }
      
      res.status(200).json(operations[0]);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error fetching event operations information:', error);
    res.status(500).json({ error: 'Failed to fetch operations information' });
  }
};

/**
 * Create or update operations information for an event
 */
export const createOrUpdateEventOperations = async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    if (!eventId) {
      return res.status(400).json({ error: 'Event ID required' });
    }
    
    const connection = await pool.getConnection();
    try {
      // Check if event exists
      const [events] = await connection.query('SELECT id FROM events WHERE id = ?', [eventId]);
      if (events.length === 0) {
        return res.status(404).json({ error: 'Event not found' });
      }
      
      console.log('Received operations data:', JSON.stringify(req.body));
      
      // Extract and process all fields from request body
      const operationsData = {};
      
      // Boolean fields
      if (req.body.has_overtime_material !== undefined)
        operationsData.has_overtime_material = req.body.has_overtime_material;
      
      if (req.body.has_storage !== undefined)
        operationsData.has_storage = req.body.has_storage;
      
      // String fields
      if ('lunch_location' in req.body)
        operationsData.lunch_location = req.body.lunch_location || '';
      
      if ('coffee_location' in req.body)
        operationsData.coffee_location = req.body.coffee_location || '';
      
      // Numeric fields
      if ('min_participants' in req.body) {
        const minParticipants = parseInt(req.body.min_participants);
        operationsData.min_participants = isNaN(minParticipants) ? 0 : minParticipants;
      }
      
      if ('material_advance_days' in req.body) {
        const advanceDays = parseInt(req.body.material_advance_days);
        operationsData.material_advance_days = isNaN(advanceDays) ? 0 : advanceDays;
      }
      
      if ('room_drop_fee' in req.body) {
        const dropFee = parseFloat(req.body.room_drop_fee);
        operationsData.room_drop_fee = isNaN(dropFee) ? 0 : dropFee;
      }
      
      console.log('Processed operations data:', JSON.stringify(operationsData));
      
      // Check if operations record already exists
      const [existingRows] = await connection.query(
        'SELECT id FROM event_operations WHERE event_id = ?',
        [eventId]
      );
      
      if (existingRows.length > 0) {
        // Update existing operations
        const fields = Object.keys(operationsData);
        if (fields.length > 0) {
          const setClause = fields.map(f => `${f} = ?`).join(', ');
          const values = fields.map(f => operationsData[f]);
          await connection.query(
            `UPDATE event_operations SET ${setClause} WHERE event_id = ?`,
            [...values, eventId]
          );
        }
      } else {
        // Create new operations record
        const fields = Object.keys(operationsData);
        const placeholders = fields.map(() => '?').join(', ');
        const values = fields.map(f => operationsData[f]);
        await connection.query(
          `INSERT INTO event_operations (event_id${fields.length ? ', ' + fields.join(', ') : ''}) VALUES (?${fields.length ? ', ' + placeholders : ''})`,
          [eventId, ...values]
        );
      }
      
      // Get the updated operations data
      const [operationsRows] = await connection.query(
        'SELECT * FROM event_operations WHERE event_id = ?',
        [eventId]
      );
      
      res.status(200).json({
        success: true,
        operations: operationsRows[0]
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error in createOrUpdateEventOperations:', error);
    res.status(500).json({ error: 'Failed to save operations information' });
  }
}; 