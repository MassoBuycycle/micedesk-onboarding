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
        files
      }
    });
  } catch (error) {
    console.error('Error in getFullHotelDetails:', error);
    next(error);
  } finally {
    if (connection) connection.release();
  }
}; 