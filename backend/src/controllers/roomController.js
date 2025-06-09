import pool from '../db/config.js';

// Field group constants based on the new schema
// These define which incoming data fields map to which table
const ROOMS_BASE_FIELDS = ['hotel_id', 'main_contact_name', 'reception_hours']; // REMOVED 'main_contact_position'
const ROOM_CONTACTS_FIELDS = ['phone', 'email'];
const ROOM_POLICIES_FIELDS = [
    'check_in', 'check_out', 'early_check_in_cost', 'late_check_out_cost',
    'early_check_in_time_frame', 'late_check_out_time',
    'payment_methods' // JSON in table
];
const ROOM_INVENTORY_FIELDS = [
    'amt_single_rooms', 'amt_double_rooms', 'amt_connecting_rooms', 'amt_handicapped_accessible_rooms'
];
const ROOM_PET_POLICIES_FIELDS = ['is_dogs_allowed', 'dog_fee', 'dog_fee_inclusions'];

// ROOM_CATEGORY_INFOS_FIELDS and ROOM_OPERATIONAL_HANDLING_FIELDS remain for other functions
const ROOM_CATEGORY_INFOS_FIELDS = [
    'category_name', 'pms_name', 'num_rooms', 'size', 'bed_type', 'surcharges_upsell',
    'room_features', 'second_person_surcharge', 'extra_bed_surcharge',
    'baby_bed_available', 'extra_bed_available'
];
const ROOM_OPERATIONAL_HANDLING_FIELDS = [ 
    'revenue_manager_name', 'revenue_contact_details', 'demand_calendar', 'demand_calendar_infos',
    'revenue_call', 'revenue_calls_infos', 'group_request_min_rooms', 'group_reservation_category',
    'group_rates_check', 'group_rates', 'breakfast_share', 'first_second_option', 'shared_options',
    'first_option_hold_duration', 'overbooking', 'overbooking_info', 'min_stay_weekends',
    'min_stay_weekends_infos', 'call_off_quota', 'call_off_method', 'call_off_deadlines',
    'commission_rules', 'free_spot_policy_leisure_groups', 'restricted_dates', 'handled_by_mice_desk',
    'requires_deposit', 'deposit_rules', 'payment_methods_room_handling', 'final_invoice_handling',
    'deposit_invoice_responsible', 'info_invoice_created'
];

// Helper to extract data for a specific set of fields
const extractDataForTable = (sourceData, fields) => {
    const extracted = {};
    let hasData = false;
    fields.forEach(field => {
        if (sourceData[field] !== undefined) {
            extracted[field] = sourceData[field];
            hasData = true;
        }
    });
    return hasData ? extracted : null;
};

// Helper function for upserting into related tables (1-to-1 with rooms table based on room_id)
const upsertRelatedData = async (connection, tableName, tableFields, allData, roomId) => {
    const dataForTable = extractDataForTable(allData, tableFields);
    if (dataForTable) {
        if (tableName === 'room_policies' && dataForTable.payment_methods && typeof dataForTable.payment_methods !== 'string') {
            dataForTable.payment_methods = JSON.stringify(dataForTable.payment_methods);
        }

        const fields = Object.keys(dataForTable);
        // fieldPlaceholders for SET part of UPDATE or column list for INSERT
        const values = fields.map(key => dataForTable[key]);

        const [existing] = await connection.query(`SELECT id FROM ${tableName} WHERE room_id = ?`, [roomId]);

        if (existing.length > 0) { // Update
            if (fields.length > 0) {
                const setClause = fields.map(key => `${key} = ?`).join(', ');
                await connection.query(`UPDATE ${tableName} SET ${setClause} WHERE room_id = ?`, [...values, roomId]);
            }
        } else { // Insert
            if (fields.length > 0) {
                const insertFields = ['room_id', ...fields];
                const insertPlaceholders = insertFields.map(() => '?').join(', ');
                await connection.query(`INSERT INTO ${tableName} (${insertFields.join(', ')}) VALUES (${insertPlaceholders})`, [roomId, ...values]);
            }
        }
        return dataForTable;
    }
    return null;
};

/**
 * Create or Update the main Room configuration for a Hotel and its related information.
 * This function assumes a single main "room configuration" entry per hotel.
 * Endpoint: POST /api/rooms (or could be PUT /api/rooms/:hotelId/config)
 */
export const createOrUpdateMainRoomConfig = async (req, res, next) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const allRoomData = req.body; 
        const hotelId = allRoomData.hotel_id; 

        if (!hotelId) {
            await connection.rollback();
            return res.status(400).json({ success: false, error: 'hotel_id is required.' });
        }

        let roomId;
        // baseRoomData will only contain fields defined in ROOMS_BASE_FIELDS (hotel_id, main_contact_name, reception_hours)
        const baseRoomDataForRoomsTable = extractDataForTable(allRoomData, ROOMS_BASE_FIELDS);
        
        // Data to be actually inserted/updated into the `rooms` table.
        // Exclude hotel_id for UPDATE SET clause, include for INSERT.
        const actualRoomsTableData = { ...baseRoomDataForRoomsTable }; 
        if (actualRoomsTableData) delete actualRoomsTableData.hotel_id;

        const [existingRooms] = await connection.query('SELECT id FROM rooms WHERE hotel_id = ? LIMIT 1', [hotelId]);

        if (existingRooms.length > 0) { 
            roomId = existingRooms[0].id;
            if (actualRoomsTableData && Object.keys(actualRoomsTableData).length > 0) {
                const fields = Object.keys(actualRoomsTableData);
                const fieldPlaceholders = fields.map(key => `${key} = ?`).join(', ');
                const values = fields.map(key => actualRoomsTableData[key]);
                await connection.query(`UPDATE rooms SET ${fieldPlaceholders} WHERE id = ?`, [...values, roomId]);
            }
        } else { 
            const dataToInsertForRooms = { ...actualRoomsTableData, hotel_id: hotelId }; 
            if (!dataToInsertForRooms.main_contact_name) dataToInsertForRooms.main_contact_name = 'Default Contact'; // Example default

            const fields = Object.keys(dataToInsertForRooms);
            if (fields.length === 0 || !dataToInsertForRooms.hotel_id) {
                 await connection.rollback();
                 return res.status(400).json({ success: false, error: 'Cannot create room: hotel_id and other core fields missing.' });
            }
            const fieldPlaceholders = fields.map(() => '?').join(', ');
            const values = fields.map(key => dataToInsertForRooms[key]);
            const [result] = await connection.query(`INSERT INTO rooms (${fields.join(', ')}) VALUES (${fieldPlaceholders})`, values);
            roomId = result.insertId;
        }

        const contactsData = await upsertRelatedData(connection, 'room_contacts', ROOM_CONTACTS_FIELDS, allRoomData, roomId);
        const policiesData = await upsertRelatedData(connection, 'room_policies', ROOM_POLICIES_FIELDS, allRoomData, roomId);
        const inventoryData = await upsertRelatedData(connection, 'room_inventory', ROOM_INVENTORY_FIELDS, allRoomData, roomId);
        const petPoliciesData = await upsertRelatedData(connection, 'room_pet_policies', ROOM_PET_POLICIES_FIELDS, allRoomData, roomId);

        await connection.commit();

        const responseData = {
            roomId: roomId,
            hotel_id: hotelId,
            ...(baseRoomDataForRoomsTable || {}), // Send back what was intended for rooms table, including hotel_id
            // Ensure these sub-objects are based on what was actually upserted.
            contacts: contactsData || {},
            policies: policiesData || {},
            inventory: inventoryData || {},
            pet_policies: petPoliciesData || {}
        };
        // Correctly include hotel_id in the base part of the response if it came from baseRoomDataForRoomsTable
        if(baseRoomDataForRoomsTable && baseRoomDataForRoomsTable.hotel_id) responseData.hotel_id = baseRoomDataForRoomsTable.hotel_id;
        else responseData.hotel_id = hotelId; // Fallback to ensure hotel_id is in response

        res.status(200).json({
            success: true,
            message: 'Main room configuration saved successfully.',
            data: responseData
        });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Error in createOrUpdateMainRoomConfig:', error);
        next(error);
    } finally {
        if (connection) connection.release();
    }
};

// Rename the old createRoom to avoid confusion, this is now createOrUpdateMainRoomConfig
export { createOrUpdateMainRoomConfig as createRoom };

/**
 * Get all room types with their categories (DEPRECATED - adjust if needed for a new GET /rooms endpoint)
 */
export const getAllRoomTypes = async (req, res, next) => { 
    // This would now fetch from `rooms` and join with `room_category_infos` etc.
    // Example: SELECT r.*, GROUP_CONCAT(rc.category_name) as categories from rooms r LEFT JOIN room_category_infos rc ON r.id = rc.room_id WHERE r.hotel_id = ? GROUP BY r.id
    return res.status(501).json({ message: 'Endpoint deprecated/needs rework, use GET /api/rooms or GET /api/hotels/:hotelId/rooms' });
};

/**
 * Get room type by ID with its categories
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const getRoomTypeById = async (req, res, next) => { 
    return res.status(501).json({ message: 'Endpoint deprecated, use GET /api/rooms/:roomId' });
};

/**
 * Update a room type
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const updateRoomType = async (req, res, next) => { 
    return res.status(501).json({ message: 'Endpoint deprecated, use PUT /api/rooms/:roomId' });
};

/**
 * Delete a room type
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const deleteRoomType = async (req, res, next) => { 
    return res.status(501).json({ message: 'Endpoint deprecated, use DELETE /api/rooms/:roomId' });
};

/**
 * Add multiple RoomCategoryInfo entries to an existing Room
 * Endpoint: POST /api/rooms/:roomId/categories
 */
export const addCategoryInfosToRoom = async (req, res, next) => {
    const connection = await pool.getConnection();
    const { roomId } = req.params;
    const categoryInfosArray = req.body; 
    if (!Array.isArray(categoryInfosArray) || categoryInfosArray.length === 0) {
        return res.status(400).json({ error: 'Request body must be a non-empty array of category information.' });
    }
    const parsedRoomId = parseInt(roomId);
    if (isNaN(parsedRoomId)) {
        return res.status(400).json({ error: 'Invalid roomId parameter.'});
    }
    try {
        await connection.beginTransaction();
        const [roomExists] = await connection.query('SELECT id FROM rooms WHERE id = ?', [parsedRoomId]);
        if (roomExists.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: `Room with ID ${parsedRoomId} not found.` });
        }
        const createdCategories = [];
        const insertPromises = [];
        for (const catInfo of categoryInfosArray) {
            const categoryData = extractDataForTable(catInfo, ROOM_CATEGORY_INFOS_FIELDS);
            if (!categoryData || !categoryData.category_name) {
                await connection.rollback();
                return res.status(400).json({ error: 'Each category info object must contain at least a category_name.', offendingItem: catInfo });
            }
            const fields = Object.keys(categoryData);
            const placeholders = fields.map(() => '?').join(', ');
            const values = fields.map(f => categoryData[f]);
            insertPromises.push(
                connection.query(
                    `INSERT INTO room_category_infos (room_id, ${fields.join(', ')}) VALUES (?, ${placeholders})`,
                    [parsedRoomId, ...values]
                ).then(([result]) => {
                    createdCategories.push({ id: result.insertId, room_id: parsedRoomId, ...categoryData });
                })
            );
        }
        await Promise.all(insertPromises);
        await connection.commit();
        res.status(201).json({
            success: true,
            roomId: parsedRoomId,
            message: `${createdCategories.length} category infos added to room ${parsedRoomId}.`,
            createdCategories: createdCategories
        });
    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Error in addCategoryInfosToRoom:', error);
        next(error);
    } finally {
        if (connection) connection.release();
    }
};

/**
 * Get operational handling information for a specific room
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const getOperationalHandlingByRoomId = async (req, res, next) => {
  const { roomId } = req.params;
  const connection = await pool.getConnection();
  
  try {
    const [results] = await connection.query(
      'SELECT * FROM room_operational_handling WHERE room_id = ?', 
      [roomId]
    );
    
    if (results.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'No operational handling information found for this room' 
      });
    }
    
    res.json({
      success: true,
      data: results[0]
    });
  } catch (error) {
    console.error('Error in getOperationalHandlingByRoomId:', error);
    next(error);
  } finally {
    if (connection) connection.release();
  }
};

/**
 * Create or update operational handling information for a room
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const createOrUpdateOperationalHandling = async (req, res, next) => {
  const { roomId } = req.params;
  const handlingData = req.body;
  const connection = await pool.getConnection();
  
  try {
    // Extract only the fields that belong to room_operational_handling table
    const operationalHandlingData = extractDataForTable(handlingData, ROOM_OPERATIONAL_HANDLING_FIELDS);
    
    if (!operationalHandlingData) {
      return res.status(400).json({
        success: false,
        message: 'No valid operational handling data provided'
      });
    }

    // Check if the room exists
    const [roomExists] = await connection.query('SELECT id FROM rooms WHERE id = ?', [roomId]);
    if (roomExists.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Room with ID ${roomId} not found`
      });
    }

    // Convert payment_methods_room_handling to JSON if needed
    if (operationalHandlingData.payment_methods_room_handling !== undefined) {
      // Always stringify the payment methods, handling empty arrays properly
      if (Array.isArray(operationalHandlingData.payment_methods_room_handling)) {
        operationalHandlingData.payment_methods_room_handling = JSON.stringify(operationalHandlingData.payment_methods_room_handling);
      } else if (typeof operationalHandlingData.payment_methods_room_handling !== 'string') {
        operationalHandlingData.payment_methods_room_handling = JSON.stringify(operationalHandlingData.payment_methods_room_handling);
      } else if (!operationalHandlingData.payment_methods_room_handling.startsWith('[') && 
                !operationalHandlingData.payment_methods_room_handling.startsWith('{')) {
        // If it's a string but not already in JSON format, convert it to JSON array with single item
        operationalHandlingData.payment_methods_room_handling = JSON.stringify([operationalHandlingData.payment_methods_room_handling]);
      }
    } else {
      // If undefined, set to empty array JSON
      operationalHandlingData.payment_methods_room_handling = JSON.stringify([]);
    }

    await connection.beginTransaction();
    
    // Check if an entry already exists for this room
    const [existing] = await connection.query(
      'SELECT id FROM room_operational_handling WHERE room_id = ?',
      [roomId]
    );
    
    let result;
    if (existing.length > 0) {
      // Update existing record
      const fields = Object.keys(operationalHandlingData);
      if (fields.length > 0) {
        const setClause = fields.map(field => `${field} = ?`).join(', ');
        const values = fields.map(field => operationalHandlingData[field]);
        
        [result] = await connection.query(
          `UPDATE room_operational_handling SET ${setClause} WHERE room_id = ?`,
          [...values, roomId]
        );
      }
    } else {
      // Insert new record
      // Filter out any undefined or null values to prevent SQL syntax errors
      const cleanedData = {};
      for (const key in operationalHandlingData) {
        if (operationalHandlingData[key] !== undefined && operationalHandlingData[key] !== null) {
          cleanedData[key] = operationalHandlingData[key];
        }
      }
      
      const fields = Object.keys(cleanedData);
      const placeholders = Array(fields.length + 1).fill('?').join(', '); // +1 for room_id
      const values = [roomId, ...fields.map(field => cleanedData[field])];
      
      [result] = await connection.query(
        `INSERT INTO room_operational_handling (room_id, ${fields.join(', ')}) VALUES (${placeholders})`,
        values
      );
    }
    
    await connection.commit();
    
    res.status(200).json({
      success: true,
      message: 'Room operational handling information saved successfully',
      data: {
        room_id: parseInt(roomId),
        ...operationalHandlingData
      }
    });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Error in createOrUpdateOperationalHandling:', error);
    next(error);
  } finally {
    if (connection) connection.release();
  }
}; 