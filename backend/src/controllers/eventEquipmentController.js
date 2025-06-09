import pool from '../db/config.js';

/**
 * Get all equipment types
 */
export const getAllEquipmentTypes = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const [equipmentTypes] = await connection.query(
      'SELECT id, equipment_name, description FROM equipment_types ORDER BY equipment_name'
    );
    
    res.status(200).json(equipmentTypes);
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Get equipment for an event
 */
export const getEventEquipment = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const eventId = parseInt(req.params.id);
    if (!eventId) {
      return res.status(400).json({ error: 'Event ID required' });
    }
    
    // Check if event exists
    const [events] = await connection.query('SELECT id FROM events WHERE id = ?', [eventId]);
    if (events.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Get equipment items with their names from equipment_types
    const [equipment] = await connection.query(
      `SELECT ee.equipment_id, et.equipment_name, ee.quantity, ee.price 
       FROM event_equipment ee
       JOIN equipment_types et ON ee.equipment_id = et.id
       WHERE ee.event_id = ?`,
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
 * Save equipment for an event
 */
export const upsertEventEquipment = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const eventId = parseInt(req.params.id);
    const equipmentItems = req.body;
    
    if (!eventId) {
      return res.status(400).json({ error: 'Event ID missing' });
    }
    
    if (!Array.isArray(equipmentItems)) {
      return res.status(400).json({ error: 'Equipment items must be an array' });
    }
    
    // Check if event exists
    const [events] = await connection.query('SELECT id FROM events WHERE id = ?', [eventId]);
    if (events.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Clear existing equipment for this event
    await connection.query('DELETE FROM event_equipment WHERE event_id = ?', [eventId]);
    
    // Insert new equipment items
    if (equipmentItems.length > 0) {
      const insertValues = equipmentItems
        .filter(item => item.equipment_id && (item.quantity > 0 || item.price > 0))
        .map(item => [eventId, item.equipment_id, item.quantity || 0, item.price || 0]);
      
      if (insertValues.length > 0) {
        await connection.query(
          'INSERT INTO event_equipment (event_id, equipment_id, quantity, price) VALUES ?',
          [insertValues]
        );
      }
    }
    
    // Return updated equipment with names
    const [updatedEquipment] = await connection.query(
      `SELECT ee.equipment_id, et.equipment_name, ee.quantity, ee.price 
       FROM event_equipment ee
       JOIN equipment_types et ON ee.equipment_id = et.id
       WHERE ee.event_id = ?`,
      [eventId]
    );
    
    res.status(200).json({
      success: true,
      equipment: updatedEquipment
    });
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
}; 