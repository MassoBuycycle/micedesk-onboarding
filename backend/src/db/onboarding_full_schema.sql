-- ------------------------------------------------------------
-- Onboarding CMS – Full Schema with prefixed table names
-- This script creates / recreates the full database schema
--   used by the application, but every table name is
--   prefixed with `onboarding_` to avoid conflicts.
-- ------------------------------------------------------------

-- IMPORTANT:
--  • Make sure you are connected as a user that has the
--    privileges to create databases, tables, triggers and
--    views.
--  • If the target database (`hotel_cms`) does not yet exist
--    it will be created automatically.

-- ------------------------------------------------------------
-- (1) DATABASE
-- ------------------------------------------------------------
CREATE DATABASE IF NOT EXISTS hotel_cms CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE hotel_cms;

-- ------------------------------------------------------------
-- (2) CORE LOOK-UP / UTILITY TABLES
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS onboarding_files (
  id INT AUTO_INCREMENT PRIMARY KEY,
  original_name VARCHAR(255) NOT NULL,
  storage_path VARCHAR(1024) NOT NULL,
  file_type_id INT,
  entity_type VARCHAR(50) NOT NULL,
  entity_id INT NOT NULL,
  size INT NOT NULL,
  mime_type VARCHAR(255) NOT NULL,
  is_temporary TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS onboarding_file_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL,
  category VARCHAR(50) NOT NULL,
  allowed_extensions JSON NOT NULL,
  max_size INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_code_category (code, category)
);

-- Seed default file types
INSERT INTO onboarding_file_types (name, code, category, allowed_extensions, max_size)
VALUES 
  ('Images', 'images', 'hotel',      '["jpg", "jpeg", "png", "webp"]',  5242880),
  ('Documents', 'documents', 'hotel','["pdf", "doc", "docx"]',          10485760),
  ('Terms of Service','tos','hotel', '["pdf"]',                           5242880),
  ('Images', 'images', 'event',      '["jpg", "jpeg", "png", "webp"]',  5242880),
  ('Floor Plans','floor_plans','event','["pdf", "jpg", "jpeg", "png"]', 10485760),
  ('Menu','menu','fb',               '["pdf", "jpg", "jpeg", "png"]', 5242880),
  ('Room Photos','photos','room',    '["jpg", "jpeg", "png", "webp"]',  5242880)
ON DUPLICATE KEY UPDATE id = id;

-- ------------------------------------------------------------
-- (3) USERS & SECURITY TABLES
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS onboarding_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  status ENUM('active','pending','inactive') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS onboarding_roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  is_system BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS onboarding_permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS onboarding_role_permissions (
  role_id INT NOT NULL,
  permission_id INT NOT NULL,
  PRIMARY KEY (role_id, permission_id),
  FOREIGN KEY (role_id)       REFERENCES onboarding_roles(id)       ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES onboarding_permissions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS onboarding_user_roles (
  user_id INT NOT NULL,
  role_id INT NOT NULL,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(user_id, role_id),
  FOREIGN KEY (user_id) REFERENCES onboarding_users(id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES onboarding_roles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS onboarding_resource_permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  resource_type ENUM('hotel','room','event','file') NOT NULL,
  resource_id INT NOT NULL,
  permission_type ENUM('view','edit','delete','manage') NOT NULL,
  granted_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)    REFERENCES onboarding_users(id) ON DELETE CASCADE,
  FOREIGN KEY (granted_by) REFERENCES onboarding_users(id) ON DELETE SET NULL
);

-- ------------------------------------------------------------
-- (4) HOTEL CORE TABLES
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS onboarding_hotels (
  id INT AUTO_INCREMENT PRIMARY KEY,
  hotel_id VARCHAR(50) UNIQUE COMMENT 'External hotel ID',
  name VARCHAR(255) NOT NULL,
  description TEXT,
  street VARCHAR(255),
  postal_code VARCHAR(20),
  city VARCHAR(100),
  country VARCHAR(100),
  phone VARCHAR(50),
  email VARCHAR(255),
  website VARCHAR(255),
  billing_address_name VARCHAR(255),
  billing_address_street VARCHAR(255),
  billing_address_zip VARCHAR(20),
  billing_address_city VARCHAR(100),
  billing_address_vat VARCHAR(50),
  star_rating INT DEFAULT 0,
  category VARCHAR(100),
  opening_year INT,
  latest_renovation_year INT,
  opening_date INT,
  latest_renovation_date INT,
  total_rooms INT DEFAULT 0,
  conference_rooms INT DEFAULT 0,
  pms_system TEXT,
  no_of_parking_spaces INT DEFAULT 0,
  no_of_parking_spaces_garage INT DEFAULT 0,
  no_of_parking_spaces_electric INT DEFAULT 0,
  no_of_parking_spaces_bus INT DEFAULT 0,
  no_of_parking_spaces_outside INT DEFAULT 0,
  no_of_parking_spaces_disabled INT DEFAULT 0,
  parking_cost_per_hour DECIMAL(10,2) DEFAULT 0,
  parking_cost_per_day DECIMAL(10,2) DEFAULT 0,
  distance_to_airport_km INT DEFAULT 0,
  distance_to_highway_km INT DEFAULT 0,
  distance_to_fair_km INT DEFAULT 0,
  distance_to_train_station INT DEFAULT 0,
  distance_to_public_transport INT DEFAULT 0,
  opening_time_pool VARCHAR(100),
  opening_time_fitness_center VARCHAR(100),
  opening_time_spa_area VARCHAR(100),
  equipment_fitness_center TEXT,
  equipment_spa_area TEXT,
  planned_changes TEXT,
  attraction_in_the_area TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Quick lookup index for external id
CREATE INDEX idx_onboarding_hotels_hotel_id ON onboarding_hotels(hotel_id);

-- Hotel supplemental info (flattened former hotel_info table)
CREATE TABLE IF NOT EXISTS onboarding_hotel_info (
  hotel_id INT PRIMARY KEY, -- 1-to-1 with onboarding_hotels.id
  contact_name VARCHAR(255),
  contact_position VARCHAR(255),
  contact_phone VARCHAR(50),
  contact_email VARCHAR(255),
  check_in_time TIME,
  check_out_time TIME,
  early_check_in_time_frame VARCHAR(50),
  early_check_in_fee DECIMAL(10,2) DEFAULT 0,
  late_check_out_time TIME,
  late_check_out_fee DECIMAL(10,2) DEFAULT 0,
  reception_hours VARCHAR(50),
  single_rooms INT DEFAULT 0,
  double_rooms INT DEFAULT 0,
  connecting_rooms INT DEFAULT 0,
  accessible_rooms INT DEFAULT 0,
  pets_allowed BOOLEAN DEFAULT FALSE,
  pet_fee DECIMAL(10,2) DEFAULT 0,
  pet_inclusions TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (hotel_id) REFERENCES onboarding_hotels(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- (4.1) ROOM MANAGEMENT TABLES
-- ------------------------------------------------------------

-- Main rooms table - core information
CREATE TABLE IF NOT EXISTS onboarding_rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  hotel_id INT NOT NULL,
  main_contact_name VARCHAR(255),
  main_contact_position VARCHAR(255),
  reception_hours VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (hotel_id) REFERENCES onboarding_hotels(id) ON DELETE CASCADE
);

-- Room contacts information
CREATE TABLE IF NOT EXISTS onboarding_room_contacts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_id INT NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES onboarding_rooms(id) ON DELETE CASCADE
);

-- Room check-in/check-out policies
CREATE TABLE IF NOT EXISTS onboarding_room_policies (
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
  FOREIGN KEY (room_id) REFERENCES onboarding_rooms(id) ON DELETE CASCADE
);

-- Room inventory information
CREATE TABLE IF NOT EXISTS onboarding_room_inventory (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_id INT NOT NULL,
  amt_single_rooms INT,
  amt_double_rooms INT,
  amt_connecting_rooms INT,
  amt_handicapped_accessible_rooms INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES onboarding_rooms(id) ON DELETE CASCADE
);

-- Room pet policies
CREATE TABLE IF NOT EXISTS onboarding_room_pet_policies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_id INT NOT NULL,
  is_dogs_allowed BOOLEAN DEFAULT FALSE,
  dog_fee DECIMAL(10,2),
  dog_fee_inclusions TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES onboarding_rooms(id) ON DELETE CASCADE
);

-- Room category info table
CREATE TABLE IF NOT EXISTS onboarding_room_category_infos (
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
  FOREIGN KEY (room_id) REFERENCES onboarding_rooms(id) ON DELETE CASCADE
);

-- Room operational handling table
CREATE TABLE IF NOT EXISTS onboarding_room_operational_handling (
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
  FOREIGN KEY (room_id) REFERENCES onboarding_rooms(id) ON DELETE CASCADE
);

-- Updated standard room features table (now linked to specific rooms)
CREATE TABLE IF NOT EXISTS onboarding_room_standard_features (
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
  FOREIGN KEY (room_id) REFERENCES onboarding_rooms(id) ON DELETE CASCADE
);

-- Drop the old standalone standard_room_features table if it exists
DROP TABLE IF EXISTS onboarding_standard_room_features;

-- Create indexes for room tables
CREATE INDEX idx_onboarding_rooms_hotel_id ON onboarding_rooms(hotel_id);
CREATE INDEX idx_onboarding_room_contacts_room_id ON onboarding_room_contacts(room_id);
CREATE INDEX idx_onboarding_room_policies_room_id ON onboarding_room_policies(room_id);
CREATE INDEX idx_onboarding_room_inventory_room_id ON onboarding_room_inventory(room_id);
CREATE INDEX idx_onboarding_room_pet_policies_room_id ON onboarding_room_pet_policies(room_id);
CREATE INDEX idx_onboarding_room_category_infos_room_id ON onboarding_room_category_infos(room_id);
CREATE INDEX idx_onboarding_room_operational_handling_room_id ON onboarding_room_operational_handling(room_id);
CREATE INDEX idx_onboarding_room_standard_features_room_id ON onboarding_room_standard_features(room_id);

CREATE TABLE IF NOT EXISTS onboarding_payment_methods (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Seed payment methods
INSERT IGNORE INTO onboarding_payment_methods (name, enabled) VALUES
('Cash', true),
('Credit Card (Visa)', true),
('Credit Card (Mastercard)', true),
('Credit Card (American Express)', true),
('Debit Card', true),
('Bank Transfer', true),
('PayPal', true),
('Apple Pay', false),
('Google Pay', false),
('Check', true),
('Invoice (30 days)', true),
('Corporate Account', true);

CREATE TABLE IF NOT EXISTS onboarding_standard_features (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Seed standard features
INSERT IGNORE INTO onboarding_standard_features (name) VALUES
('WiFi'),
('Air Conditioning'),
('Heating'),
('Private Bathroom'),
('Shower'),
('Bathtub'),
('Hair Dryer'),
('TV'),
('Cable/Satellite TV'),
('Telephone'),
('Safe'),
('Minibar'),
('Refrigerator'),
('Coffee Maker'),
('Kettle'),
('Desk'),
('Balcony'),
('Terrace'),
('Room Service'),
('Housekeeping'),
('Allergy-Friendly Bedding'),
('Extra Bed Available'),
('Baby Bed Available'),
('City View'),
('Garden View'),
('Pool View'),
('Mountain View'),
('Sea View');

-- ------------------------------------------------------------
-- (5) USER ↔ HOTEL ASSIGNMENTS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS onboarding_user_hotel_assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  hotel_id INT NOT NULL,
  assigned_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY user_hotel_unique (user_id, hotel_id),
  FOREIGN KEY (user_id)  REFERENCES onboarding_users(id)  ON DELETE CASCADE,
  FOREIGN KEY (hotel_id) REFERENCES onboarding_hotels(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS onboarding_user_all_hotels_access (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  assigned_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY user_unique (user_id),
  FOREIGN KEY (user_id) REFERENCES onboarding_users(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- (6) FOOD & BEVERAGE DETAILS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS onboarding_food_beverage_details (
  hotel_id INT PRIMARY KEY,
  fnb_contact_position VARCHAR(255),
  fnb_contact_name VARCHAR(255),
  fnb_contact_phone VARCHAR(50),
  fnb_contact_email VARCHAR(255),
  restaurant_name VARCHAR(255),
  restaurant_cuisine VARCHAR(255),
  restaurant_seats INT,
  restaurant_opening_hours VARCHAR(255),
  restaurant_exclusive BOOLEAN DEFAULT FALSE,
  restaurant_price_minimum DECIMAL(10,2),
  bar_name VARCHAR(255),
  bar_seats INT,
  bar_exclusive BOOLEAN DEFAULT FALSE,
  bar_snacks_available BOOLEAN DEFAULT FALSE,
  bar_opening_hours VARCHAR(255),
  service_times VARCHAR(255),
  breakfast_restaurant_name VARCHAR(255),
  breakfast_start_time VARCHAR(50),
  breakfast_cost_per_person DECIMAL(10,2),
  breakfast_cost_per_child DECIMAL(10,2),
  breakfast_event_available BOOLEAN DEFAULT FALSE,
  operational_lead_time VARCHAR(255),
  allergy_diet_deadline VARCHAR(255),
  buffet_minimum_persons INT,
  fnb_packages_available BOOLEAN DEFAULT FALSE,
  extra_packages_customized BOOLEAN DEFAULT FALSE,
  coffee_break_items TEXT,
  lunch_standard_items TEXT,
  buffet_minimum_for_lunch INT,
  function_created_by VARCHAR(255),
  function_completion_time VARCHAR(255),
  function_required_depts VARCHAR(255),
  function_meeting_people VARCHAR(255),
  mice_desk_involvement VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (hotel_id) REFERENCES onboarding_hotels(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- (7) EVENTS & MEETINGS SECTION
-- ------------------------------------------------------------

-- Equipment types lookup table (missing from original schema)
CREATE TABLE IF NOT EXISTS onboarding_equipment_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  equipment_name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Seed equipment types
INSERT IGNORE INTO onboarding_equipment_types (equipment_name, description) VALUES
('Projector', 'Digital projector for presentations'),
('Screen', 'Projection screen'),
('Microphone', 'Wireless microphone'),
('Speaker System', 'Audio speaker system'),
('Laptop', 'Laptop computer'),
('Flip Chart', 'Flip chart stand with paper'),
('Whiteboard', 'Portable whiteboard'),
('Extension Cord', 'Power extension cord'),
('Laser Pointer', 'Presentation laser pointer'),
('Conference Phone', 'Conference call phone system'),
('Video Camera', 'Video recording camera'),
('Lighting Equipment', 'Professional lighting setup'),
('PA System', 'Public address system'),
('Stage', 'Portable stage platform'),
('Podium', 'Speaker podium'),
('AV Cart', 'Mobile AV equipment cart');

-- Core event record (formerly `events`)
CREATE TABLE IF NOT EXISTS onboarding_events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  hotel_id INT NOT NULL,
  contact_name VARCHAR(255),
  contact_phone VARCHAR(50),
  contact_email VARCHAR(255),
  contact_position VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (hotel_id) REFERENCES onboarding_hotels(id) ON DELETE CASCADE
);

-- Event booking details
CREATE TABLE IF NOT EXISTS onboarding_event_booking (
  event_id INT PRIMARY KEY,
  has_options BOOLEAN DEFAULT FALSE,
  allows_split_options BOOLEAN DEFAULT FALSE,
  option_duration VARCHAR(100),
  allows_overbooking BOOLEAN DEFAULT FALSE,
  rooms_only BOOLEAN DEFAULT FALSE,
  last_minute_leadtime VARCHAR(100),
  contracted_companies TEXT,
  refused_requests TEXT,
  unwanted_marketing TEXT,
  requires_second_signature BOOLEAN DEFAULT FALSE,
  exclusive_clients BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES onboarding_events(id) ON DELETE CASCADE
);

-- Event financials
CREATE TABLE IF NOT EXISTS onboarding_event_financials (
  event_id INT PRIMARY KEY,
  requires_deposit BOOLEAN DEFAULT FALSE,
  deposit_rules TEXT,
  deposit_invoicer VARCHAR(255),
  has_info_invoice BOOLEAN DEFAULT FALSE,
  payment_methods JSON,
  invoice_handling TEXT,
  commission_rules TEXT,
  has_minimum_spent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES onboarding_events(id) ON DELETE CASCADE
);

-- Event operations (merged old event_handling & event_contracting)
CREATE TABLE IF NOT EXISTS onboarding_event_operations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  sold_with_rooms_only BOOLEAN DEFAULT FALSE,
  last_minute_lead_time VARCHAR(100),
  sent_over_time_material BOOLEAN DEFAULT FALSE,
  lunch_location TEXT,
  min_participants_package INT DEFAULT 0,
  coffee_break_location TEXT,
  advance_days_for_material INT DEFAULT 0,
  room_drop_cost DECIMAL(10,2) DEFAULT 0,
  hotel_exclusive_clients BOOLEAN DEFAULT FALSE,
  minimum_spent BOOLEAN DEFAULT FALSE,
  storage_room BOOLEAN DEFAULT FALSE,
  deposit_needed_event BOOLEAN DEFAULT FALSE,
  deposit_rules_event TEXT,
  deposit_invoice_creator VARCHAR(255),
  informational_invoice_created BOOLEAN DEFAULT FALSE,
  payment_methods_events JSON,
  final_invoice_handling_event TEXT,
  contracted_companies TEXT,
  refused_requests TEXT,
  unwanted_marketing_tools TEXT,
  first_second_option BOOLEAN DEFAULT FALSE,
  split_options BOOLEAN DEFAULT FALSE,
  option_hold_duration VARCHAR(100),
  overbooking_policy BOOLEAN DEFAULT FALSE,
  deposit_required BOOLEAN DEFAULT FALSE,
  accepted_payment_methods TEXT,
  commission_rules TEXT,
  second_signature_required BOOLEAN DEFAULT FALSE,
  has_overtime_material BOOLEAN DEFAULT FALSE,
  min_participants INT DEFAULT 0,
  coffee_location TEXT,
  material_advance_days INT DEFAULT 0,
  room_drop_fee DECIMAL(10,2) DEFAULT 0,
  has_storage BOOLEAN DEFAULT FALSE,
  has_minimum_spent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES onboarding_events(id) ON DELETE CASCADE
);

-- Event spaces (rooms / halls)
CREATE TABLE IF NOT EXISTS onboarding_event_spaces (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  daily_rate DECIMAL(10,2),
  half_day_rate DECIMAL(10,2),
  size VARCHAR(50),
  dimensions VARCHAR(50),
  cap_rounds INT,
  cap_theatre INT,
  cap_classroom INT,
  cap_u_shape INT,
  cap_boardroom INT,
  cap_cabaret INT,
  cap_cocktail INT,
  features TEXT,
  is_soundproof BOOLEAN DEFAULT FALSE,
  has_daylight BOOLEAN DEFAULT FALSE,
  has_blackout BOOLEAN DEFAULT FALSE,
  has_climate_control BOOLEAN DEFAULT FALSE,
  wifi_speed VARCHAR(100),
  beamer_lumens VARCHAR(100),
  supports_hybrid BOOLEAN DEFAULT FALSE,
  presentation_software TEXT,
  copy_fee DECIMAL(10,2),
  has_tech_support BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES onboarding_events(id) ON DELETE CASCADE
);

-- Event equipment mapping
CREATE TABLE IF NOT EXISTS onboarding_event_equipment (
  event_id INT NOT NULL,
  equipment_id INT NOT NULL,
  quantity INT DEFAULT 0,
  PRIMARY KEY(event_id, equipment_id),
  FOREIGN KEY (event_id) REFERENCES onboarding_events(id) ON DELETE CASCADE,
  FOREIGN KEY (equipment_id) REFERENCES onboarding_equipment_types(id) ON DELETE CASCADE
);

-- AV equipment (stand-alone table if required)
CREATE TABLE IF NOT EXISTS onboarding_event_av_equipment (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  equipment_name VARCHAR(100) NOT NULL,
  quantity INT DEFAULT 0,
  price_per_unit DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES onboarding_events(id) ON DELETE CASCADE
);

-- Technical requirements per event
CREATE TABLE IF NOT EXISTS onboarding_event_technical (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  beamer_lumens VARCHAR(100),
  copy_cost DECIMAL(10,2) DEFAULT 0,
  software_presentation TEXT,
  wifi_data_rate VARCHAR(100),
  has_ac_or_ventilation BOOLEAN DEFAULT FALSE,
  has_blackout_curtains BOOLEAN DEFAULT FALSE,
  is_soundproof BOOLEAN DEFAULT FALSE,
  has_daylight BOOLEAN DEFAULT FALSE,
  is_hybrid_meeting_possible BOOLEAN DEFAULT FALSE,
  technical_support_available BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES onboarding_events(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- (8) INFORMATION POLICIES
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS onboarding_information_policies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  hotel_id VARCHAR(50) NOT NULL,
  type ENUM('room_information','service_information','general_policies') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_hotel_id (hotel_id),
  INDEX idx_type (type)
);

CREATE TABLE IF NOT EXISTS onboarding_information_policy_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  information_policy_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  is_condition BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (information_policy_id) REFERENCES onboarding_information_policies(id) ON DELETE CASCADE,
  INDEX idx_policy_id (information_policy_id)
);

CREATE TABLE IF NOT EXISTS onboarding_information_policy_item_details (
  id INT AUTO_INCREMENT PRIMARY KEY,
  information_policy_item_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (information_policy_item_id) REFERENCES onboarding_information_policy_items(id) ON DELETE CASCADE,
  INDEX idx_policy_item_id (information_policy_item_id)
);

-- ------------------------------------------------------------
-- (9) APPROVAL & CHANGE TRACKING
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS onboarding_pending_changes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  entry_id INT NOT NULL,
  entry_type ENUM('hotel','room','event') NOT NULL DEFAULT 'hotel',
  user_id INT NOT NULL,
  change_data JSON NOT NULL,
  original_data JSON NOT NULL,
  status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  reviewed_by INT,
  review_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)     REFERENCES onboarding_users(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewed_by) REFERENCES onboarding_users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS onboarding_entry_assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  entry_id INT NOT NULL,
  entry_type ENUM('hotel','room','event') NOT NULL DEFAULT 'hotel',
  user_id INT NOT NULL,
  assigned_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES onboarding_users(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_by) REFERENCES onboarding_users(id) ON DELETE CASCADE,
  UNIQUE KEY (entry_id, entry_type, user_id)
);

-- ------------------------------------------------------------
-- (10) HOTEL SECURE DATA (encrypted credentials)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS onboarding_hotel_secure_data (
  id INT AUTO_INCREMENT PRIMARY KEY,
  hotel_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  username VARCHAR(255),
  password_encrypted VARCHAR(1024) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (hotel_id) REFERENCES onboarding_hotels(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- (11) DEFAULT PERMISSIONS/ROLES SEEDING (idempotent)
-- ------------------------------------------------------------
INSERT IGNORE INTO onboarding_roles (id, name, description, is_system) VALUES
  (1, 'Admin',       'System administrator', TRUE),
  (2, 'Editor',      'Can edit all entries without approval', TRUE),
  (3, 'Contributor', 'Can edit assigned entries with approval', TRUE),
  (4, 'Viewer',      'Read-only access', TRUE);

INSERT IGNORE INTO onboarding_permissions (code, name, description, category) VALUES
('view_entries',        'View Entries',             'Can view hotel entries',        'entry'),
('edit_all',            'Edit All Entries',         'Can edit any entry',            'entry'),
('edit_assigned',       'Edit Assigned Entries',    'Can edit assigned entries',     'entry'),
('edit_with_approval',  'Edit With Approval',       'Edits require approval',        'entry'),
('approve_changes',     'Approve Changes',          'Can approve pending changes',   'entry'),
('assign_entries',      'Assign Entries',           'Can assign entries',            'entry'),
('view_users',          'View Users',               'Can view user information',     'user'),
('edit_users',          'Edit Users',               'Can create and edit users',     'user'),
('manage_roles',        'Manage Roles',             'Can manage roles & permissions','user');

-- Map default permissions to Admin role
INSERT IGNORE INTO onboarding_role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM onboarding_roles r, onboarding_permissions p WHERE r.name = 'Admin';

-- ------------------------------------------------------------
-- (12) HOTEL ANNOUNCEMENTS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS onboarding_hotel_announcements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  hotel_id INT NOT NULL,
  message TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (hotel_id) REFERENCES onboarding_hotels(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES onboarding_users(id) ON DELETE SET NULL
);

-- ------------------------------------------------------------
-- End of file.
-- ------------------------------------------------------------ 