import pool from '../db/config.js';
import { extractDataForTable } from '../utils/dataMapping.js';

// Field group constants based on the new schema and your INSERT examples
const EVENTS_MAIN_FIELDS = ['hotel_id', 'contact_name', 'contact_phone', 'contact_email', 'contact_position'];

const EVENT_BOOKING_FIELDS = [
    'has_options', 'allows_split_options', 'option_duration', 'allows_overbooking', 'rooms_only',
    'last_minute_leadtime', 'contracted_companies', 'refused_requests', 'unwanted_marketing',
    'requires_second_signature', 'exclusive_clients'
];

const EVENT_FINANCIALS_FIELDS = [
    'requires_deposit', 'deposit_rules', 'deposit_invoicer', 'has_info_invoice', 'payment_methods', // payment_methods is JSON
    'invoice_handling', 'commission_rules', 'has_minimum_spent'
];

const EVENT_OPERATIONS_FIELDS = [
    // Fields from event_handling
    'sold_with_rooms_only',
    'last_minute_lead_time',
    'sent_over_time_material',
    'lunch_location',
    'min_participants_package',
    'coffee_break_location',
    'advance_days_for_material',
    'room_drop_cost',
    'hotel_exclusive_clients',
    'deposit_needed_event',
    'deposit_rules_event',
    'deposit_invoice_creator',
    'informational_invoice_created',
    'payment_methods_events',
    'final_invoice_handling_event',
    
    // Fields from event_contracting
    'contracted_companies',
    'refused_requests',
    'unwanted_marketing_tools',
    'first_second_option',
    'split_options',
    'option_hold_duration',
    'overbooking_policy',
    'deposit_required',
    'accepted_payment_methods',
    'commission_rules',
    'second_signature_required',
    
    // Fields with alternative naming from new schema
    'has_overtime_material',
    'has_storage',
    'has_minimum_spent'
];

const EVENT_SPACES_FIELDS = [ // For creating a single primary event space. Multiple spaces need a different approach.
    'name', 'daily_rate', 'half_day_rate', 'size', 'dimensions', 'cap_rounds', 'cap_theatre',
    'cap_classroom', 'cap_u_shape', 'cap_boardroom', 'cap_cabaret', 'cap_cocktail', 'features',
    'is_soundproof', 'has_daylight', 'has_blackout', 'has_climate_control', 'wifi_speed',
    'beamer_lumens', 'supports_hybrid', 'presentation_software', 'copy_fee', 'has_tech_support'
];

// event_equipment will be handled by its own controller/endpoint as it has composite PK and equipment_types dependency

/**
 * Get all events
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const getAllEvents = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const [events] = await connection.query(`
      SELECT e.*, h.name as hotel_name 
      FROM onboarding_events e
      JOIN hotels h ON e.hotel_id = h.id
    `);
    res.status(200).json(events);
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Get events by hotel ID
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const getEventsByHotelId = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const hotelId = parseInt(req.params.hotelId);
    
    // Check if hotel exists
    const [hotels] = await connection.query(
      'SELECT id FROM hotels WHERE id = ?',
      [hotelId]
    );
    
    if (hotels.length === 0) {
      return res.status(404).json({ error: 'Hotel not found' });
    }
    
    const [events] = await connection.query(
      'SELECT * FROM onboarding_events WHERE hotel_id = ?',
      [hotelId]
    );
    
    res.status(200).json(events);
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Get event by ID
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const getEventById = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const eventId = parseInt(req.params.id);
    
    const [events] = await connection.query(`
      SELECT e.*, h.name as hotel_name 
      FROM onboarding_events e
      JOIN hotels h ON e.hotel_id = h.id
      WHERE e.id = ?
    `, [eventId]);
    
    if (events.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.status(200).json(events[0]);
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Create a new Event and its related information
 * Endpoint: POST /api/events
 */
export const createEvent = async (req, res, next) => {
    const connection = await pool.getConnection();
    const allEventData = req.body;

    try {
        await connection.beginTransaction();

        /* =========================================================
         *  Front-end → DB field mapping for common keys.
         *  If the incoming payload uses camelCase, translate it to
         *  the exact column names expected by the queries below.
         * ========================================================= */
        const data = { ...allEventData };

        // Contact block
        if (data.contactName !== undefined) data.contact_name = data.contactName;
        if (data.contactPhone !== undefined) data.contact_phone = data.contactPhone;
        if (data.contactEmail !== undefined) data.contact_email = data.contactEmail;
        if (data.contactPosition !== undefined) data.contact_position = data.contactPosition;

        // Replace reference used later in the function
        const eventDataMapped = data;

        // 1. Insert into `events` (main table)
        const eventsMainData = extractDataForTable(eventDataMapped, EVENTS_MAIN_FIELDS);
        if (!eventsMainData || !eventsMainData.hotel_id) {
            await connection.rollback();
            return res.status(400).json({ error: 'hotel_id is required for creating an event.' });
        }

        // NEW: Verify that the referenced hotel actually exists before inserting
        const [hotelRows] = await connection.query('SELECT id FROM hotels WHERE id = ?', [eventsMainData.hotel_id]);
        if (hotelRows.length === 0) {
            await connection.rollback();
            return res.status(400).json({ error: `Hotel with id ${eventsMainData.hotel_id} does not exist.` });
        }

        // DUPLICATE PREVENTION: Check for recent duplicate events (within last 5 seconds)
        // This prevents accidental double-submissions from creating duplicate events
        const [recentEvents] = await connection.query(
            `SELECT id, created_at FROM onboarding_events 
             WHERE hotel_id = ? 
             AND created_at >= DATE_SUB(NOW(), INTERVAL 5 SECOND)
             ORDER BY created_at DESC LIMIT 1`,
            [eventsMainData.hotel_id]
        );
        
        if (recentEvents.length > 0) {
            await connection.rollback();
            const existingEventId = recentEvents[0].id;
            console.warn(`Duplicate event creation prevented for hotel_id ${eventsMainData.hotel_id}. Returning existing event ID: ${existingEventId}`);
            return res.status(409).json({ 
                error: 'An event for this hotel was just created. Please wait a few seconds before creating another event.',
                existingEventId: existingEventId,
                code: 'DUPLICATE_EVENT_DETECTED'
            });
        }

        // Filter out any empty or invalid field names
        const eventFields = Object.keys(eventsMainData).filter(f => f && f.trim().length > 0);
        
        // Debug logging
        console.log('=== EVENTS TABLE DEBUG ===');
        console.log('Event fields:', eventFields);
        console.log('Event field count:', eventFields.length);
        
        if (eventFields.length === 0) {
            await connection.rollback();
            return res.status(400).json({ error: 'No valid event fields provided' });
        }
        const eventPlaceholders = eventFields.map(() => '?').join(', ');
        const eventValues = eventFields.map(f => eventsMainData[f]);
        const eventSql = `INSERT INTO onboarding_events (${eventFields.join(', ')}) VALUES (${eventPlaceholders})`;
        
        console.log('SQL Query:', eventSql);
        console.log('Values count:', eventValues.length);
        
        const [eventResult] = await connection.query(eventSql, eventValues);
        const eventId = eventResult.insertId;

        // 2-4. Insert unified details into `event_details` table
        const bookingData = extractDataForTable(eventDataMapped, EVENT_BOOKING_FIELDS) || {};
        const financialsData = extractDataForTable(eventDataMapped, EVENT_FINANCIALS_FIELDS) || {};
        const operationsData = extractDataForTable(eventDataMapped, EVENT_OPERATIONS_FIELDS) || {};
        if (financialsData.payment_methods && typeof financialsData.payment_methods !== 'string') {
            financialsData.payment_methods = JSON.stringify(financialsData.payment_methods);
        }
        if (operationsData.payment_methods_events && typeof operationsData.payment_methods_events !== 'string') {
            operationsData.payment_methods_events = JSON.stringify(operationsData.payment_methods_events);
        }
        const unified = { ...bookingData, ...financialsData, ...operationsData };
        // Filter out empty/invalid field names
        const allFields = Object.keys(unified).filter(f => f && f.trim().length > 0);
        
        // Debug logging
        console.log('=== EVENT DETAILS DEBUG ===');
        console.log('All fields:', allFields);
        console.log('Field count:', allFields.length);
        console.log('Has empty fields:', allFields.some(f => !f || f.trim().length === 0));
        
        if (allFields.length > 0) {
            const placeholders = allFields.map(() => '?').join(', ');
            const values = allFields.map(f => unified[f]);
            const sql = `INSERT INTO event_details (event_id, ${allFields.join(', ')}) VALUES (?, ${placeholders})`;
            console.log('SQL Query:', sql);
            console.log('Values count:', values.length + 1); // +1 for eventId
            
            await connection.query(sql, [eventId, ...values]);
        } else {
            // ensure row exists
            await connection.query('INSERT INTO event_details (event_id) VALUES (?)', [eventId]);
        }
        
        // 5. Insert into `event_spaces` (handling for a single space if data present)
        const spaceData = extractDataForTable(eventDataMapped, EVENT_SPACES_FIELDS);
        let createdSpace = null;
        if (spaceData && spaceData.name) { // 'name' is NOT NULL for event_spaces
            const fields = Object.keys(spaceData).filter(f => f && f.trim().length > 0);
             if (fields.length > 0) {
                const placeholders = fields.map(() => '?').join(', ');
                const values = fields.map(f => spaceData[f]);
                const [spaceResult] = await connection.query(
                    `INSERT INTO event_spaces (event_id, ${fields.join(', ')}) VALUES (?, ${placeholders})`,
                    [eventId, ...values]
                );
                createdSpace = { id: spaceResult.insertId, ...spaceData };
            }
        }

        await connection.commit();

        res.status(201).json({
            success: true,
            eventId,
            message: 'Event and related information created. Equipment/multiple spaces handled separately.',
            event: { ...eventsMainData, id: eventId },
            booking: bookingData,
            financials: financialsData,
            operations: operationsData,
            space: createdSpace // Only if a single space was created from flat data
        });

    } catch (error) {
        await connection.rollback();
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(400).json({ error: `Invalid hotel_id: ${eventDataMapped.hotel_id}` });
        }
        next(error);
    } finally {
        if (connection) connection.release();
    }
};

/**
 * Update an existing event
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const updateEvent = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const eventId = parseInt(req.params.id);
    const { contact_name, contact_phone, contact_email, contact_position } = req.body;
    // Note: hotel_id is usually not updated

    // Build dynamic update query for allowed fields
    let updateFields = [];
    let queryParams = [];

    if (contact_name !== undefined) { updateFields.push('contact_name = ?'); queryParams.push(contact_name); }
    if (contact_phone !== undefined) { updateFields.push('contact_phone = ?'); queryParams.push(contact_phone); }
    if (contact_email !== undefined) { updateFields.push('contact_email = ?'); queryParams.push(contact_email); }
    if (contact_position !== undefined) { updateFields.push('contact_position = ?'); queryParams.push(contact_position); }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updateFields.push('updated_at = NOW()');
    queryParams.push(eventId);

    // Check if event exists
    const [existingEvents] = await connection.query(
      'SELECT id FROM onboarding_events WHERE id = ?',
      [eventId]
    );
    if (existingEvents.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Execute update
    await connection.query(
      `UPDATE onboarding_events SET ${updateFields.join(', ')} WHERE id = ?`,
      queryParams
    );

    // Get updated event (core fields only)
    const [events] = await connection.query(
      'SELECT * FROM onboarding_events WHERE id = ?',
      [eventId]
    );

    // In a real scenario, might want to fetch and include updated related data
    res.status(200).json({
      success: true,
      eventId,
      event: events[0] // Contains only fields from 'events' table
    });
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Delete an event
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const deleteEvent = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const eventId = parseInt(req.params.id);
    
    // Check if event exists
    const [existingEvents] = await connection.query(
      'SELECT id FROM onboarding_events WHERE id = ?',
      [eventId]
    );
    
    if (existingEvents.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Delete the event (cascade will delete related records)
    await connection.query(
      'DELETE FROM onboarding_events WHERE id = ?',
      [eventId]
    );
    
    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
}; 