import pool from '../db/config.js';

// List of columns that can be updated/inserted in the main F&B details table
export const FB_DETAILS_FIELDS = [
  'fnb_contact_name',
  'fnb_contact_position',
  'fnb_contact_phone',
  'fnb_contact_email',
  'total_restaurants',
  'room_service_available',
  'room_service_hours',
  'breakfast_restaurant_name',
  'breakfast_hours',
  'breakfast_cost_per_person',
  'breakfast_cost_per_child',
  'breakfast_child_pricing_tiers',
  'breakfast_room_used_for_events',
  'staff_planning_lead_time',
  'special_diet_allergy_deadline',
  'conference_packages_offered',
  'additional_packages_bookable',
  'existing_packages_customizable',
  'coffee_break_inclusions',
  'standard_lunch_offerings',
  'buffet_minimum_persons',
  'additional_packages_available',
  'functions_created_by',
  'functions_completion_deadline',
  'departments_requiring_functions',
  'function_meeting_schedule',
  'function_meeting_participants',
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
 * Helper to manage restaurants for a hotel
 */
const manageRestaurants = async (connection, hotelId, restaurants) => {
  if (!Array.isArray(restaurants)) return;

  // Delete existing restaurants
  await connection.query('DELETE FROM onboarding_fb_restaurants WHERE hotel_id = ?', [hotelId]);

  // Insert new restaurants
  if (restaurants.length > 0) {
    const restaurantValues = restaurants.map(restaurant => [
      hotelId,
      restaurant.name,
      restaurant.cuisine || null,
      restaurant.seats_indoor || 0,
      restaurant.seats_outdoor || 0,
      restaurant.exclusive_booking || false,
      restaurant.minimum_price || 0,
      restaurant.opening_hours || null
    ]);

    const placeholders = restaurants.map(() => '(?, ?, ?, ?, ?, ?, ?, ?)').join(', ');
    const sql = `INSERT INTO onboarding_fb_restaurants (hotel_id, name, cuisine, seats_indoor, seats_outdoor, exclusive_booking, minimum_price, opening_hours) VALUES ${placeholders}`;
    
    await connection.query(sql, restaurantValues.flat());
  }
};

/**
 * Helper to manage bars for a hotel
 */
const manageBars = async (connection, hotelId, bars) => {
  if (!Array.isArray(bars)) return;

  // Delete existing bars
  await connection.query('DELETE FROM onboarding_fb_bars WHERE hotel_id = ?', [hotelId]);

  // Insert new bars
  if (bars.length > 0) {
    const barValues = bars.map(bar => [
      hotelId,
      bar.name,
      bar.seats_indoor || 0,
      bar.exclusive_booking || false,
      bar.opening_hours || null,
      bar.snacks_available || false
    ]);

    const placeholders = bars.map(() => '(?, ?, ?, ?, ?, ?)').join(', ');
    const sql = `INSERT INTO onboarding_fb_bars (hotel_id, name, seats_indoor, exclusive_booking, opening_hours, snacks_available) VALUES ${placeholders}`;
    
    await connection.query(sql, barValues.flat());
  }
};

/**
 * Helper to get complete F&B details including restaurants and bars
 */
const getCompleteFbDetails = async (connection, hotelId) => {
  // Get main F&B details
  const [fbDetails] = await connection.query('SELECT * FROM onboarding_food_beverage_details WHERE hotel_id = ?', [hotelId]);
  
  if (fbDetails.length === 0) {
    return null;
  }

  // Get restaurants
  const [restaurants] = await connection.query('SELECT * FROM onboarding_fb_restaurants WHERE hotel_id = ? ORDER BY id', [hotelId]);
  
  // Get bars
  const [bars] = await connection.query('SELECT * FROM onboarding_fb_bars WHERE hotel_id = ? ORDER BY id', [hotelId]);

  return {
    ...fbDetails[0],
    restaurants: restaurants || [],
    bars: bars || []
  };
};

/**
 * Upsert food & beverage details for a hotel (including restaurants and bars)
 * Route: POST /api/hotels/:hotelId/fb/details
 */
export const upsertFbDetails = async (req, res, next) => {
  const { hotelId } = req.params;
  if (isNaN(parseInt(hotelId))) {
    return res.status(400).json({ error: 'Invalid hotelId parameter.' });
  }

  const { restaurants, bars, ...otherData } = req.body;
  const detailsData = extractDetailsData(otherData);

  // Update total_restaurants count
  if (restaurants && Array.isArray(restaurants)) {
    detailsData.total_restaurants = restaurants.length;
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Ensure hotel exists (check both hotels and onboarding_hotels tables)
    const [onboardingHotels] = await connection.query('SELECT id FROM onboarding_hotels WHERE id = ?', [hotelId]);
    const [regularHotels] = await connection.query('SELECT id FROM hotels WHERE id = ?', [hotelId]);
    
    if (onboardingHotels.length === 0 && regularHotels.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: `Hotel with ID ${hotelId} not found.` });
    }

    // Upsert main F&B details if there's data
    if (detailsData && Object.keys(detailsData).length > 0) {
      const fields = Object.keys(detailsData);
      const placeholders = fields.map((f) => `${f} = VALUES(${f})`).join(', ');
      const values = fields.map((f) => detailsData[f]);

      const sql = `INSERT INTO onboarding_food_beverage_details (hotel_id, ${fields.join(', ')}) VALUES (?, ${fields
        .map(() => '?')
        .join(', ')}) ON DUPLICATE KEY UPDATE ${placeholders}, updated_at = NOW()`;

      await connection.query(sql, [hotelId, ...values]);
    } else {
      // Ensure record exists even if no main details provided
      await connection.query(
        'INSERT IGNORE INTO onboarding_food_beverage_details (hotel_id) VALUES (?)',
        [hotelId]
      );
    }

    // Manage restaurants
    if (restaurants !== undefined) {
      await manageRestaurants(connection, hotelId, restaurants);
    }

    // Manage bars
    if (bars !== undefined) {
      await manageBars(connection, hotelId, bars);
    }

    await connection.commit();

    // Return complete updated record
    const completeData = await getCompleteFbDetails(connection, hotelId);
    res.status(200).json({ success: true, data: completeData });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Error in upsertFbDetails:', error);
    next(error);
  } finally {
    if (connection) connection.release();
  }
};

/**
 * Get F&B details for a hotel (including restaurants and bars)
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
    
    const completeData = await getCompleteFbDetails(connection, hotelId);
    
    if (!completeData) {
      return res.status(404).json({ error: `F&B details not found for hotel ID ${hotelId}.` });
    }

    res.status(200).json({ success: true, data: completeData });
  } catch (error) {
    console.error('Error in getFbDetails:', error);
    next(error);
  } finally {
    if (connection) connection.release();
  }
};

/**
 * Delete F&B details for a hotel (including restaurants and bars)
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
    await connection.beginTransaction();

    // Delete restaurants (will cascade due to foreign key)
    await connection.query('DELETE FROM onboarding_fb_restaurants WHERE hotel_id = ?', [hotelId]);
    
    // Delete bars (will cascade due to foreign key)
    await connection.query('DELETE FROM onboarding_fb_bars WHERE hotel_id = ?', [hotelId]);
    
    // Delete main F&B details
    const [result] = await connection.query('DELETE FROM onboarding_food_beverage_details WHERE hotel_id = ?', [hotelId]);
    
    await connection.commit();

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: `F&B details not found for hotel ID ${hotelId}, nothing to delete.` });
    }

    res.status(200).json({ success: true, message: 'F&B details deleted completely.' });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Error in deleteFbDetails:', error);
    next(error);
  } finally {
    if (connection) connection.release();
  }
};

/**
 * Get restaurants for a hotel
 * Route: GET /api/hotels/:hotelId/fb/restaurants
 */
export const getRestaurants = async (req, res, next) => {
  const { hotelId } = req.params;
  if (isNaN(parseInt(hotelId))) {
    return res.status(400).json({ error: 'Invalid hotelId parameter.' });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    const [restaurants] = await connection.query('SELECT * FROM onboarding_fb_restaurants WHERE hotel_id = ? ORDER BY id', [hotelId]);
    res.status(200).json({ success: true, data: restaurants });
  } catch (error) {
    console.error('Error in getRestaurants:', error);
    next(error);
  } finally {
    if (connection) connection.release();
  }
};

/**
 * Get bars for a hotel
 * Route: GET /api/hotels/:hotelId/fb/bars
 */
export const getBars = async (req, res, next) => {
  const { hotelId } = req.params;
  if (isNaN(parseInt(hotelId))) {
    return res.status(400).json({ error: 'Invalid hotelId parameter.' });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    const [bars] = await connection.query('SELECT * FROM onboarding_fb_bars WHERE hotel_id = ? ORDER BY id', [hotelId]);
    res.status(200).json({ success: true, data: bars });
  } catch (error) {
    console.error('Error in getBars:', error);
    next(error);
  } finally {
    if (connection) connection.release();
  }
}; 