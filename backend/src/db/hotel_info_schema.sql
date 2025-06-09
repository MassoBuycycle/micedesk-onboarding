CREATE TABLE IF NOT EXISTS hotel_info (
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
);

CREATE TABLE IF NOT EXISTS standard_room_features (
  id INT AUTO_INCREMENT PRIMARY KEY,
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
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payment_methods (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS standard_features (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default data
INSERT INTO hotel_info (
  contact_name, contact_position, contact_phone, contact_email,
  check_in_time, check_out_time, early_check_in_time_frame,
  early_check_in_fee, late_check_out_time, late_check_out_fee,
  reception_hours, single_rooms, double_rooms, connecting_rooms,
  accessible_rooms, pets_allowed, pet_fee, pet_inclusions
) VALUES (
  'John Smith', 'Front Desk Manager', '+1 234 567 8901', 'contact@hotelexample.com',
  '14:00', '12:00', '10:00-14:00',
  0, '14:00', 0,
  '24/7', 10, 15, 5,
  3, TRUE, 20, 'Bed, bowl, treats, etc.'
);

INSERT INTO standard_room_features (
  shower_toilet, bathtub_toilet, open_bathroom, balcony, safe,
  air_condition, heating, hair_dryer, ironing_board, tv,
  telephone, wifi, desk, coffee_maker, kettle,
  minibar, fridge, allergy_friendly_bedding
) VALUES (
  TRUE, TRUE, FALSE, TRUE, TRUE,
  TRUE, TRUE, TRUE, TRUE, TRUE,
  TRUE, TRUE, TRUE, TRUE, TRUE,
  TRUE, FALSE, TRUE
);

INSERT INTO payment_methods (name, enabled) VALUES
('Cash', TRUE),
('Credit Card', TRUE),
('Debit Card', TRUE),
('Bank Transfer', TRUE),
('PayPal', TRUE);

INSERT INTO standard_features (name) VALUES
('Shower Toilet'),
('Bathtub Toilet'),
('Safe'),
('TV'),
('Telephone'),
('WiFi'),
('Desk'),
('Minibar'); 