import pool from '../db/config.js';

export const getFullHotelDetails = async (req, res, next) => {
  const hotelId = parseInt(req.params.id);
  if (isNaN(hotelId)) {
    return res.status(400).json({ success: false, error: 'Invalid hotel ID' });
  }

  let connection;
  try {
    connection = await pool.getConnection();

    // Core hotel info
    const [[hotel]] = await connection.query('SELECT * FROM hotels WHERE id = ?', [hotelId]);
    if (!hotel) {
      return res.status(404).json({ success: false, error: 'Hotel not found' });
    }

    // Rooms (main config)
    const [rooms] = await connection.query('SELECT * FROM rooms WHERE hotel_id = ?', [hotelId]);

    // Enhance each room with its related one-to-one tables and features
    for (const room of rooms) {
      const rid = room.id;
      // Contacts
      const [[contactsRow]] = await connection.query('SELECT phone, email FROM room_contacts WHERE room_id = ?', [rid]);
      room.contacts = contactsRow || {};
      // Policies with JSON parse & bool conv
      const [[policyRow]] = await connection.query('SELECT * FROM room_policies WHERE room_id = ?', [rid]);
      if (policyRow) {
        if (policyRow.payment_methods && typeof policyRow.payment_methods === 'string') {
          try { policyRow.payment_methods = JSON.parse(policyRow.payment_methods); } catch(e){}
        }
        room.policies = policyRow;
      } else { room.policies = {}; }
      // Inventory
      const [[invRow]] = await connection.query('SELECT * FROM room_inventory WHERE room_id = ?', [rid]);
      room.inventory = invRow || {};
      // Pet policies
      const [[petRow]] = await connection.query('SELECT * FROM room_pet_policies WHERE room_id = ?', [rid]);
      if (petRow) {
        petRow.is_dogs_allowed = Boolean(petRow.is_dogs_allowed);
      }
      room.pet_policies = petRow || {};
      // Standard features – convert row to array of keys where value = 1
      const [[featRow]] = await connection.query('SELECT * FROM room_standard_features WHERE room_id = ?', [rid]);
      if (featRow) {
        const { id, room_id, created_at, updated_at, ...flags } = featRow;
        room.standard_features = Object.keys(flags).filter(k => flags[k] === 1);
      } else { room.standard_features = []; }
    }

    // For each room get categories
    const roomIds = rooms.map(r => r.id);
    let roomCategories = [];
    if (roomIds.length) {
      [roomCategories] = await connection.query('SELECT * FROM room_category_infos WHERE room_id IN (?)', [roomIds]);
    }

    // Events for this hotel (main info only)
    const [events] = await connection.query('SELECT * FROM events WHERE hotel_id = ?', [hotelId]);

    // Event spaces via events table
    const [eventSpaces] = await connection.query(
      `SELECT es.* FROM event_spaces es 
       JOIN events e ON es.event_id = e.id 
       WHERE e.hotel_id = ?`,
      [hotelId]
    );

    // Room operational handling (room_operational_handling)
    let roomOperational = [];
    if (roomIds.length) {
      [roomOperational] = await connection.query('SELECT * FROM room_operational_handling WHERE room_id IN (?)', [roomIds]);
    }

    // F&B details
    const [[fnb]] = await connection.query('SELECT * FROM food_beverage_details WHERE hotel_id = ?', [hotelId]);
    
    // Contract & Onboarding details
    const [[contractDetails]] = await connection.query('SELECT * FROM onboarding_contract_details WHERE hotel_id = ?', [hotelId]);
    if (contractDetails && contractDetails.access_other_systems) {
      try {
        contractDetails.access_other_systems = JSON.parse(contractDetails.access_other_systems);
      } catch (e) {
        contractDetails.access_other_systems = [];
      }
    }

    // Files (all)
    let [files] = await connection.query(
      `SELECT f.*, ft.code as file_type_code, ft.category as file_type_category, ft.name as file_type_name 
       FROM files f 
       LEFT JOIN file_types ft ON ft.id = f.file_type_id 
       WHERE f.entity_type = 'hotels' AND f.entity_id = ?`,
      [hotelId]
    );

    // Add signed URLs
    const { getSignedUrl } = await import('../services/s3Service.js');
    const publicBase = process.env.FILE_PUBLIC_BASE_URL || 'https://micedesk-hotel-cms.s3.eu-central-1.amazonaws.com/';
    files = await Promise.all(files.map(async file => {
      try {
        const url = await getSignedUrl(file.storage_path);
        return { ...file, url };
      } catch {
        return { ...file, url: `${publicBase}${file.storage_path}` };
      }
    }));

    // Build derived objects from merged columns
    const contacts = {
      phone: hotel.phone,
      email: hotel.email,
      website: hotel.website
    };

    const billing = {
      billing_address_name: hotel.billing_address_name,
      billing_address_street: hotel.billing_address_street,
      billing_address_zip: hotel.billing_address_zip,
      billing_address_city: hotel.billing_address_city,
      billing_address_vat: hotel.billing_address_vat
    };

    const parking = {
      no_of_parking_spaces: hotel.no_of_parking_spaces,
      no_of_parking_spaces_garage: hotel.no_of_parking_spaces_garage,
      no_of_parking_spaces_electric: hotel.no_of_parking_spaces_electric,
      no_of_parking_spaces_bus: hotel.no_of_parking_spaces_bus,
      no_of_parking_spaces_outside: hotel.no_of_parking_spaces_outside,
      no_of_parking_spaces_disabled: hotel.no_of_parking_spaces_disabled,
      parking_cost_per_hour: hotel.parking_cost_per_hour,
      parking_cost_per_day: hotel.parking_cost_per_day
    };

    const distances = {
      distance_to_airport_km: hotel.distance_to_airport_km,
      distance_to_highway_km: hotel.distance_to_highway_km,
      distance_to_fair_km: hotel.distance_to_fair_km,
      distance_to_train_station: hotel.distance_to_train_station,
      distance_to_public_transport: hotel.distance_to_public_transport
    };

    res.json({
      success: true,
      data: {
        hotel,
        rooms,
        roomCategories,
        roomOperational,
        events,
        eventSpaces,
        contacts,
        billing,
        parking,
        distances,
        fnb,
        contractDetails: contractDetails || {},
        files
      }
    });
  } catch (error) {
    next(error);
  } finally {
    if (connection) connection.release();
  }
}; 

/**
 * Lightweight overview for the "View Hotels" table.
 * Returns all hotels with their assigned users in a single payload
 * to avoid N+1 calls from the frontend.
 */
export const getHotelsOverview = async (req, res, next) => {
  let connection;
  try {
    connection = await pool.getConnection();

    // 1) Fetch basic hotel info (only columns needed by list view)
    const [hotels] = await connection.query(
      `SELECT id, name, city, postal_code, star_rating, category FROM hotels ORDER BY created_at DESC`
    );

    if (!hotels || hotels.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const hotelIds = hotels.map(h => h.id);

    // 2) Users specifically assigned to hotels
    const [specificAssignments] = await connection.query(
      `SELECT uha.hotel_id, u.id, u.first_name, u.last_name, u.email, u.created_at, u.updated_at,
              FALSE AS has_all_access
       FROM user_hotel_assignments uha
       JOIN users u ON u.id = uha.user_id
       WHERE uha.hotel_id IN (?)`,
      [hotelIds]
    );

    // 3) Users with access to ALL hotels (attach to each hotel when composing)
    const [allAccessUsers] = await connection.query(
      `SELECT u.id, u.first_name, u.last_name, u.email, u.created_at, u.updated_at, TRUE AS has_all_access
       FROM users u
       JOIN user_all_hotels_access uaa ON u.id = uaa.user_id`
    );

    // Build map hotelId -> assigned users
    const hotelIdToUsers = new Map();
    hotels.forEach(h => hotelIdToUsers.set(h.id, []));

    for (const row of specificAssignments) {
      const list = hotelIdToUsers.get(row.hotel_id) || [];
      list.push({
        id: row.id,
        first_name: row.first_name,
        last_name: row.last_name,
        email: row.email,
        created_at: row.created_at,
        updated_at: row.updated_at,
        has_all_access: !!row.has_all_access,
      });
      hotelIdToUsers.set(row.hotel_id, list);
    }

    // Append all-access users to every hotel
    for (const h of hotels) {
      const list = hotelIdToUsers.get(h.id) || [];
      const merged = list.concat(
        allAccessUsers.map(u => ({
          id: u.id,
          first_name: u.first_name,
          last_name: u.last_name,
          email: u.email,
          created_at: u.created_at,
          updated_at: u.updated_at,
          has_all_access: true,
        }))
      );
      hotelIdToUsers.set(h.id, merged);
    }

    // Compose final payload
    // 4) Main images for each hotel (if present)
    let mainImageMap = new Map();
    try {
      const [imageRows] = await connection.query(
        `SELECT f.entity_id AS hotel_id, f.storage_path
         FROM files f
         JOIN file_types ft ON ft.id = f.file_type_id
         WHERE f.entity_type = 'hotels' 
           AND ft.category = 'hotel' 
           AND ft.code = 'main_image'
           AND f.entity_id IN (?)
         ORDER BY f.created_at DESC`,
        [hotelIds]
      );

      // Keep latest per hotel
      for (const row of imageRows) {
        if (!mainImageMap.has(row.hotel_id)) {
          mainImageMap.set(row.hotel_id, row.storage_path);
        }
      }

      // Convert storage paths to signed URLs
      if (mainImageMap.size > 0) {
        const { getSignedUrl } = await import('../services/s3Service.js');
        const publicBase = process.env.FILE_PUBLIC_BASE_URL || 'https://micedesk-hotel-cms.s3.eu-central-1.amazonaws.com/';
        const entries = Array.from(mainImageMap.entries());
        const signed = await Promise.all(entries.map(async ([hid, key]) => {
          try {
            const url = await getSignedUrl(key);
            return [hid, url];
          } catch {
            return [hid, `${publicBase}${key}`];
          }
        }));
        mainImageMap = new Map(signed);
      }
    } catch (e) {
      // If images fail, continue without blocking overview
      mainImageMap = new Map();
    }

    const payload = hotels.map(h => ({
      ...h,
      assigned_users: hotelIdToUsers.get(h.id) || [],
      users_count: (hotelIdToUsers.get(h.id) || []).length,
      main_image_url: mainImageMap.get(h.id) || null,
    }));

    res.json({ success: true, data: payload });
  } catch (error) {
    next(error);
  } finally {
    if (connection) connection.release();
  }
};