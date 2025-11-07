import pool from '../db/config.js';

/**
 * Get all spaces for an event
 */
export const getEventSpaces = async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    if (!eventId) {
      return res.status(400).json({ error: 'Event ID required' });
    }
    
    // Check if event exists
    const [eventRows] = await pool.query('SELECT id FROM events WHERE id = ?', [eventId]);
    if (eventRows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Get spaces data
    const [spacesRows] = await pool.query(
      'SELECT * FROM event_spaces WHERE event_id = ?',
      [eventId]
    );
    
    res.status(200).json(spacesRows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch event spaces' });
  }
};

/**
 * Get a specific space by ID
 */
export const getEventSpaceById = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const spaceId = parseInt(req.params.spaceId);
    
    if (!spaceId) {
      return res.status(400).json({ error: 'Space ID required' });
    }
    
    // Get space data
    const [spaces] = await connection.query(
      'SELECT * FROM event_spaces WHERE id = ?',
      [spaceId]
    );
    
    if (spaces.length === 0) {
      return res.status(404).json({ error: 'Space not found' });
    }
    
    res.status(200).json(spaces[0]);
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Create or update event spaces (upsert functionality)
 */
export const createEventSpace = async (req, res, next) => {
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
    
    const payload = Array.isArray(req.body) ? req.body : [req.body];
    if(payload.length === 0){
      return res.status(400).json({error:'No space data provided'});
    }

    const createdSpaces = [];
    const updatedSpaces = [];

    for(const item of payload) {
      const spaceData = {};
      if(!item.name){
        return res.status(400).json({ error: 'Space name is required' });
      }
      
      // Check if a space with this name already exists for this event
      // First try to use ID if provided, then fall back to name-based matching
      let existingSpaces = [];
      if (item.id && typeof item.id === 'number') {
        // Check by ID first
        const [byIdRows] = await connection.query(
          'SELECT id FROM event_spaces WHERE id = ? AND event_id = ?',
          [item.id, eventId]
        );
        existingSpaces = byIdRows;
      }
      
      // If no match by ID, check by name
      if (!existingSpaces || existingSpaces.length === 0) {
        const [byNameRows] = await connection.query(
          'SELECT id FROM event_spaces WHERE event_id = ? AND name = ?',
          [eventId, item.name]
        );
        existingSpaces = byNameRows;
      }
      
      // Prepare space data
      spaceData.name = item.name;
      
      // Decimal fields
      if ('daily_rate' in item) {
        const dailyRate = parseFloat(item.daily_rate);
        spaceData.daily_rate = isNaN(dailyRate) ? 0 : dailyRate;
      }
      
      if ('half_day_rate' in item) {
        const halfDayRate = parseFloat(item.half_day_rate);
        spaceData.half_day_rate = isNaN(halfDayRate) ? 0 : halfDayRate;
      }
      
      if ('copy_fee' in item) {
        const copyFee = parseFloat(item.copy_fee);
        spaceData.copy_fee = isNaN(copyFee) ? 0 : copyFee;
      }
      
      // String fields
      if ('size' in item) spaceData.size = item.size || '';
      if ('dimensions' in item) spaceData.dimensions = item.dimensions || '';
      if ('wifi_speed' in item) spaceData.wifi_speed = item.wifi_speed || '';
      if ('presentation_software' in item) spaceData.presentation_software = item.presentation_software || '';
      if ('features' in item) spaceData.features = item.features || '';
      
      // Integer fields
      if ('cap_rounds' in item) {
        const capRounds = parseInt(item.cap_rounds);
        spaceData.cap_rounds = isNaN(capRounds) ? 0 : capRounds;
      }
      
      if ('cap_theatre' in item) {
        const capTheatre = parseInt(item.cap_theatre);
        spaceData.cap_theatre = isNaN(capTheatre) ? 0 : capTheatre;
      }
      
      if ('cap_classroom' in item) {
        const capClassroom = parseInt(item.cap_classroom);
        spaceData.cap_classroom = isNaN(capClassroom) ? 0 : capClassroom;
      }
      
      if ('cap_u_shape' in item) {
        const capUShape = parseInt(item.cap_u_shape);
        spaceData.cap_u_shape = isNaN(capUShape) ? 0 : capUShape;
      }
      
      if ('cap_boardroom' in item) {
        const capBoardroom = parseInt(item.cap_boardroom);
        spaceData.cap_boardroom = isNaN(capBoardroom) ? 0 : capBoardroom;
      }
      
      if ('cap_cabaret' in item) {
        const capCabaret = parseInt(item.cap_cabaret);
        spaceData.cap_cabaret = isNaN(capCabaret) ? 0 : capCabaret;
      }
      
      if ('cap_cocktail' in item) {
        const capCocktail = parseInt(item.cap_cocktail);
        spaceData.cap_cocktail = isNaN(capCocktail) ? 0 : capCocktail;
      }
      
      if ('beamer_lumens' in item) {
        const beamerLumens = parseInt(item.beamer_lumens);
        spaceData.beamer_lumens = isNaN(beamerLumens) ? 0 : beamerLumens;
      }
      
      // Boolean fields
      if ('is_soundproof' in item) 
        spaceData.is_soundproof = item.is_soundproof ? 1 : 0;
      
      if ('has_daylight' in item) 
        spaceData.has_daylight = item.has_daylight ? 1 : 0;
      
      if ('has_blackout' in item) 
        spaceData.has_blackout = item.has_blackout ? 1 : 0;
      
      if ('has_climate_control' in item) 
        spaceData.has_climate_control = item.has_climate_control ? 1 : 0;
      
      if ('supports_hybrid' in item) 
        spaceData.supports_hybrid = item.supports_hybrid ? 1 : 0;
      
      if ('has_tech_support' in item) 
        spaceData.has_tech_support = item.has_tech_support ? 1 : 0;
      
      if (existingSpaces && existingSpaces.length > 0) {
        // Update existing space
        const spaceId = existingSpaces[0].id;
        
        const setClause = Object.keys(spaceData)
          .map(field => `${field} = ?`)
          .join(', ');
        
        const updateValues = [...Object.values(spaceData), spaceId];
        
        await connection.query(
          `UPDATE event_spaces SET ${setClause} WHERE id = ?`,
          updateValues
        );
        
        // Get the updated space
        const [updatedSpace] = await connection.query(
          'SELECT * FROM event_spaces WHERE id = ?',
          [spaceId]
        );
        
        updatedSpaces.push(updatedSpace[0]);
      } else {
        // Create new space
        
        // Add the event ID
        spaceData.event_id = eventId;
        
        // Insert the new space
        const fields = Object.keys(spaceData).filter(f => f && f.trim().length > 0);
        const placeholders = Array(fields.length).fill('?').join(', ');
        const values = fields.map(f => spaceData[f]);
        
        const [insertResult] = await connection.query(
          `INSERT INTO event_spaces (${fields.join(', ')}) VALUES (${placeholders})`,
          values
        );
        
        // Get the inserted space
        const [spaces] = await connection.query(
          'SELECT * FROM event_spaces WHERE id = ?',
          [insertResult.insertId]
        );
        
        createdSpaces.push(spaces[0]);
      }
    }

    const totalSpaces = createdSpaces.length + updatedSpaces.length;
    res.status(200).json({
      success: true,
      message: `Processed ${totalSpaces} spaces (${createdSpaces.length} created, ${updatedSpaces.length} updated)`,
      createdSpaces,
      updatedSpaces,
      totalSpaces
    });
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Update an existing space
 */
export const updateEventSpace = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const spaceId = parseInt(req.params.spaceId);
    if (!spaceId) {
      return res.status(400).json({ error: 'Space ID required' });
    }
    
    
    // Check if space exists
    const [existingSpaces] = await connection.query(
      'SELECT id, event_id FROM event_spaces WHERE id = ?',
      [spaceId]
    );
    
    if (existingSpaces.length === 0) {
      return res.status(404).json({ error: 'Space not found' });
    }
    
    // Extract and process all fields from request body
    const spaceData = {};
    
    // Required field check - but only if it's provided in the update
    if ('name' in req.body) {
      if (!req.body.name) {
        return res.status(400).json({ error: 'Space name cannot be empty if provided' });
      }
      spaceData.name = req.body.name;
    }
    
    // Decimal fields
    if ('daily_rate' in req.body) {
      const dailyRate = parseFloat(req.body.daily_rate);
      spaceData.daily_rate = isNaN(dailyRate) ? 0 : dailyRate;
    }
    
    if ('half_day_rate' in req.body) {
      const halfDayRate = parseFloat(req.body.half_day_rate);
      spaceData.half_day_rate = isNaN(halfDayRate) ? 0 : halfDayRate;
    }
    
    if ('copy_fee' in req.body) {
      const copyFee = parseFloat(req.body.copy_fee);
      spaceData.copy_fee = isNaN(copyFee) ? 0 : copyFee;
    }
    
    // String fields
    if ('size' in req.body) spaceData.size = req.body.size || '';
    if ('dimensions' in req.body) spaceData.dimensions = req.body.dimensions || '';
    if ('wifi_speed' in req.body) spaceData.wifi_speed = req.body.wifi_speed || '';
    if ('presentation_software' in req.body) spaceData.presentation_software = req.body.presentation_software || '';
    if ('features' in req.body) spaceData.features = req.body.features || '';
    
    // Integer fields
    if ('cap_rounds' in req.body) {
      const capRounds = parseInt(req.body.cap_rounds);
      spaceData.cap_rounds = isNaN(capRounds) ? 0 : capRounds;
    }
    
    if ('cap_theatre' in req.body) {
      const capTheatre = parseInt(req.body.cap_theatre);
      spaceData.cap_theatre = isNaN(capTheatre) ? 0 : capTheatre;
    }
    
    if ('cap_classroom' in req.body) {
      const capClassroom = parseInt(req.body.cap_classroom);
      spaceData.cap_classroom = isNaN(capClassroom) ? 0 : capClassroom;
    }
    
    if ('cap_u_shape' in req.body) {
      const capUShape = parseInt(req.body.cap_u_shape);
      spaceData.cap_u_shape = isNaN(capUShape) ? 0 : capUShape;
    }
    
    if ('cap_boardroom' in req.body) {
      const capBoardroom = parseInt(req.body.cap_boardroom);
      spaceData.cap_boardroom = isNaN(capBoardroom) ? 0 : capBoardroom;
    }
    
    if ('cap_cabaret' in req.body) {
      const capCabaret = parseInt(req.body.cap_cabaret);
      spaceData.cap_cabaret = isNaN(capCabaret) ? 0 : capCabaret;
    }
    
    if ('cap_cocktail' in req.body) {
      const capCocktail = parseInt(req.body.cap_cocktail);
      spaceData.cap_cocktail = isNaN(capCocktail) ? 0 : capCocktail;
    }
    
    if ('beamer_lumens' in req.body) {
      const beamerLumens = parseInt(req.body.beamer_lumens);
      spaceData.beamer_lumens = isNaN(beamerLumens) ? 0 : beamerLumens;
    }
    
    // Boolean fields
    if ('is_soundproof' in req.body) 
      spaceData.is_soundproof = req.body.is_soundproof ? 1 : 0;
    
    if ('has_daylight' in req.body) 
      spaceData.has_daylight = req.body.has_daylight ? 1 : 0;
    
    if ('has_blackout' in req.body) 
      spaceData.has_blackout = req.body.has_blackout ? 1 : 0;
    
    if ('has_climate_control' in req.body) 
      spaceData.has_climate_control = req.body.has_climate_control ? 1 : 0;
    
    if ('supports_hybrid' in req.body) 
      spaceData.supports_hybrid = req.body.supports_hybrid ? 1 : 0;
    
    if ('has_tech_support' in req.body) 
      spaceData.has_tech_support = req.body.has_tech_support ? 1 : 0;
    
    
    // Update the space
    if (Object.keys(spaceData).length > 0) {
      const setClause = Object.keys(spaceData)
        .map(field => `${field} = ?`)
        .join(', ');
      
      const updateValues = [...Object.values(spaceData), spaceId];
      
      
      await connection.query(
        `UPDATE event_spaces SET ${setClause} WHERE id = ?`,
        updateValues
      );
    }
    
    // Get the updated space
    const [spaces] = await connection.query(
      'SELECT * FROM event_spaces WHERE id = ?',
      [spaceId]
    );
    
    res.status(200).json({
      success: true,
      space: spaces[0]
    });
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Delete a space
 */
export const deleteEventSpace = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const spaceId = parseInt(req.params.spaceId);
    if (!spaceId) {
      return res.status(400).json({ error: 'Space ID required' });
    }
    
    // Check if space exists
    const [existingSpaces] = await connection.query(
      'SELECT id FROM event_spaces WHERE id = ?',
      [spaceId]
    );
    
    if (existingSpaces.length === 0) {
      return res.status(404).json({ error: 'Space not found' });
    }
    
    // Delete the space
    await connection.query(
      'DELETE FROM event_spaces WHERE id = ?',
      [spaceId]
    );
    
    res.status(200).json({
      success: true,
      message: 'Space deleted successfully'
    });
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
}; 