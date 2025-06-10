import pool from '../db/config.js';

/**
 * Get room information
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const getRoomInfo = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const [hotelInfoRows] = await connection.query('SELECT * FROM hotel_info LIMIT 1');
    const hotelInfo = hotelInfoRows[0] || {};
    
    // Get payment methods
    const [paymentMethodsRows] = await connection.query('SELECT name FROM onboarding_payment_methods WHERE enabled = TRUE');
    const paymentMethods = paymentMethodsRows.map(method => method.name);
    
    // Get standard features
    const [standardFeaturesRows] = await connection.query('SELECT name FROM onboarding_standard_features');
    const standardFeatures = standardFeaturesRows.map(feature => feature.name);
    
    // Combine all data into a single response object
    const response = {
      ...hotelInfo,
      payment_methods: paymentMethods,
      standard_features: standardFeatures
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Update room information
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const updateRoomInfo = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const updatedInfo = req.body;
    
    await connection.beginTransaction();

    // Update standard_features if provided
    if (updatedInfo.standard_features) {
      await connection.query('DELETE FROM onboarding_standard_features');
      if (updatedInfo.standard_features.length > 0) {
        const insertValues = updatedInfo.standard_features.map(feature => [feature]);
        await connection.query('INSERT INTO onboarding_standard_features (name) VALUES ?', [insertValues]);
      }
    }
    
    // Update payment_methods if provided
    if (updatedInfo.payment_methods) {
      await connection.query('DELETE FROM onboarding_payment_methods');
      if (updatedInfo.payment_methods.length > 0) {
        const insertValues = updatedInfo.payment_methods.map(method => [method, true]);
        await connection.query('INSERT INTO onboarding_payment_methods (name, enabled) VALUES ?', [insertValues]);
      }
    }
    
    // Note: This controller doesn't update the `hotel_info` table itself,
    // only the global lookup tables. A more complete implementation might update hotel_info.
    
    await connection.commit();
    
    // After updating, return the new complete set of room info
    return getRoomInfo(req, res, next);
  } catch (error) {
    if (connection) await connection.rollback();
    next(error);
  } finally {
    if (connection) connection.release();
  }
};

/**
 * Get standard room features
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const getStandardRoomFeatures = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query('SELECT * FROM room_standard_features LIMIT 1');
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Standard room features not found' });
    }
    
    // Remove id, created_at, and updated_at fields
    const { id, created_at, updated_at, ...features } = rows[0];
    
    res.status(200).json(features);
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Update standard room features
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const updateStandardRoomFeatures = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const updatedFeatures = req.body;
    
    // Validate the request body
    if (typeof updatedFeatures !== 'object') {
      return res.status(400).json({ error: 'Invalid request body' });
    }
    
    // Get existing features
    const [rows] = await connection.query('SELECT * FROM room_standard_features LIMIT 1');
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Standard room features not found' });
    }
    
    const featureId = rows[0].id;
    
    // Build update query
    const updateFields = [];
    const updateParams = [];
    
    const validFeatures = [
      'shower_toilet', 'bathtub_toilet', 'open_bathroom', 'balcony', 'safe',
      'air_condition', 'heating', 'hair_dryer', 'ironing_board', 'tv',
      'telephone', 'wifi', 'desk', 'coffee_maker', 'kettle',
      'minibar', 'fridge', 'allergy_friendly_bedding'
    ];
    
    for (const key in updatedFeatures) {
      if (validFeatures.includes(key) && typeof updatedFeatures[key] === 'boolean') {
        updateFields.push(`${key} = ?`);
        updateParams.push(updatedFeatures[key] ? 1 : 0);
      }
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid features to update' });
    }
    
    // Add ID to params
    updateParams.push(featureId);
    
    // Execute update
    await connection.query(
      `UPDATE room_standard_features SET ${updateFields.join(', ')} WHERE id = ?`,
      updateParams
    );
    
    // Get updated features
    return getStandardRoomFeatures(req, res, next);
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Get room information by ID
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const getRoomInfoById = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const infoId = req.params.id;
    const [infoRows] = await connection.query('SELECT * FROM hotel_info WHERE id = ?', [infoId]);
    const [featuresRows] = await connection.query('SELECT * FROM onboarding_standard_features');
    const [paymentRows] = await connection.query('SELECT * FROM onboarding_payment_methods');
    
    if (infoRows.length === 0) {
      return res.status(404).json({ error: 'Room info not found' });
    }

    const info = infoRows[0];
    const features = featuresRows.map(row => row.name);
    const paymentMethods = paymentRows.map(row => row.name);

    const roomInfo = {
      ...info,
      standard_features: features,
      payment_methods: paymentMethods,
      total_rooms: info.total_rooms,
      conference_rooms: info.conference_rooms
    };

    res.status(200).json(roomInfo);
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
}; 