import pool from '../db/config.js';
import { extractDataForTable } from '../utils/dataMapping.js';

const EVENT_OPERATIONS_FIELDS = [
  'sold_with_rooms_only', 'last_minute_lead_time', 'sent_over_time_material', 'lunch_location',
  'min_participants_package', 'coffee_break_location', 'advance_days_for_material', 'room_drop_cost',
  'hotel_exclusive_clients', 'exclusive_clients_info', 'deposit_needed_event',
  'deposit_rules_event', 'deposit_invoice_creator', 'informational_invoice_created',
  'payment_methods_events', 'final_invoice_handling_event',
  'contracted_companies', 'refused_requests', 'unwanted_marketing_tools',
  'first_second_option', 'split_options', 'option_hold_duration', 'overbooking_policy',
  'deposit_required', 'accepted_payment_methods', 'commission_rules', 'second_signature_required',
  'has_overtime_material', 'coffee_break_location',
  'has_storage', 'has_minimum_spent', 'minimum_spent_info',
  // Storage handling fields
  'storage_free_of_charge', 'storage_pricing_info'
];

const BOOLEAN_FIELDS = [
  'sold_with_rooms_only','sent_over_time_material','hotel_exclusive_clients','has_overtime_material','has_storage','deposit_needed_event','informational_invoice_created','first_second_option','split_options','overbooking_policy','deposit_required','second_signature_required','has_minimum_spent','storage_free_of_charge'
];

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
      const [events] = await connection.query('SELECT id FROM onboarding_events WHERE id = ?', [eventId]);
      if (events.length === 0) {
        return res.status(404).json({ error: 'Event not found' });
      }
      
      // Get operations from unified onboarding_event_details
      const [operations] = await connection.query(
        'SELECT * FROM onboarding_event_details WHERE event_id = ?',
        [eventId]
      );
      
      if (operations.length === 0) {
        return res.status(404).json({ error: 'Operations information not found for this event' });
      }
      
      // Parse JSON field if stored as string
      if (operations[0].payment_methods_events && typeof operations[0].payment_methods_events === 'string') {
        try {
          operations[0].payment_methods_events = JSON.parse(operations[0].payment_methods_events);
        } catch(e) { /* ignore */ }
      }
      
      // Convert numeric tinyint values to booleans
      BOOLEAN_FIELDS.forEach(f=>{
        if (operations[0][f]!==undefined) operations[0][f]=Boolean(operations[0][f]);
      });
      
      res.status(200).json(operations[0]);
    } finally {
      connection.release();
    }
  } catch (error) {
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
      const [events] = await connection.query('SELECT id FROM onboarding_events WHERE id = ?', [eventId]);
      if (events.length === 0) {
        return res.status(404).json({ error: 'Event not found' });
      }
      
      
      // Build data object automatically based on allowed field list
      const operationsData = extractDataForTable(req.body, EVENT_OPERATIONS_FIELDS) || {};
      
      // Convert JSON field if necessary
      if (operationsData.payment_methods_events !== undefined && typeof operationsData.payment_methods_events !== 'string') {
        operationsData.payment_methods_events = JSON.stringify(operationsData.payment_methods_events);
      }
      
      
      // Check if unified record already exists
      const [existingRows] = await connection.query(
        'SELECT event_id FROM onboarding_event_details WHERE event_id = ?',
        [eventId]
      );
      
      if (existingRows.length > 0) {
        // Update existing operations
        const fields = Object.keys(operationsData);
        if (fields.length > 0) {
          const setClause = fields.map(f => `${f} = ?`).join(', ');
          const values = fields.map(f => operationsData[f]);
          await connection.query(
            `UPDATE onboarding_event_details SET ${setClause} WHERE event_id = ?`,
            [...values, eventId]
          );
        }
      } else {
        // Create new operations record
        const fields = Object.keys(operationsData).filter(f => f && f.trim().length > 0);
        const placeholders = fields.map(() => '?').join(', ');
        const values = fields.map(f => operationsData[f]);
        await connection.query(
          `INSERT INTO onboarding_event_details (event_id${fields.length ? ', ' + fields.join(', ') : ''}) VALUES (?${fields.length ? ', ' + placeholders : ''})`,
          [eventId, ...values]
        );
      }
      
      // Get the updated operations data
      const [operationsRows] = await connection.query(
        'SELECT * FROM onboarding_event_details WHERE event_id = ?',
        [eventId]
      );
      
      // Convert numeric tinyint values to booleans
      BOOLEAN_FIELDS.forEach(f=>{
        if (operationsRows[0][f]!==undefined) operationsRows[0][f]=Boolean(operationsRows[0][f]);
      });
      
      res.status(200).json({
        success: true,
        operations: operationsRows[0]
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to save operations information' });
  }
}; 