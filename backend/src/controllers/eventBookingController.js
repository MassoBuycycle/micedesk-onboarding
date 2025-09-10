import pool from '../db/config.js';

/**
 * Get booking information for an event
 */
export const getEventBooking = async (req, res) => {
  const eventId = parseInt(req.params.id);
  
  if (!eventId) {
    return res.status(400).json({ error: 'Event ID is required' });
  }
  
  let connection;
  try {
    connection = await pool.getConnection();

    const [rows] = await connection.query(
      'SELECT event_id, has_options, allows_split_options, option_duration, allows_overbooking, rooms_only, last_minute_leadtime, contracted_companies, refused_requests, unwanted_marketing, requires_second_signature, exclusive_clients FROM event_details WHERE event_id = ?',
      [eventId]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Booking information not found for this event' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch booking information' });
  } finally {
    if (connection) connection.release();
  }
};

/**
 * Create or update booking information for an event
 */
export const createOrUpdateEventBooking = async (req, res) => {
  const eventId = parseInt(req.params.id);
  
  if (!eventId) {
    return res.status(400).json({ error: 'Event ID is required' });
  }
  
  let connection;
  try {
    connection = await pool.getConnection();

    // Check if unified record already exists for this event
    const [existingRows] = await connection.query(
      'SELECT event_id FROM event_details WHERE event_id = ?',
      [eventId]
    );
    
    const isUpdate = existingRows.length > 0;
    let result;

    // Map incoming body into only the columns that really exist in the DB
    const ALLOWED_FIELDS = [
      'has_options',
      'allows_split_options',
      'option_duration',
      'allows_overbooking',
      'rooms_only',
      'last_minute_leadtime',
      'contracted_companies',
      'refused_requests',
      'unwanted_marketing',
      'requires_second_signature',
      'exclusive_clients'
    ];

    // Build a clean data object so we never attempt to insert / update an unknown column
    const bookingData = {};
    for (const [key, value] of Object.entries(req.body || {})) {
      if (ALLOWED_FIELDS.includes(key)) {
        bookingData[key] = value;
      }
    }

    // Handle possible alternative naming coming from the UI (snake-case vs camel-case)
    if (req.body.last_minute_lead_time !== undefined) {
      bookingData.last_minute_leadtime = req.body.last_minute_lead_time;
    }

    if (isUpdate) {
      // Update existing booking data
      const fields = Object.keys(bookingData).filter(key => key !== 'event_id');
      if (fields.length > 0) {
        const setClause = fields.map(field => `${field} = ?`).join(', ');
        const values = fields.map(f => bookingData[f]);
        await connection.query(
          `UPDATE event_details SET ${setClause} WHERE event_id = ?`,
          [...values, eventId]
        );
      }

      const [updatedRows] = await connection.query(
        'SELECT * FROM event_booking WHERE event_id = ?',
        [eventId]
      );

      result = updatedRows[0];
      res.json({
        message: 'Booking information updated successfully',
        data: result
      });
    } else {
      // Create new booking data
      const fields = Object.keys(bookingData).filter(key => key !== 'event_id');
      const placeholders = fields.map(() => '?').join(', ');
      const values = fields.map(f => bookingData[f]);

      if (fields.length > 0) {
        await connection.query(
          `INSERT INTO event_details (event_id, ${fields.join(', ')}) VALUES (?, ${placeholders})`,
          [eventId, ...values]
        );
      } else {
        // If no additional fields provided just insert event_id
        await connection.query(
          'INSERT INTO event_details (event_id) VALUES (?)',
          [eventId]
        );
      }

      const [createdRows] = await connection.query(
        'SELECT event_id, has_options, allows_split_options, option_duration, allows_overbooking, rooms_only, last_minute_leadtime, contracted_companies, refused_requests, unwanted_marketing, requires_second_signature, exclusive_clients FROM event_details WHERE event_id = ?',
        [eventId]
      );

      result = createdRows[0];
      res.status(201).json({
        message: 'Booking information created successfully',
        data: result
      });
    }
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to save booking information',
      details: error.message || error.sqlMessage || 'Unknown database error'
    });
  } finally {
    if (connection) connection.release();
  }
}; 