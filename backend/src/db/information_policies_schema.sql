-- Information Policies Schema
-- This schema defines tables for storing hotel information policies

-- Main information policies table
CREATE TABLE IF NOT EXISTS information_policies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  system_hotel_id VARCHAR(50) NOT NULL COMMENT 'External system hotel ID (e.g. HB4I2, 57392, H5425)',
  type ENUM('room_information', 'service_information', 'general_policies') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_system_hotel_id (system_hotel_id),
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