-- Setup script for Information Policies (Fixed for MySQL compatibility)
-- Run this script to set up the information policies system

USE hotel_cms;

-- Add external hotel_id field to hotels table (check if exists first)
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = 'hotel_cms' 
     AND TABLE_NAME = 'hotels' 
     AND COLUMN_NAME = 'hotel_id') = 0,
    'ALTER TABLE hotels ADD COLUMN hotel_id VARCHAR(50) UNIQUE COMMENT "External hotel ID (e.g. HB4I2, 57392, H5425)"',
    'SELECT "Column hotel_id already exists" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add index for better performance (if not exists)
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
     WHERE TABLE_SCHEMA = 'hotel_cms' 
     AND TABLE_NAME = 'hotels' 
     AND INDEX_NAME = 'idx_hotels_hotel_id') = 0,
    'CREATE INDEX idx_hotels_hotel_id ON hotels(hotel_id)',
    'SELECT "Index idx_hotels_hotel_id already exists" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Create information policies tables
CREATE TABLE IF NOT EXISTS information_policies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  hotel_id VARCHAR(50) NOT NULL COMMENT 'External hotel ID (e.g. HB4I2, 57392, H5425)',
  type ENUM('room_information', 'service_information', 'general_policies') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_hotel_id (hotel_id),
  INDEX idx_type (type)
);

-- Information policy items table
CREATE TABLE IF NOT EXISTS information_policy_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  information_policy_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  is_condition BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (information_policy_id) REFERENCES information_policies(id) ON DELETE CASCADE,
  INDEX idx_policy_id (information_policy_id)
);

-- Information policy item details table
CREATE TABLE IF NOT EXISTS information_policy_item_details (
  id INT AUTO_INCREMENT PRIMARY KEY,
  information_policy_item_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (information_policy_item_id) REFERENCES information_policy_items(id) ON DELETE CASCADE,
  INDEX idx_policy_item_id (information_policy_item_id)
);

-- Insert sample data for testing (only if tables are empty)
INSERT IGNORE INTO information_policies (hotel_id, type) VALUES 
('HB4I2', 'room_information'),
('HB4I2', 'service_information'),
('57392', 'general_policies');

-- Insert sample policy items (only if tables are empty)
INSERT IGNORE INTO information_policy_items (information_policy_id, title, is_condition) VALUES
(1, 'Check-in Requirements', true),
(1, 'Room Amenities', false),
(2, 'Breakfast Service', false),
(2, 'Parking Policy', true),
(3, 'Cancellation Policy', true),
(3, 'Pet Policy', false);

-- Insert sample policy item details (only if tables are empty)
INSERT IGNORE INTO information_policy_item_details (information_policy_item_id, name, description) VALUES
(1, 'Valid ID Required', 'Guests must present a valid government-issued photo ID at check-in'),
(1, 'Credit Card Authorization', 'A credit card is required for incidental charges'),
(2, 'Free WiFi', 'Complimentary high-speed internet access in all rooms'),
(2, 'Mini Refrigerator', 'All rooms include a mini refrigerator'),
(3, 'Breakfast Hours', 'Continental breakfast served daily from 6:30 AM to 10:00 AM'),
(3, 'Dietary Restrictions', 'Please inform us of any dietary restrictions in advance'),
(4, 'Parking Availability', 'Self-parking available for $15 per night'),
(4, 'Valet Service', 'Valet parking available for $25 per night'),
(5, 'Free Cancellation', 'Cancel up to 24 hours before arrival for full refund'),
(5, 'Late Cancellation Fee', 'Cancellations within 24 hours subject to one night charge'),
(6, 'Pet Fee', 'Pets welcome with $50 per night fee'),
(6, 'Pet Restrictions', 'Maximum 2 pets per room, 50 lbs weight limit');

SELECT 'Information Policies setup completed successfully!' as status; 