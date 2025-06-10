import pool from '../db/config.js';

// Define fields allowed in the 'hotels' table based on the new schema
const HOTEL_TABLE_FIELDS = [
  'name', 'street', 'postal_code', 'city', 'country', 'phone',
  'star_rating', 'category', 'opening_date', 'latest_renovation_date',
  'pms_system', 'planned_changes', 'attraction_in_the_area'
];

// Define fields for each table based on the new schema
const HOTEL_FIELDS = [
  'system_hotel_id',
  'name', 'street', 'postal_code', 'city', 'country', 'description',
  'star_rating', 'category', 'opening_year', 'latest_renovation_year',
  'total_rooms', 'conference_rooms', 'pms_system',
  'opening_time_pool', 'opening_time_fitness_center', 'equipment_fitness_center',
  'opening_time_spa_area', 'equipment_spa_area',
  'planned_changes', 'attraction_in_the_area',
  // Billing
  'billing_address_name', 'billing_address_street', 'billing_address_zip',
  'billing_address_city', 'billing_address_vat',
  // Contacts
  'phone', 'email', 'website',
  // Distances
  'distance_to_airport_km', 'distance_to_highway_km', 'distance_to_fair_km',
  'distance_to_train_station', 'distance_to_public_transport',
  // Parking
  'no_of_parking_spaces', 'no_of_parking_spaces_garage', 'no_of_parking_spaces_electric',
  'no_of_parking_spaces_bus', 'no_of_parking_spaces_outside', 'no_of_parking_spaces_disabled',
  'parking_cost_per_hour', 'parking_cost_per_day',
  // Hotel Info (previously hotel_info)
  'contact_name', 'contact_position', 'contact_phone', 'contact_email',
  'check_in_time', 'check_out_time', 'early_check_in_time_frame', 'early_check_in_fee',
  'late_check_out_time', 'late_check_out_fee', 'reception_hours',
  'single_rooms', 'double_rooms', 'connecting_rooms', 'accessible_rooms',
  'pets_allowed', 'pet_fee', 'pet_inclusions'
];

const HOTEL_CONTACTS_FIELDS = ['phone', 'email', 'website'];
const HOTEL_BILLING_FIELDS = ['billing_address_name', 'billing_address_street', 'billing_address_zip', 'billing_address_city', 'billing_address_vat'];
const HOTEL_PARKING_FIELDS = [
  'no_of_parking_spaces', 'no_of_parking_spaces_garage', 'no_of_parking_spaces_electric',
  'no_of_parking_spaces_bus', 'no_of_parking_spaces_outside', 'no_of_parking_spaces_disabled',
  'parking_cost_per_hour', 'parking_cost_per_day'
];
const HOTEL_DISTANCES_FIELDS = [
  'distance_to_airport_km', 'distance_to_highway_km', 'distance_to_fair_km',
  'distance_to_train_station', 'distance_to_public_transport'
];

/**
 * Get all hotels
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const getAllHotels = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const [hotels] = await connection.query('SELECT * FROM hotels');
    res.status(200).json(hotels);
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Get hotel by ID
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const getHotelById = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const hotelId = parseInt(req.params.id);
    const [hotels] = await connection.query(
      'SELECT * FROM hotels WHERE id = ?',
      [hotelId]
    );
    
    if (hotels.length === 0) {
      return res.status(404).json({ error: 'Hotel not found' });
    }
    
    res.status(200).json(hotels[0]);
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Create a new hotel and its related information
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const createHotel = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const data = req.body;

    // Basic validation
    if (!data.name) {
      await connection.rollback();
      return res.status(400).json({ success: false, error: 'Hotel name is required' });
    }

    // Prepare insert payload based on allowed fields
    const insertObj = {};
    HOTEL_FIELDS.forEach(field => {
      if (data[field] !== undefined) {
        if ((field === 'opening_year' || field === 'latest_renovation_year') && typeof data[field] === 'string') {
          insertObj[field] = parseInt(data[field]) || null;
        } else {
          insertObj[field] = data[field];
        }
      }
    });

    const fields = Object.keys(insertObj);
    if (!fields.includes('name')) {
      await connection.rollback();
      return res.status(400).json({ success: false, error: 'Hotel name is required' });
    }

    const placeholders = fields.map(() => '?').join(', ');
    const values = fields.map(f => insertObj[f]);

    const [result] = await connection.query(`INSERT INTO hotels (${fields.join(', ')}) VALUES (${placeholders})`, values);
    const hotelId = result.insertId;

    /*
     * Optional: persist common lookup tables if the client passed them in the payload.
     * These tables are global (no hotel_id reference) in the current schema, so we simply
     * replace their contents with the provided arrays.
     */

    // 1) Standard room features
    if (Array.isArray(data.standard_features)) {
      // Refresh the table so that it reflects exactly what the client sent
      await connection.query('DELETE FROM onboarding_standard_features');
      if (data.standard_features.length > 0) {
        const insertValues = data.standard_features.map(f => [f]);
        await connection.query('INSERT INTO onboarding_standard_features (name) VALUES ?', [insertValues]);
      }
    }

    // 2) Payment methods
    if (Array.isArray(data.payment_methods)) {
      await connection.query('DELETE FROM onboarding_payment_methods');
      if (data.payment_methods.length > 0) {
        const insertValues = data.payment_methods.map(method => [method, true]);
        await connection.query('INSERT INTO onboarding_payment_methods (name, enabled) VALUES ?', [insertValues]);
      }
    }

    await connection.commit();

    const [[createdHotel]] = await connection.query('SELECT * FROM hotels WHERE id = ?', [hotelId]);

    res.status(201).json({
      success: true,
      data: {
        hotelId,
        name: createdHotel.name
      },
      message: 'Hotel created successfully.'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error in createHotel:', error);
    next(error);
  } finally {
    if (connection) connection.release();
  }
};

// Helper to filter object keys
const filterObjectByKeys = (obj, allowedKeys) => {
  return Object.keys(obj)
    .filter(key => allowedKeys.includes(key) && obj[key] !== undefined)
    .reduce((acc, key) => {
      acc[key] = obj[key];
      return acc;
    }, {});
};

/**
 * Update an existing hotel and its related information
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const updateHotel = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const hotelId = parseInt(req.params.id);
    if (isNaN(hotelId)) {
      return res.status(400).json({ success: false, error: 'Invalid hotel ID' });
    }

    const [existing] = await connection.query('SELECT id FROM hotels WHERE id = ?', [hotelId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, error: 'Hotel not found' });
    }

    const data = req.body;
    const updateObj = {};
    HOTEL_FIELDS.forEach(field => {
      if (data[field] !== undefined) {
        if ((field === 'opening_year' || field === 'latest_renovation_year') && typeof data[field] === 'string') {
          updateObj[field] = parseInt(data[field]) || null;
        } else {
          updateObj[field] = data[field];
        }
      }
    });

    const entries = Object.entries(updateObj);
    if (entries.length === 0) {
      return res.status(400).json({ success: false, error: 'No valid fields provided for update' });
    }

    const setClause = entries.map(([key]) => `${key} = ?`).join(', ');
    const values = entries.map(([, value]) => value);

    await connection.query(`UPDATE hotels SET ${setClause} WHERE id = ?`, [...values, hotelId]);

    const [[hotel]] = await connection.query('SELECT * FROM hotels WHERE id = ?', [hotelId]);
    res.status(200).json({ success: true, hotelId, hotel, message: 'Hotel updated successfully.' });
  } catch (error) {
    console.error('Error in updateHotel:', error);
    next(error);
  } finally {
    if (connection) connection.release();
  }
};

/**
 * Delete a hotel
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const deleteHotel = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const hotelId = parseInt(req.params.id);
    
    const [existingHotels] = await connection.query(
      'SELECT id FROM hotels WHERE id = ?',
      [hotelId]
    );
    
    if (existingHotels.length === 0) {
      return res.status(404).json({ success: false, error: 'Hotel not found' });
    }
    
    // ON DELETE CASCADE should handle related tables
    await connection.query(
      'DELETE FROM hotels WHERE id = ?',
      [hotelId]
    );
    
    res.status(200).json({ success: true, message: 'Hotel deleted successfully' });
  } catch (error) {
    console.error("Error in deleteHotel:", error);
    next(error);
  } finally {
    if (connection) connection.release();
  }
}; 