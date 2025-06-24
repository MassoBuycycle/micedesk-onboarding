-- Migration: Update F&B schema to support multiple restaurants and bars
-- Date: 2024-12-01
-- Using ALTER statements and onboarding_ prefix

-- First, rename the existing table to use onboarding_ prefix (if it exists)
-- Note: This will fail gracefully if the table doesn't exist
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'food_beverage_details') > 0,
  'ALTER TABLE food_beverage_details RENAME TO onboarding_food_beverage_details',
  'SELECT "Table food_beverage_details does not exist, skipping rename" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Create table if it doesn't exist yet
CREATE TABLE IF NOT EXISTS onboarding_food_beverage_details (
  id INT AUTO_INCREMENT PRIMARY KEY,
  hotel_id INT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Add new columns to the main F&B details table (using ADD COLUMN IF NOT EXISTS equivalent)
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'onboarding_food_beverage_details' AND column_name = 'fnb_contact_name') = 0,
  'ALTER TABLE onboarding_food_beverage_details ADD COLUMN fnb_contact_name VARCHAR(255)',
  'SELECT "Column fnb_contact_name already exists" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'onboarding_food_beverage_details' AND column_name = 'fnb_contact_position') = 0,
  'ALTER TABLE onboarding_food_beverage_details ADD COLUMN fnb_contact_position VARCHAR(255)',
  'SELECT "Column fnb_contact_position already exists" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'onboarding_food_beverage_details' AND column_name = 'fnb_contact_phone') = 0,
  'ALTER TABLE onboarding_food_beverage_details ADD COLUMN fnb_contact_phone VARCHAR(50)',
  'SELECT "Column fnb_contact_phone already exists" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'onboarding_food_beverage_details' AND column_name = 'fnb_contact_email') = 0,
  'ALTER TABLE onboarding_food_beverage_details ADD COLUMN fnb_contact_email VARCHAR(255)',
  'SELECT "Column fnb_contact_email already exists" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'onboarding_food_beverage_details' AND column_name = 'total_restaurants') = 0,
  'ALTER TABLE onboarding_food_beverage_details ADD COLUMN total_restaurants INT DEFAULT 0',
  'SELECT "Column total_restaurants already exists" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'onboarding_food_beverage_details' AND column_name = 'room_service_available') = 0,
  'ALTER TABLE onboarding_food_beverage_details ADD COLUMN room_service_available BOOLEAN DEFAULT FALSE',
  'SELECT "Column room_service_available already exists" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'onboarding_food_beverage_details' AND column_name = 'room_service_hours') = 0,
  'ALTER TABLE onboarding_food_beverage_details ADD COLUMN room_service_hours VARCHAR(255)',
  'SELECT "Column room_service_hours already exists" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add all other new columns with similar pattern...
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'onboarding_food_beverage_details' AND column_name = 'breakfast_restaurant_name') = 0,
  'ALTER TABLE onboarding_food_beverage_details ADD COLUMN breakfast_restaurant_name VARCHAR(255)',
  'SELECT "Column breakfast_restaurant_name already exists" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Continue adding columns...
ALTER TABLE onboarding_food_beverage_details 
ADD COLUMN IF NOT EXISTS breakfast_hours VARCHAR(255),
ADD COLUMN IF NOT EXISTS breakfast_cost_per_person DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS breakfast_cost_per_child DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS breakfast_child_pricing_tiers TEXT,
ADD COLUMN IF NOT EXISTS breakfast_room_used_for_events BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS staff_planning_lead_time VARCHAR(255),
ADD COLUMN IF NOT EXISTS special_diet_allergy_deadline VARCHAR(255),
ADD COLUMN IF NOT EXISTS conference_packages_offered TEXT,
ADD COLUMN IF NOT EXISTS additional_packages_bookable BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS existing_packages_customizable BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS coffee_break_inclusions TEXT,
ADD COLUMN IF NOT EXISTS standard_lunch_offerings TEXT,
ADD COLUMN IF NOT EXISTS buffet_minimum_persons INT,
ADD COLUMN IF NOT EXISTS additional_packages_available TEXT,
ADD COLUMN IF NOT EXISTS functions_created_by VARCHAR(255),
ADD COLUMN IF NOT EXISTS functions_completion_deadline VARCHAR(255),
ADD COLUMN IF NOT EXISTS departments_requiring_functions VARCHAR(255),
ADD COLUMN IF NOT EXISTS function_meeting_schedule VARCHAR(255),
ADD COLUMN IF NOT EXISTS function_meeting_participants VARCHAR(255),
ADD COLUMN IF NOT EXISTS mice_desk_involvement TEXT;

-- Create the new restaurants table
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
  CONSTRAINT fk_onboarding_fb_restaurants_hotel FOREIGN KEY (hotel_id) REFERENCES onboarding_hotels(id) ON DELETE CASCADE
);

-- Create the new bars table
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
  CONSTRAINT fk_onboarding_fb_bars_hotel FOREIGN KEY (hotel_id) REFERENCES onboarding_hotels(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_onboarding_fb_restaurants_hotel_id ON onboarding_fb_restaurants(hotel_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_fb_bars_hotel_id ON onboarding_fb_bars(hotel_id);

-- Migrate existing restaurant data to new table (if any exists and columns exist)
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'onboarding_food_beverage_details' AND column_name = 'restaurant_name') > 0,
  'INSERT IGNORE INTO onboarding_fb_restaurants (hotel_id, name, cuisine, seats_indoor, exclusive_booking, minimum_price, opening_hours)
   SELECT 
     hotel_id,
     restaurant_name,
     COALESCE(restaurant_cuisine, ""),
     COALESCE(restaurant_seats, 0),
     COALESCE(restaurant_exclusive, FALSE),
     COALESCE(restaurant_price_minimum, 0),
     restaurant_opening_hours
   FROM onboarding_food_beverage_details 
   WHERE restaurant_name IS NOT NULL AND restaurant_name != ""',
  'SELECT "No restaurant data to migrate" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Migrate existing bar data to new table (if any exists and columns exist)
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'onboarding_food_beverage_details' AND column_name = 'bar_name') > 0,
  'INSERT IGNORE INTO onboarding_fb_bars (hotel_id, name, seats_indoor, exclusive_booking, snacks_available, opening_hours)
   SELECT 
     hotel_id,
     bar_name,
     COALESCE(bar_seats, 0),
     COALESCE(bar_exclusive, FALSE),
     COALESCE(bar_snacks_available, FALSE),
     bar_opening_hours
   FROM onboarding_food_beverage_details 
   WHERE bar_name IS NOT NULL AND bar_name != ""',
  'SELECT "No bar data to migrate" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Update the total_restaurants count based on migrated data
UPDATE onboarding_food_beverage_details fbd
SET total_restaurants = (
  SELECT COUNT(*) 
  FROM onboarding_fb_restaurants r 
  WHERE r.hotel_id = fbd.hotel_id
);

-- Map service_times to room_service_hours and set room_service_available (if column exists)
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'onboarding_food_beverage_details' AND column_name = 'service_times') > 0,
  'UPDATE onboarding_food_beverage_details 
   SET room_service_hours = service_times,
       room_service_available = CASE WHEN service_times IS NOT NULL AND service_times != "" THEN TRUE ELSE FALSE END',
  'SELECT "No service_times column to migrate" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Drop old columns that are no longer needed (if they exist)
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'onboarding_food_beverage_details' AND column_name = 'restaurant_name') > 0,
  'ALTER TABLE onboarding_food_beverage_details DROP COLUMN restaurant_name',
  'SELECT "Column restaurant_name does not exist" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add foreign key constraint to main table (if not exists)
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.table_constraints WHERE constraint_schema = DATABASE() AND table_name = 'onboarding_food_beverage_details' AND constraint_name = 'fk_onboarding_food_beverage_details_hotel') = 0,
  'ALTER TABLE onboarding_food_beverage_details ADD CONSTRAINT fk_onboarding_food_beverage_details_hotel FOREIGN KEY (hotel_id) REFERENCES onboarding_hotels(id) ON DELETE CASCADE',
  'SELECT "Foreign key constraint already exists" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt; 