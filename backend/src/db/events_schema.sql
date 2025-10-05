-- Hotels table
CREATE TABLE IF NOT EXISTS hotels (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  street VARCHAR(255),
  postal_code VARCHAR(20),
  city VARCHAR(100),
  phone VARCHAR(50),
  fax VARCHAR(50),
  email VARCHAR(255),
  website VARCHAR(255),
  billing_address_name VARCHAR(255),
  billing_address_street VARCHAR(255),
  billing_address_zip VARCHAR(20),
  billing_address_city VARCHAR(100),
  billing_address_vat VARCHAR(50),
  star_rating INT DEFAULT 0,
  category VARCHAR(100),
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
  parking_cost_per_hour DECIMAL(10, 2) DEFAULT 0,
  parking_cost_per_day DECIMAL(10, 2) DEFAULT 0,
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

-- Event main table
CREATE TABLE IF NOT EXISTS event_main (
  id INT AUTO_INCREMENT PRIMARY KEY,
  hotel_id INT NOT NULL,
  contact_name VARCHAR(255),
  contact_phone VARCHAR(50),
  contact_email VARCHAR(255),
  contact_position VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
);

-- Event AV equipment table
CREATE TABLE IF NOT EXISTS event_av_equipment (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  equipment_name VARCHAR(100) NOT NULL,
  quantity INT DEFAULT 0,
  price_per_unit DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES event_main(id) ON DELETE CASCADE
);

-- Event contracting table
CREATE TABLE IF NOT EXISTS event_contracting (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  contracted_companies TEXT,
  refused_requests TEXT,
  unwanted_marketing_tools TEXT,
  first_second_option BOOLEAN DEFAULT FALSE,
  split_options BOOLEAN DEFAULT FALSE,
  option_hold_duration VARCHAR(100),
  overbooking_policy BOOLEAN DEFAULT FALSE,
  deposit_required BOOLEAN DEFAULT FALSE,
  accepted_payment_methods JSON,
  commission_rules TEXT,
  second_signature_required BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES event_main(id) ON DELETE CASCADE
);

-- Event technical table
CREATE TABLE IF NOT EXISTS event_technical (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  beamer_lumens VARCHAR(100),
  copy_cost DECIMAL(10, 2) DEFAULT 0,
  software_presentation TEXT,
  wifi_data_rate VARCHAR(100),
  has_ac_or_ventilation BOOLEAN DEFAULT FALSE,
  has_blackout_curtains BOOLEAN DEFAULT FALSE,
  is_soundproof BOOLEAN DEFAULT FALSE,
  has_daylight BOOLEAN DEFAULT FALSE,
  is_hybrid_meeting_possible BOOLEAN DEFAULT FALSE,
  technical_support_available BOOLEAN DEFAULT FALSE,
  technical_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES event_main(id) ON DELETE CASCADE
);

-- Event handling table
CREATE TABLE IF NOT EXISTS event_handling (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  sold_with_rooms_only BOOLEAN DEFAULT FALSE,
  last_minute_lead_time VARCHAR(100),
  sent_over_time_material BOOLEAN DEFAULT FALSE,
  lunch_location TEXT,
  min_participants_package INT DEFAULT 0,
  coffee_break_location TEXT,
  advance_days_for_material INT DEFAULT 0,
  room_drop_cost DECIMAL(10, 2) DEFAULT 0,
  hotel_exclusive_clients BOOLEAN DEFAULT FALSE,
  exclusive_clients_info TEXT,
  minimum_spent BOOLEAN DEFAULT FALSE,
  minimum_spent_info TEXT,
  storage_room BOOLEAN DEFAULT FALSE,
  deposit_needed_event BOOLEAN DEFAULT FALSE,
  deposit_rules_event TEXT,
  deposit_invoice_creator VARCHAR(255),
  informational_invoice_created BOOLEAN DEFAULT FALSE,
  payment_methods_events JSON,
  final_invoice_handling_event TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES event_main(id) ON DELETE CASCADE
); 