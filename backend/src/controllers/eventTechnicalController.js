import pool from '../db/config.js';
import { extractDataForTable } from '../utils/dataMapping.js';

const TECHNICAL_FIELDS = [
  'beamer_lumens', 'copy_cost', 'software_presentation', 'wifi_data_rate',
  'has_ac_or_ventilation', 'has_blackout_curtains', 'is_soundproof', 'has_daylight',
  'is_hybrid_meeting_possible', 'technical_support_available', 'technical_notes'
];

/**
 * Get technical info for an event
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const getTechnicalByEventId = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const eventId = parseInt(req.params.id);
    
    // Check if event exists
    const [events] = await connection.query(
      'SELECT id FROM onboarding_events WHERE id = ?',
      [eventId]
    );
    
    if (events.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Get technical info from unified event_details
    const [technicalInfo] = await connection.query(
      'SELECT event_id, beamer_lumens, copy_cost, software_presentation, wifi_data_rate, has_ac_or_ventilation, has_blackout_curtains, is_soundproof, has_daylight, is_hybrid_meeting_possible, technical_support_available, technical_notes, created_at, updated_at FROM event_details WHERE event_id = ?',
      [eventId]
    );
    
    if (technicalInfo.length === 0) {
      return res.status(404).json({ error: 'Technical information not found for this event' });
    }
    
    res.status(200).json(technicalInfo[0]);
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Create or update technical info for an event
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const createOrUpdateTechnical = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const eventId = parseInt(req.params.id);
    const technicalData = extractDataForTable(req.body, TECHNICAL_FIELDS) || {};
    
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
    
    // Check if unified record already exists
    const [existingInfo] = await connection.query(
      'SELECT event_id FROM event_details WHERE event_id = ?',
      [eventId]
    );
    
    // Assign event_id to data
    technicalData.event_id = eventId;
    
    // Extract fields and values from technicalData
    const fields = Object.keys(technicalData);
    const values = Object.values(technicalData);
    
    let result;
    
    if (existingInfo.length === 0) {
      // Create new record
      const placeholders = fields.map(() => '?').join(', ');
      const query = `
        INSERT INTO event_details (${fields.join(', ')}, created_at, updated_at)
        VALUES (${placeholders}, NOW(), NOW())
      `;
      
      [result] = await connection.query(query, values);
    } else {
      // Update existing record
      const updateFields = fields.map(field => `${field} = ?`).join(', ');
      const query = `
        UPDATE event_details 
        SET ${updateFields}, updated_at = NOW()
        WHERE event_id = ?
      `;
      
      [result] = await connection.query(query, [...values, eventId]);
    }
    
    // Get the updated record
    const [technicalInfo] = await connection.query(
      'SELECT event_id, beamer_lumens, copy_cost, software_presentation, wifi_data_rate, has_ac_or_ventilation, has_blackout_curtains, is_soundproof, has_daylight, is_hybrid_meeting_possible, technical_support_available, technical_notes, created_at, updated_at FROM event_details WHERE event_id = ?',
      [eventId]
    );
    
    res.status(200).json({
      success: true,
      technical: technicalInfo[0]
    });
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
}; 