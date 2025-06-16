USE hotel_cms;

-- Drop tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS hotel_amenities;
DROP TABLE IF EXISTS amenity_types;
DROP TABLE IF EXISTS hotel_parking;
DROP TABLE IF EXISTS hotel_distances;
DROP TABLE IF EXISTS hotel_billing;
DROP TABLE IF EXISTS hotel_contacts;
DROP TABLE IF EXISTS room_standard_features;
DROP TABLE IF EXISTS room_category_infos;
DROP TABLE IF EXISTS room_operational_handling;
DROP TABLE IF EXISTS food_beverage;
DROP TABLE IF EXISTS event_technical;
DROP TABLE IF EXISTS event_spaces;
DROP TABLE IF EXISTS event_handling;
DROP TABLE IF EXISTS event_contracting;
DROP TABLE IF EXISTS event_av_equipment;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS rooms;
DROP TABLE IF EXISTS hotels;

-- Create main hotels table
CREATE TABLE hotels (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    street VARCHAR(255),
    postal_code VARCHAR(8),
    city VARCHAR(100),
    country VARCHAR(50),
    star_rating INT,
    category ENUM ('Kongresshotel', 'Wellnesshotel', 'Luxushotel', 'Budget-Hotel', 'Boutique-Hotel', 'Resort', 'Umweltfreundliches Hotel', 'Business-Hotel', 'Flughafenhotel', 'Bed and Breakfast', 'Hostel', 'Apartment-Hotel', 'Spa-Hotel', 'Casino-Hotel', 'Familienhotel', 'Abenteuerhotel', 'Strandhotel', 'Historisches Hotel', 'Ski-Hotel', 'Haustierfreundliches Hotel', 'Romantisches Hotel'),
    director_name VARCHAR(100),
    opening_date DATE,
    latest_renovation_date DATE,
    total_rooms INT,
    conference_rooms INT,
    pms_system VARCHAR(100),
    check_in_from TIME,
    check_out_until TIME,
    pets_allowed BOOLEAN DEFAULT FALSE,
    hotel_chain VARCHAR(100),
    hotel_brand VARCHAR(100),
    planned_changes TEXT,
    attraction_in_the_area TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create hotel contact information table
CREATE TABLE hotel_contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hotel_id INT NOT NULL,
    phone VARCHAR(20),
    fax VARCHAR(20),
    email VARCHAR(100),
    website VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
);

-- Create hotel billing information table
CREATE TABLE hotel_billing (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hotel_id INT NOT NULL,
    billing_address_name VARCHAR(100),
    billing_address_street VARCHAR(255),
    billing_address_zip VARCHAR(8),
    billing_address_city VARCHAR(50),
    billing_address_vat VARCHAR(30) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
);

-- Create hotel info table (contains contact, check-in/out, room counts, pet policy)
CREATE TABLE hotel_info (
  id INT AUTO_INCREMENT PRIMARY KEY,
  contact_name VARCHAR(255),
  contact_position VARCHAR(255),
  contact_phone VARCHAR(50),
  contact_email VARCHAR(255),
  check_in_time TIME,
  check_out_time TIME,
  early_check_in_time_frame VARCHAR(50),
  early_check_in_fee DECIMAL(10, 2),
  late_check_out_time TIME,
  late_check_out_fee DECIMAL(10, 2),
  reception_hours VARCHAR(50),
  single_rooms INT,
  double_rooms INT,
  connecting_rooms INT,
  accessible_rooms INT,
  pets_allowed BOOLEAN,
  pet_fee DECIMAL(10, 2),
  pet_inclusions TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  -- NOTE: No direct foreign key to hotels needed if this is treated as a singleton config table.
  -- If it should be hotel-specific, add: FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
);

-- Create hotel distances table
CREATE TABLE hotel_distances (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hotel_id INT NOT NULL,
    distance_to_airport_km INT,
    distance_to_highway_km INT,
    distance_to_fair_km INT,
    distance_to_train_station INT,
    distance_to_public_transport INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
);

-- Create hotel parking information table
CREATE TABLE hotel_parking (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hotel_id INT NOT NULL,
    no_of_parking_spaces INT,
    no_of_parking_spaces_garage INT,
    no_of_parking_spaces_electric INT,
    no_of_parking_spaces_bus INT,
    no_of_parking_spaces_outside INT,
    no_of_parking_spaces_disabled INT,
    parking_cost_per_hour DECIMAL(10,2),
    parking_cost_per_day DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
);

-- Create amenity types lookup table
CREATE TABLE amenity_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

-- Insert common amenity types
INSERT INTO amenity_types (name) VALUES 
('spa'), ('pool'), ('kids_club'), ('kids_pool'), ('gym'), ('beach_nearby'),
('fitness_center'), ('restaurant'), ('bar'), ('conference_room');

-- Create hotel amenities junction table
CREATE TABLE hotel_amenities (
    hotel_id INT NOT NULL,
    amenity_id INT NOT NULL,
    details VARCHAR(255),
    opening_hours VARCHAR(50),
    PRIMARY KEY (hotel_id, amenity_id),
    FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
    FOREIGN KEY (amenity_id) REFERENCES amenity_types(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Main rooms table - core information
CREATE TABLE rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  hotel_id INT NOT NULL,
  main_contact_name VARCHAR(255),
  main_contact_position VARCHAR(255),
  reception_hours VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
);

-- Room contacts information
CREATE TABLE room_contacts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_id INT NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

-- Room check-in/check-out policies
CREATE TABLE room_policies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_id INT NOT NULL,
  check_in TIME,
  check_out TIME,
  early_check_in_cost DECIMAL(10,2),
  late_check_out_cost DECIMAL(10,2),
  early_check_in_time_frame VARCHAR(20),
  late_check_out_time VARCHAR(20),
  payment_methods JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

-- Room inventory information
CREATE TABLE room_inventory (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_id INT NOT NULL,
  amt_single_rooms INT,
  amt_double_rooms INT,
  amt_connecting_rooms INT,
  amt_handicapped_accessible_rooms INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

-- Room pet policies
CREATE TABLE room_pet_policies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_id INT NOT NULL,
  is_dogs_allowed BOOLEAN DEFAULT FALSE,
  dog_fee DECIMAL(10,2),
  dog_fee_inclusions TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

-- Create room standard features table
CREATE TABLE room_standard_features (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_id INT NOT NULL,
    shower_toilet BOOLEAN DEFAULT FALSE,
    bathtub_toilet BOOLEAN DEFAULT FALSE,
    open_bathroom BOOLEAN DEFAULT FALSE,
    balcony BOOLEAN DEFAULT FALSE,
    safe BOOLEAN DEFAULT FALSE,
    air_condition BOOLEAN DEFAULT FALSE,
    heating BOOLEAN DEFAULT FALSE,
    hair_dryer BOOLEAN DEFAULT FALSE,
    ironing_board BOOLEAN DEFAULT FALSE,
    tv BOOLEAN DEFAULT FALSE,
    telephone BOOLEAN DEFAULT FALSE,
    wifi BOOLEAN DEFAULT FALSE,
    desk BOOLEAN DEFAULT FALSE,
    coffee_maker BOOLEAN DEFAULT FALSE,
    kettle BOOLEAN DEFAULT FALSE,
    minibar BOOLEAN DEFAULT FALSE,
    fridge BOOLEAN DEFAULT FALSE,
    allergy_friendly_bedding BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

-- Create room category info table
CREATE TABLE room_category_infos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_id INT NOT NULL,
    category_name VARCHAR(100),
    pms_name VARCHAR(255),
    num_rooms INT,
    size INT,
    bed_type VARCHAR(255),
    surcharges_upsell TEXT,
    room_features TEXT,
    second_person_surcharge DECIMAL(10,2),
    extra_bed_surcharge DECIMAL(10,2),
    baby_bed_available BOOLEAN DEFAULT FALSE,
    extra_bed_available BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

-- Create room operational handling table
CREATE TABLE room_operational_handling (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_id INT NOT NULL,
    revenue_manager_name VARCHAR(255),
    revenue_contact_details VARCHAR(255),
    demand_calendar BOOLEAN DEFAULT FALSE,
    demand_calendar_infos VARCHAR(255),
    revenue_call BOOLEAN DEFAULT FALSE,
    revenue_calls_infos TEXT,
    group_request_min_rooms INT,
    group_reservation_category VARCHAR(255),
    group_rates_check BOOLEAN DEFAULT FALSE,
    group_rates TEXT,
    breakfast_share BOOLEAN DEFAULT FALSE,
    first_second_option BOOLEAN DEFAULT FALSE,
    shared_options BOOLEAN DEFAULT FALSE,
    first_option_hold_duration VARCHAR(255),
    overbooking BOOLEAN DEFAULT FALSE,
    overbooking_info TEXT,
    min_stay_weekends BOOLEAN DEFAULT FALSE,
    min_stay_weekends_infos TEXT,
    call_off_quota BOOLEAN DEFAULT FALSE,
    call_off_method VARCHAR(255),
    call_off_deadlines TEXT,
    commission_rules TEXT,
    free_spot_policy_leisure_groups TEXT,
    restricted_dates TEXT,
    handled_by_mice_desk BOOLEAN DEFAULT FALSE,
    requires_deposit BOOLEAN DEFAULT FALSE,
    deposit_rules TEXT,
    payment_methods_room_handling JSON,
    final_invoice_handling TEXT,
    deposit_invoice_responsible VARCHAR(255),
    info_invoice_created BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

-- Create food and beverage details table
CREATE TABLE food_beverage (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hotel_id INT NOT NULL,
    contact_name VARCHAR(255),
    contact_position VARCHAR(255),
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    restaurant_name VARCHAR(255),
    cuisine VARCHAR(255),
    seats INT,
    opening_hours VARCHAR(255),
    is_exclusive BOOLEAN DEFAULT FALSE,
    price_min DECIMAL(10,2),
    bar_name VARCHAR(255),
    bar_seats INT,
    bar_is_exclusive BOOLEAN DEFAULT FALSE,
    bar_has_snacks BOOLEAN DEFAULT FALSE,
    bar_hours VARCHAR(255),
    breakfast_restaurant VARCHAR(255),
    breakfast_start TIME,
    breakfast_price_adult DECIMAL(10,2),
    breakfast_price_child DECIMAL(10,2),
    breakfast_for_events BOOLEAN DEFAULT FALSE,
    lead_time VARCHAR(255),
    allergy_deadline VARCHAR(255),
    buffet_min_persons INT,
    has_packages BOOLEAN DEFAULT FALSE,
    has_custom_packages BOOLEAN DEFAULT FALSE,
    coffee_items TEXT,
    lunch_items TEXT,
    buffet_min_lunch INT,
    function_creator VARCHAR(255),
    function_completion VARCHAR(255),
    function_departments TEXT,
    function_attendees TEXT,
    mice_involvement TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
);

-- Create event main table (keeping this as the central entity)
CREATE TABLE events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hotel_id INT NOT NULL,
    contact_name VARCHAR(255),
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    contact_position VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
);

-- Equipment types lookup table (new)
CREATE TABLE equipment_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT
);

-- Junction table for equipment (replaces event_av_equipment)
CREATE TABLE event_equipment (
    event_id INT NOT NULL,
    equipment_id INT NOT NULL,
    quantity INT DEFAULT 0,
    price DECIMAL(10,2) DEFAULT 0.00,
    PRIMARY KEY (event_id, equipment_id),
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (equipment_id) REFERENCES equipment_types(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Financial policies table (consolidating payment info from contracting and handling)
CREATE TABLE event_financials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    requires_deposit BOOLEAN DEFAULT FALSE,
    deposit_rules TEXT,
    deposit_invoicer VARCHAR(255),
    has_info_invoice BOOLEAN DEFAULT FALSE,
    payment_methods JSON,
    invoice_handling TEXT,
    commission_rules TEXT,
    has_minimum_spent BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Booking policies table (consolidating booking rules from contracting and handling)
CREATE TABLE event_booking (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    has_options BOOLEAN DEFAULT FALSE,
    allows_split_options BOOLEAN DEFAULT FALSE,
    option_duration VARCHAR(50),
    allows_overbooking BOOLEAN DEFAULT FALSE,
    rooms_only BOOLEAN DEFAULT FALSE,
    last_minute_leadtime VARCHAR(255),
    contracted_companies TEXT,
    refused_requests TEXT,
    unwanted_marketing TEXT,
    requires_second_signature BOOLEAN DEFAULT FALSE,
    exclusive_clients BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Event operational details (remaining operational items from handling)
CREATE TABLE event_operations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    has_overtime_material BOOLEAN DEFAULT FALSE,
    lunch_location VARCHAR(255),
    min_participants INT DEFAULT 0,
    coffee_location VARCHAR(255),
    material_advance_days INT DEFAULT 0,
    room_drop_fee DECIMAL(10,2) DEFAULT 0.00,
    has_storage BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Combined event spaces table (merging event_spaces and event_technical)
CREATE TABLE event_spaces (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    daily_rate DECIMAL(10,2) DEFAULT 0.00,
    half_day_rate DECIMAL(10,2) DEFAULT 0.00,
    size VARCHAR(50),
    dimensions VARCHAR(50),
    cap_rounds INT DEFAULT 0,
    cap_theatre INT DEFAULT 0,
    cap_classroom INT DEFAULT 0,
    cap_u_shape INT DEFAULT 0,
    cap_boardroom INT DEFAULT 0,
    cap_cabaret INT DEFAULT 0,
    cap_cocktail INT DEFAULT 0,
    features TEXT,
    is_soundproof BOOLEAN DEFAULT FALSE,
    has_daylight BOOLEAN DEFAULT FALSE,
    has_blackout BOOLEAN DEFAULT FALSE,
    has_climate_control BOOLEAN DEFAULT FALSE,
    wifi_speed VARCHAR(50),
    beamer_lumens INT DEFAULT 0,
    supports_hybrid BOOLEAN DEFAULT FALSE,
    presentation_software VARCHAR(255),
    copy_fee DECIMAL(10,2) DEFAULT 0.00,
    has_tech_support BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create event contracting table
CREATE TABLE event_contracting (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    contracted_companies TEXT,
    refused_requests TEXT,
    unwanted_marketing_tools TEXT,
    first_second_option BOOLEAN DEFAULT FALSE,
    split_options BOOLEAN DEFAULT FALSE,
    option_hold_duration VARCHAR(50),
    overbooking_policy BOOLEAN DEFAULT FALSE,
    deposit_required BOOLEAN DEFAULT FALSE,
    accepted_payment_methods TEXT,
    commission_rules TEXT,
    second_signature_required BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- Create event handling table
CREATE TABLE event_handling (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    sold_with_rooms_only BOOLEAN DEFAULT FALSE,
    last_minute_lead_time VARCHAR(255),
    sent_over_time_material BOOLEAN DEFAULT FALSE,
    lunch_location VARCHAR(255),
    min_participants_package INT DEFAULT 0,
    coffee_break_location VARCHAR(255),
    advance_days_for_material INT DEFAULT 0,
    room_drop_cost DECIMAL(10,2) DEFAULT 0.00,
    hotel_exclusive_clients BOOLEAN DEFAULT FALSE,
    minimum_spent BOOLEAN DEFAULT FALSE,
    storage_room BOOLEAN DEFAULT FALSE,
    deposit_needed_event BOOLEAN DEFAULT FALSE,
    deposit_rules_event TEXT,
    deposit_invoice_creator VARCHAR(255),
    informational_invoice_created BOOLEAN DEFAULT FALSE,
    payment_methods_events JSON,
    final_invoice_handling_event TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- Add appropriate indexes
CREATE INDEX idx_rooms_hotel_id ON rooms(hotel_id);
CREATE INDEX idx_room_contacts_room_id ON room_contacts(room_id);
CREATE INDEX idx_room_policies_room_id ON room_policies(room_id);
CREATE INDEX idx_room_inventory_room_id ON room_inventory(room_id);
CREATE INDEX idx_room_pet_policies_room_id ON room_pet_policies(room_id);

-- Create indexes for better performance
CREATE INDEX idx_hotels_city ON hotels(city);
CREATE INDEX idx_hotels_star_rating ON hotels(star_rating);
CREATE INDEX idx_hotels_category ON hotels(category);
CREATE INDEX idx_events_hotel ON events(hotel_id);
CREATE INDEX idx_food_hotel ON food_beverage(hotel_id);
CREATE INDEX idx_spaces_event ON event_spaces(event_id);
CREATE INDEX idx_financials_event ON event_financials(event_id);
CREATE INDEX idx_booking_event ON event_booking(event_id);
CREATE INDEX idx_operations_event ON event_operations(event_id); 