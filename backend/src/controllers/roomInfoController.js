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
    // Get hotel info (now from hotels table)
    const [hotelInfoRows] = await connection.query('SELECT * FROM hotels LIMIT 1');
    
    if (hotelInfoRows.length === 0) {
      return res.status(404).json({ error: 'Hotel information not found' });
    }
    
    const hotelInfo = hotelInfoRows[0];
    
    // Get payment methods
    const [paymentMethodsRows] = await connection.query('SELECT name FROM payment_methods WHERE enabled = TRUE');
    const paymentMethods = paymentMethodsRows.map(method => method.name);
    
    // Get standard features
    const [standardFeaturesRows] = await connection.query('SELECT name FROM standard_features');
    const standardFeatures = standardFeaturesRows.map(feature => feature.name);
    
    // Format response to match previous structure
    const formattedInfo = {
      contact: {
        name: hotelInfo.contact_name,
        position: hotelInfo.contact_position,
        phone: hotelInfo.contact_phone,
        email: hotelInfo.contact_email
      },
      check_in_out: {
        check_in_time: hotelInfo.check_in_time,
        check_out_time: hotelInfo.check_out_time,
        early_check_in_time_frame: hotelInfo.early_check_in_time_frame,
        early_check_in_fee: hotelInfo.early_check_in_fee,
        late_check_out_time: hotelInfo.late_check_out_time,
        late_check_out_fee: hotelInfo.late_check_out_fee,
        reception_hours: hotelInfo.reception_hours
      },
      room_counts: {
        single: hotelInfo.single_rooms,
        double: hotelInfo.double_rooms,
        connecting: hotelInfo.connecting_rooms,
        accessible: hotelInfo.accessible_rooms
      },
      standard_features: standardFeatures,
      payment_methods: paymentMethods,
      pet_policy: {
        pets_allowed: Boolean(hotelInfo.pets_allowed),
        pet_fee: hotelInfo.pet_fee,
        pet_inclusions: hotelInfo.pet_inclusions
      },
      internetAvailable: standardFeatures.includes('WiFi') || standardFeatures.includes('Internet'),
      airConditioning: standardFeatures.includes('Air Conditioning') || standardFeatures.includes('AC')
    };
    
    res.status(200).json(formattedInfo);
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
    
    // Get existing hotel info (now from hotels table)
    const [hotelInfoRows] = await connection.query('SELECT * FROM hotels LIMIT 1');
    
    if (hotelInfoRows.length === 0) {
      return res.status(404).json({ error: 'Hotel information not found' });
    }
    
    const hotelInfo = hotelInfoRows[0];
    
    // Start a transaction
    await connection.beginTransaction();
    
    try {
      // Update hotels table
      const updateFields = [];
      const updateParams = [];
      
      if (updatedInfo.contact) {
        if (updatedInfo.contact.name !== undefined) {
          updateFields.push('contact_name = ?');
          updateParams.push(updatedInfo.contact.name);
        }
        if (updatedInfo.contact.position !== undefined) {
          updateFields.push('contact_position = ?');
          updateParams.push(updatedInfo.contact.position);
        }
        if (updatedInfo.contact.phone !== undefined) {
          updateFields.push('contact_phone = ?');
          updateParams.push(updatedInfo.contact.phone);
        }
        if (updatedInfo.contact.email !== undefined) {
          updateFields.push('contact_email = ?');
          updateParams.push(updatedInfo.contact.email);
        }
      }
      
      if (updatedInfo.check_in_out) {
        if (updatedInfo.check_in_out.check_in_time !== undefined) {
          updateFields.push('check_in_time = ?');
          updateParams.push(updatedInfo.check_in_out.check_in_time);
        }
        if (updatedInfo.check_in_out.check_out_time !== undefined) {
          updateFields.push('check_out_time = ?');
          updateParams.push(updatedInfo.check_in_out.check_out_time);
        }
        if (updatedInfo.check_in_out.early_check_in_time_frame !== undefined) {
          updateFields.push('early_check_in_time_frame = ?');
          updateParams.push(updatedInfo.check_in_out.early_check_in_time_frame);
        }
        if (updatedInfo.check_in_out.early_check_in_fee !== undefined) {
          updateFields.push('early_check_in_fee = ?');
          updateParams.push(updatedInfo.check_in_out.early_check_in_fee);
        }
        if (updatedInfo.check_in_out.late_check_out_time !== undefined) {
          updateFields.push('late_check_out_time = ?');
          updateParams.push(updatedInfo.check_in_out.late_check_out_time);
        }
        if (updatedInfo.check_in_out.late_check_out_fee !== undefined) {
          updateFields.push('late_check_out_fee = ?');
          updateParams.push(updatedInfo.check_in_out.late_check_out_fee);
        }
        if (updatedInfo.check_in_out.reception_hours !== undefined) {
          updateFields.push('reception_hours = ?');
          updateParams.push(updatedInfo.check_in_out.reception_hours);
        }
      }
      
      if (updatedInfo.room_counts) {
        if (updatedInfo.room_counts.single !== undefined) {
          updateFields.push('single_rooms = ?');
          updateParams.push(updatedInfo.room_counts.single);
        }
        if (updatedInfo.room_counts.double !== undefined) {
          updateFields.push('double_rooms = ?');
          updateParams.push(updatedInfo.room_counts.double);
        }
        if (updatedInfo.room_counts.connecting !== undefined) {
          updateFields.push('connecting_rooms = ?');
          updateParams.push(updatedInfo.room_counts.connecting);
        }
        if (updatedInfo.room_counts.accessible !== undefined) {
          updateFields.push('accessible_rooms = ?');
          updateParams.push(updatedInfo.room_counts.accessible);
        }
      }
      
      if (updatedInfo.pet_policy) {
        if (updatedInfo.pet_policy.pets_allowed !== undefined) {
          updateFields.push('pets_allowed = ?');
          updateParams.push(updatedInfo.pet_policy.pets_allowed ? 1 : 0);
        }
        if (updatedInfo.pet_policy.pet_fee !== undefined) {
          updateFields.push('pet_fee = ?');
          updateParams.push(updatedInfo.pet_policy.pet_fee);
        }
        if (updatedInfo.pet_policy.pet_inclusions !== undefined) {
          updateFields.push('pet_inclusions = ?');
          updateParams.push(updatedInfo.pet_policy.pet_inclusions);
        }
      }
      
      // Update hotels info if any fields were changed
      if (updateFields.length > 0) {
        updateParams.push(hotelInfo.id);
        await connection.query(
          `UPDATE hotels SET ${updateFields.join(', ')} WHERE id = ?`,
          updateParams
        );
      }
      
      // Update standard_features if provided
      if (updatedInfo.standard_features) {
        // Delete existing features
        await connection.query('DELETE FROM standard_features');
        
        // Insert new features
        if (updatedInfo.standard_features.length > 0) {
          const insertValues = updatedInfo.standard_features.map(feature => [feature]);
          await connection.query(
            'INSERT INTO standard_features (name) VALUES ?',
            [insertValues]
          );
        }
      }
      
      // Update payment_methods if provided
      if (updatedInfo.payment_methods) {
        // Delete existing methods
        await connection.query('DELETE FROM payment_methods');
        
        // Insert new methods
        if (updatedInfo.payment_methods.length > 0) {
          const insertValues = updatedInfo.payment_methods.map(method => [method, true]);
          await connection.query(
            'INSERT INTO payment_methods (name, enabled) VALUES ?',
            [insertValues]
          );
        }
      }
      
      await connection.commit();
      
      // Get updated info
      return getRoomInfo(req, res, next);
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  } catch (error) {
    next(error);
  } finally {
    connection.release();
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