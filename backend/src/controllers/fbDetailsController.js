import pool from '../db/config.js';

// List of columns that can be updated/inserted
export const FB_DETAILS_FIELDS = [
  'fnb_contact_position',
  'fnb_contact_name',
  'fnb_contact_phone',
  'fnb_contact_email',
  'restaurant_name',
  'restaurant_cuisine',
  'restaurant_seats',
  'restaurant_opening_hours',
  'restaurant_exclusive',
  'restaurant_price_minimum',
  'bar_name',
  'bar_seats',
  'bar_exclusive',
  'bar_snacks_available',
  'bar_opening_hours',
  'service_times',
  'breakfast_restaurant_name',
  'breakfast_start_time',
  'breakfast_cost_per_person',
  'breakfast_cost_per_child',
  'breakfast_event_available',
  'operational_lead_time',
  'allergy_diet_deadline',
  'buffet_minimum_persons',
  'fnb_packages_available',
  'extra_packages_customized',
  'coffee_break_items',
  'lunch_standard_items',
  'buffet_minimum_for_lunch',
  'function_created_by',
  'function_completion_time',
  'function_required_depts',
  'function_meeting_people',
  'mice_desk_involvement'
];

/**
 * Helper to extract only valid fields from request body
 */
const extractDetailsData = (sourceData) => {
  const extracted = {};
  let hasData = false;
  FB_DETAILS_FIELDS.forEach((field) => {
    if (sourceData[field] !== undefined) {
      extracted[field] = sourceData[field];
      hasData = true;
    }
  });
  return hasData ? extracted : null;
};

/**
 * Upsert food & beverage details for a hotel
 * Route: POST /api/hotels/:hotelId/fb/details
 */
export const upsertFbDetails = async (req, res, next) => {
  const { hotelId } = req.params;
  if (isNaN(parseInt(hotelId))) {
    return res.status(400).json({ error: 'Invalid hotelId parameter.' });
  }

  const detailsData = extractDetailsData(req.body);
  if (!detailsData) {
    return res.status(400).json({ error: 'No valid F&B detail fields provided.' });
  }

  let connection;
  try {
    connection = await pool.getConnection();

    // Ensure hotel exists
    const [hotels] = await connection.query('SELECT id FROM hotels WHERE id = ?', [hotelId]);
    if (hotels.length === 0) {
      return res.status(404).json({ error: `Hotel with ID ${hotelId} not found.` });
    }

    const fields = Object.keys(detailsData);
    const placeholders = fields.map((f) => `${f} = VALUES(${f})`).join(', ');
    const values = fields.map((f) => detailsData[f]);

    // Build INSERT ON DUPLICATE KEY UPDATE query
    const sql = `INSERT INTO food_beverage_details (hotel_id, ${fields.join(', ')}) VALUES (?, ${fields
      .map(() => '?')
      .join(', ')}) ON DUPLICATE KEY UPDATE ${placeholders}, updated_at = NOW()`;

    await connection.query(sql, [hotelId, ...values]);

    // Return updated record
    const [rows] = await connection.query(
      'SELECT * FROM food_beverage_details WHERE hotel_id = ?',
      [hotelId]
    );

    res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Error in upsertFbDetails:', error);
    next(error);
  } finally {
    if (connection) connection.release();
  }
};

/**
 * Get F&B details for a hotel
 * Route: GET /api/hotels/:hotelId/fb/details
 */
export const getFbDetails = async (req, res, next) => {
  const { hotelId } = req.params;
  if (isNaN(parseInt(hotelId))) {
    return res.status(400).json({ error: 'Invalid hotelId parameter.' });
  }
  let connection;
  try {
    connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM food_beverage_details WHERE hotel_id = ?', [hotelId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: `F&B details not found for hotel ID ${hotelId}.` });
    }
    res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Error in getFbDetails:', error);
    next(error);
  } finally {
    if (connection) connection.release();
  }
};

/**
 * Delete F&B details for a hotel
 * Route: DELETE /api/hotels/:hotelId/fb/details
 */
export const deleteFbDetails = async (req, res, next) => {
  const { hotelId } = req.params;
  if (isNaN(parseInt(hotelId))) {
    return res.status(400).json({ error: 'Invalid hotelId parameter.' });
  }
  let connection;
  try {
    connection = await pool.getConnection();
    const [result] = await connection.query('DELETE FROM food_beverage_details WHERE hotel_id = ?', [hotelId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: `F&B details not found for hotel ID ${hotelId}, nothing to delete.` });
    }
    res.status(200).json({ success: true, message: 'F&B details deleted.' });
  } catch (error) {
    console.error('Error in deleteFbDetails:', error);
    next(error);
  } finally {
    if (connection) connection.release();
  }
}; 