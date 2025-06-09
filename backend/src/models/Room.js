/**
 * Room Type Model
 * @typedef {Object} RoomType
 * @property {number} id - Unique identifier for the room type
 * @property {string} name - Room type name (e.g., Deluxe Double, Executive Suite)
 * @property {number} max_occupancy - Maximum number of guests allowed
 * @property {number} base_price - Base price per night
 * @property {string} description - Detailed description of the room
 * @property {RoomCategory[]} categories - Room categories associated with this room type
 * @property {Date} [created_at] - Date when the room type was created
 * @property {Date} [updated_at] - Date when the room type was last updated
 */

/**
 * Room Category Model
 * @typedef {Object} RoomCategory
 * @property {number} id - Unique identifier for the room category
 * @property {number} room_id - Reference to the parent room type
 * @property {string} category_name - Name of the room category
 * @property {string} pms_name - Property Management System name for this category
 * @property {number} num_rooms - Number of rooms in this category
 * @property {number} size - Size of the rooms in this category
 * @property {string} bed_type - Type of beds in the room
 * @property {string} surcharges_upsell - Surcharges for upselling
 * @property {string} room_features - Features of rooms in this category
 * @property {number} second_person_surcharge - Surcharge for a second person
 * @property {number} extra_bed_surcharge - Surcharge for an extra bed
 * @property {boolean} baby_bed_available - Whether a baby bed is available
 * @property {boolean} extra_bed_available - Whether an extra bed is available
 * @property {Date} [created_at] - Date when the category was created
 * @property {Date} [updated_at] - Date when the category was last updated
 */

/**
 * Room Information Model
 * @typedef {Object} RoomInfo
 * @property {Object} contact - Contact information
 * @property {string} contact.name - Contact person name
 * @property {string} contact.position - Contact person position
 * @property {string} contact.phone - Contact phone number
 * @property {string} contact.email - Contact email
 * @property {Object} check_in_out - Check-in and check-out information
 * @property {string} check_in_out.check_in_time - Standard check-in time
 * @property {string} check_in_out.check_out_time - Standard check-out time
 * @property {string} check_in_out.early_check_in_time_frame - Time window for early check-in
 * @property {number} check_in_out.early_check_in_fee - Fee for early check-in
 * @property {string} check_in_out.late_check_out_time - Late check-out time
 * @property {number} check_in_out.late_check_out_fee - Fee for late check-out
 * @property {string} check_in_out.reception_hours - Reception working hours
 * @property {Object} room_counts - Room count information
 * @property {number} room_counts.single - Number of single rooms
 * @property {number} room_counts.double - Number of double rooms
 * @property {number} room_counts.connecting - Number of connecting rooms
 * @property {number} room_counts.accessible - Number of accessible rooms
 * @property {string[]} standard_features - List of standard features available in rooms
 * @property {string[]} payment_methods - List of accepted payment methods
 * @property {Object} pet_policy - Pet policy information
 * @property {boolean} pet_policy.pets_allowed - Whether pets are allowed
 * @property {number} pet_policy.pet_fee - Fee for pets per night
 * @property {string} pet_policy.pet_inclusions - What's included in the pet fee
 */

/**
 * Standard Room Features
 * @typedef {Object} StandardRoomFeatures
 * @property {boolean} shower_toilet - Shower and toilet
 * @property {boolean} bathtub_toilet - Bathtub and toilet
 * @property {boolean} open_bathroom - Open bathroom
 * @property {boolean} balcony - Has balcony
 * @property {boolean} safe - Has safe
 * @property {boolean} air_condition - Has air conditioning
 * @property {boolean} heating - Has heating system
 * @property {boolean} hair_dryer - Has hair dryer
 * @property {boolean} ironing_board - Has ironing board
 * @property {boolean} tv - Has TV
 * @property {boolean} telephone - Has telephone
 * @property {boolean} wifi - Has WiFi
 * @property {boolean} desk - Has desk
 * @property {boolean} coffee_maker - Has coffee maker
 * @property {boolean} kettle - Has kettle
 * @property {boolean} minibar - Has minibar
 * @property {boolean} fridge - Has fridge
 * @property {boolean} allergy_friendly_bedding - Has allergy-friendly bedding
 */

/**
 * Room Amenities
 * @typedef {Object} RoomAmenities
 * @property {boolean} air_conditioning - Has air conditioning
 * @property {boolean} bathtub - Has bathtub
 * @property {boolean} minibar - Has minibar
 * @property {boolean} wifi - Has WiFi
 * @property {boolean} tv - Has TV
 * @property {boolean} safe - Has safe
 * @property {boolean} coffee_machine - Has coffee machine
 * @property {boolean} work_desk - Has work desk
 * @property {boolean} balcony - Has balcony
 * @property {boolean} iron_board - Has iron/ironing board
 * @property {boolean} hairdryer - Has hairdryer
 * @property {boolean} refrigerator - Has refrigerator
 */

/**
 * Payment Methods
 * @typedef {Object} PaymentMethods
 * @property {boolean} cash - Accepts cash payment
 * @property {boolean} credit_card - Accepts credit card payment
 * @property {boolean} debit_card - Accepts debit card payment
 * @property {boolean} bank_transfer - Accepts bank transfer
 * @property {boolean} paypal - Accepts PayPal
 * @property {boolean} apple_pay - Accepts Apple Pay
 * @property {boolean} google_pay - Accepts Google Pay
 */

export default { 
  RoomType: 'RoomType',
  RoomCategory: 'RoomCategory', 
  RoomInfo: 'RoomInfo',
  StandardRoomFeatures: 'StandardRoomFeatures',
  RoomAmenities: 'RoomAmenities',
  PaymentMethods: 'PaymentMethods'
}; 