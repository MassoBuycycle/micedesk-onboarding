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
  ('Images', 'images', 'hotel', '["jpg", "jpeg", "png", "webp"]', 5242880),
  ('Documents', 'documents', 'hotel', '["pdf", "doc", "docx"]', 10485760),
  ('Terms of Service', 'tos', 'hotel', '["pdf"]', 5242880),
  ('Images', 'images', 'event', '["jpg", "jpeg", "png", "webp"]', 5242880),
  ('Floor Plans', 'floor_plans', 'event', '["pdf", "jpg", "jpeg", "png"]', 10485760),
  ('Menu', 'menu', 'fb', '["pdf", "jpg", "jpeg", "png"]', 5242880),
  ('Room Photos', 'photos', 'room', '["jpg", "jpeg", "png", "webp"]', 5242880),
  ('Room Category Images', 'images', 'room-category-images', '["jpg", "jpeg", "png", "webp"]', 5242880)
ON DUPLICATE KEY UPDATE id = id; -- No-op to skip duplicates

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
  system_hotel_id VARCHAR(50) UNIQUE COMMENT 'External hotel ID',
  name VARCHAR(255) NOT NULL,
  description TEXT,
  street VARCHAR(255),
  postal_code VARCHAR(20),
  city VARCHAR(100),
  country VARCHAR(100),
  phone VARCHAR(50),
  general_manager_name VARCHAR(255),
  general_manager_phone VARCHAR(50),
  general_manager_email VARCHAR(255),
  email VARCHAR(255),
  website VARCHAR(255),
  additional_links JSON,
  billing_address_name VARCHAR(255),
  billing_address_street VARCHAR(255),
  billing_address_zip VARCHAR(20),
  billing_address_city VARCHAR(100),
  billing_address_vat VARCHAR(50),
  billing_email VARCHAR(255),
  star_rating INT DEFAULT 0,
  category VARCHAR(100),
  opening_year INT,
  latest_renovation_year INT,
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
  parking_remarks TEXT,
  distance_to_airport_km INT DEFAULT 0,
  airport_note TEXT,
  distance_to_highway_km INT DEFAULT 0,
  highway_note TEXT,
  distance_to_fair_km INT DEFAULT 0,
  fair_note TEXT,
  distance_to_train_station INT DEFAULT 0,
  train_station_note TEXT,
  distance_to_public_transport INT DEFAULT 0,
  public_transport_note TEXT,
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
CREATE INDEX idx_onboarding_hotels_hotel_id ON onboarding_hotels(system_hotel_id);
CREATE INDEX idx_onboarding_hotels_billing_email ON onboarding_hotels(billing_email);

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
  is_accessible BOOLEAN DEFAULT FALSE,
  has_balcony BOOLEAN DEFAULT FALSE,
  surcharges_upsell TEXT,
  room_features TEXT,
  second_person_surcharge DECIMAL(10,2),
  extra_bed_surcharge DECIMAL(10,2),
  baby_bed_available BOOLEAN DEFAULT FALSE,
  extra_bed_available BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_room_category_name (room_id, category_name),
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
  group_handling_notes TEXT,
  breakfast_share DECIMAL(10,2) DEFAULT NULL,
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
  call_off_notes TEXT,
  commission_rules TEXT,
  free_spot_policy_leisure_groups TEXT,
  restricted_dates TEXT,
  handled_by_mice_desk BOOLEAN DEFAULT FALSE,
  mice_desk_handling_scope TEXT,
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

-- ------------------------------------------------------------
-- (4.2) CONTRACT & ONBOARDING DETAILS
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS onboarding_contract_details (
  id INT AUTO_INCREMENT PRIMARY KEY,
  hotel_id INT NOT NULL,
  
  -- Contracting fields
  contract_model VARCHAR(255),
  fte_count DECIMAL(10,2) DEFAULT 0 COMMENT 'Number of FTE (Full Time Equivalent)',
  onboarding_date DATE,
  contract_start_date DATE,
  special_agreements TEXT,
  
  -- Technical Setup fields
  email_addresses_created BOOLEAN DEFAULT FALSE,
  access_pms_system BOOLEAN DEFAULT FALSE,
  access_sc_tool BOOLEAN DEFAULT FALSE,
  access_other_systems TEXT COMMENT 'JSON array of other system names',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_hotel_contract (hotel_id),
  FOREIGN KEY (hotel_id) REFERENCES onboarding_hotels(id) ON DELETE CASCADE
);

CREATE INDEX idx_contract_details_hotel ON onboarding_contract_details(hotel_id);

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
  fnb_contact_name VARCHAR(255),
  fnb_contact_position VARCHAR(255),
  fnb_contact_phone VARCHAR(50),
  fnb_contact_email VARCHAR(255),
  -- Aggregated counters and availability
  total_restaurants INT DEFAULT 0,
  room_service_available BOOLEAN DEFAULT FALSE,
  room_service_hours VARCHAR(255),
  -- Breakfast
  breakfast_restaurant_name VARCHAR(255),
  breakfast_hours VARCHAR(255),
  breakfast_cost_per_person DECIMAL(10,2),
  breakfast_cost_per_child DECIMAL(10,2),
  breakfast_child_pricing_tiers VARCHAR(255),
  breakfast_room_used_for_events BOOLEAN DEFAULT FALSE,
  -- Ops & planning
  staff_planning_lead_time VARCHAR(255),
  special_diet_allergy_deadline VARCHAR(255),
  -- Packages
  conference_packages_offered BOOLEAN DEFAULT FALSE,
  additional_packages_bookable BOOLEAN DEFAULT FALSE,
  existing_packages_customizable BOOLEAN DEFAULT FALSE,
  additional_packages_available BOOLEAN DEFAULT FALSE,
  -- Catering details
  coffee_break_inclusions TEXT,
  standard_lunch_offerings TEXT,
  buffet_minimum_persons INT,
  -- Legacy fields retained for backward compatibility
  service_times VARCHAR(255),
  breakfast_start_time VARCHAR(50),
  breakfast_event_available BOOLEAN DEFAULT FALSE,
  operational_lead_time VARCHAR(255),
  allergy_diet_deadline VARCHAR(255),
  coffee_break_items TEXT,
  lunch_standard_items TEXT,
  buffet_minimum_for_lunch INT,
  -- Function coordination (new names preferred)
  functions_created_by VARCHAR(255),
  functions_completion_deadline VARCHAR(255),
  departments_requiring_functions VARCHAR(255),
  function_meeting_schedule VARCHAR(255),
  function_meeting_participants VARCHAR(255),
  -- Legacy aliases
  function_created_by VARCHAR(255),
  function_completion_time VARCHAR(255),
  function_required_depts VARCHAR(255),
  function_meeting_people VARCHAR(255),
  mice_desk_involvement VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (hotel_id) REFERENCES onboarding_hotels(id) ON DELETE CASCADE
);

-- F&B restaurants linked to hotel
CREATE TABLE IF NOT EXISTS onboarding_fb_restaurants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  hotel_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  cuisine VARCHAR(255),
  seats_indoor INT DEFAULT 0,
  seats_outdoor INT DEFAULT 0,
  exclusive_booking BOOLEAN DEFAULT FALSE,
  minimum_price DECIMAL(10,2) DEFAULT 0,
  opening_hours VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_fb_restaurants_hotel_id (hotel_id),
  FOREIGN KEY (hotel_id) REFERENCES onboarding_hotels(id) ON DELETE CASCADE
);

-- F&B bars linked to hotel
CREATE TABLE IF NOT EXISTS onboarding_fb_bars (
  id INT AUTO_INCREMENT PRIMARY KEY,
  hotel_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  seats_indoor INT DEFAULT 0,
  seats_outdoor INT DEFAULT 0,
  exclusive_booking BOOLEAN DEFAULT FALSE,
  opening_hours VARCHAR(255),
  snacks_available BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_fb_bars_hotel_id (hotel_id),
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
  FOREIGN KEY (hotel_id) REFERENCES onboarding_hotels(id) ON DELETE CASCADE,
  INDEX idx_hotel_created (hotel_id, created_at)  -- For duplicate detection performance
);

-- Unified event details (replaces separate booking/financials/operations/technical tables)
-- This is the only event details table that exists in production
CREATE TABLE IF NOT EXISTS onboarding_event_details (
  event_id INT PRIMARY KEY,
  -- Booking
  has_options TINYINT(1) DEFAULT 0,
  allows_split_options TINYINT(1) DEFAULT 0,
  option_duration VARCHAR(100),
  allows_overbooking TINYINT(1) DEFAULT 0,
  rooms_only TINYINT(1) DEFAULT 0,
  last_minute_leadtime VARCHAR(100),
  contracted_companies TEXT,
  refused_requests TEXT,
  unwanted_marketing TEXT,
  requires_second_signature TINYINT(1) DEFAULT 0,
  exclusive_clients TINYINT(1) DEFAULT 0,
  -- Financials
  requires_deposit TINYINT(1) DEFAULT 0,
  deposit_rules TEXT,
  deposit_invoicer VARCHAR(255),
  has_info_invoice TINYINT(1) DEFAULT 0,
  payment_methods JSON,
  invoice_handling TEXT,
  commission_rules TEXT,
  has_minimum_spent TINYINT(1) DEFAULT 0,
  -- Operations / contracting
  sold_with_rooms_only TINYINT(1) DEFAULT 0,
  last_minute_lead_time VARCHAR(100),
  sent_over_time_material TINYINT(1) DEFAULT 0,
  lunch_location TEXT,
  min_participants_package INT DEFAULT 0,
  coffee_break_location TEXT,
  advance_days_for_material VARCHAR(100),
  storage_free_of_charge TINYINT(1) DEFAULT 0,
  storage_pricing_info TEXT,
  room_drop_cost DECIMAL(10,2) DEFAULT 0.00,
  hotel_exclusive_clients TINYINT(1) DEFAULT 0,
  exclusive_clients_info TEXT,
  deposit_needed_event TINYINT(1) DEFAULT 0,
  deposit_rules_event TEXT,
  deposit_invoice_creator VARCHAR(255),
  informational_invoice_created TINYINT(1) DEFAULT 0,
  payment_methods_events JSON,
  final_invoice_handling_event TEXT,
  unwanted_marketing_tools TEXT,
  first_second_option TINYINT(1) DEFAULT 0,
  split_options TINYINT(1) DEFAULT 0,
  option_hold_duration VARCHAR(100),
  overbooking_policy TINYINT(1) DEFAULT 0,
  deposit_required TINYINT(1) DEFAULT 0,
  accepted_payment_methods TEXT,
  second_signature_required TINYINT(1) DEFAULT 0,
  has_overtime_material TINYINT(1) DEFAULT 0,
  min_participants INT DEFAULT 0,
  coffee_location TEXT,
  material_advance_days INT DEFAULT 0,
  room_drop_fee DECIMAL(10,2) DEFAULT 0.00,
  has_storage TINYINT(1) DEFAULT 0,
  minimum_spent_info TEXT,
  -- Technical
  beamer_lumens VARCHAR(100),
  copy_cost DECIMAL(10,2) DEFAULT 0.00,
  software_presentation TEXT,
  wifi_data_rate VARCHAR(100),
  has_ac_or_ventilation TINYINT(1) DEFAULT 0,
  has_blackout_curtains TINYINT(1) DEFAULT 0,
  is_soundproof TINYINT(1) DEFAULT 0,
  has_daylight TINYINT(1) DEFAULT 0,
  is_hybrid_meeting_possible TINYINT(1) DEFAULT 0,
  technical_support_available TINYINT(1) DEFAULT 0,
  technical_notes TEXT,
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
-- Production uses equipment_type VARCHAR instead of equipment_id FK
CREATE TABLE IF NOT EXISTS onboarding_event_equipment (
  event_id INT NOT NULL,
  equipment_type VARCHAR(100) NOT NULL,
  quantity INT DEFAULT 0,
  PRIMARY KEY(event_id, equipment_type),
  FOREIGN KEY (event_id) REFERENCES onboarding_events(id) ON DELETE CASCADE
);

-- AV equipment (stand-alone table for equipment with pricing)
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

-- ------------------------------------------------------------
-- (8) INFORMATION POLICIES
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS onboarding_information_policies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  system_hotel_id VARCHAR(50) NOT NULL,
  type ENUM('room_information','service_information','general_policies') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_system_hotel_id (system_hotel_id),
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