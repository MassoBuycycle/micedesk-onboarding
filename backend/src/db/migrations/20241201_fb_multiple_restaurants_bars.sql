-- Migration: Update F&B schema to support multiple restaurants and bars
-- Date: 2024-12-01
-- Using ALTER statements and onboarding_ prefix

-- First, rename the existing table to use onboarding_ prefix
ALTER TABLE food_beverage_details RENAME TO onboarding_food_beverage_details;

-- Add auto-increment primary key if it doesn't exist
ALTER TABLE onboarding_food_beverage_details 
ADD COLUMN id INT AUTO_INCREMENT PRIMARY KEY FIRST;

-- Add new columns to the main F&B details table
ALTER TABLE onboarding_food_beverage_details 
ADD COLUMN total_restaurants INT DEFAULT 0 AFTER fnb_contact_email,
ADD COLUMN room_service_available BOOLEAN DEFAULT FALSE AFTER total_restaurants,
ADD COLUMN room_service_hours VARCHAR(255) AFTER room_service_available,
ADD COLUMN breakfast_hours VARCHAR(255) AFTER breakfast_restaurant_name,
ADD COLUMN breakfast_child_pricing_tiers TEXT AFTER breakfast_cost_per_child,
ADD COLUMN breakfast_room_used_for_events BOOLEAN DEFAULT FALSE AFTER breakfast_child_pricing_tiers,
ADD COLUMN staff_planning_lead_time VARCHAR(255) AFTER breakfast_room_used_for_events,
ADD COLUMN special_diet_allergy_deadline VARCHAR(255) AFTER staff_planning_lead_time,
ADD COLUMN conference_packages_offered TEXT AFTER special_diet_allergy_deadline,
ADD COLUMN additional_packages_bookable BOOLEAN DEFAULT FALSE AFTER conference_packages_offered,
ADD COLUMN existing_packages_customizable BOOLEAN DEFAULT FALSE AFTER additional_packages_bookable,
ADD COLUMN coffee_break_inclusions TEXT AFTER existing_packages_customizable,
ADD COLUMN standard_lunch_offerings TEXT AFTER coffee_break_inclusions,
ADD COLUMN additional_packages_available TEXT AFTER buffet_minimum_persons,
ADD COLUMN functions_created_by VARCHAR(255) AFTER additional_packages_available,
ADD COLUMN functions_completion_deadline VARCHAR(255) AFTER functions_created_by,
ADD COLUMN departments_requiring_functions VARCHAR(255) AFTER functions_completion_deadline,
ADD COLUMN function_meeting_schedule VARCHAR(255) AFTER departments_requiring_functions,
ADD COLUMN function_meeting_participants VARCHAR(255) AFTER function_meeting_schedule;

-- Update existing field names and data types
ALTER TABLE onboarding_food_beverage_details 
CHANGE COLUMN breakfast_start_time breakfast_hours VARCHAR(255),
CHANGE COLUMN breakfast_event_available breakfast_room_used_for_events BOOLEAN DEFAULT FALSE,
CHANGE COLUMN operational_lead_time staff_planning_lead_time VARCHAR(255),
CHANGE COLUMN allergy_diet_deadline special_diet_allergy_deadline VARCHAR(255),
CHANGE COLUMN fnb_packages_available additional_packages_bookable BOOLEAN DEFAULT FALSE,
CHANGE COLUMN extra_packages_customized existing_packages_customizable BOOLEAN DEFAULT FALSE,
CHANGE COLUMN coffee_break_items coffee_break_inclusions TEXT,
CHANGE COLUMN lunch_standard_items standard_lunch_offerings TEXT,
CHANGE COLUMN buffet_minimum_for_lunch additional_packages_available TEXT,
CHANGE COLUMN function_created_by functions_created_by VARCHAR(255),
CHANGE COLUMN function_completion_time functions_completion_deadline VARCHAR(255),
CHANGE COLUMN function_required_depts departments_requiring_functions VARCHAR(255),
CHANGE COLUMN function_meeting_people function_meeting_participants VARCHAR(255),
CHANGE COLUMN mice_desk_involvement mice_desk_involvement TEXT;

-- Create the new restaurants table
CREATE TABLE onboarding_fb_restaurants (
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
  CONSTRAINT fk_onboarding_fb_restaurants_hotel FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
);

-- Create the new bars table
CREATE TABLE onboarding_fb_bars (
  id INT AUTO_INCREMENT PRIMARY KEY,
  hotel_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  seats_indoor INT DEFAULT 0,
  exclusive_booking BOOLEAN DEFAULT FALSE,
  opening_hours VARCHAR(255),
  snacks_available BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_onboarding_fb_bars_hotel FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_onboarding_fb_restaurants_hotel_id ON onboarding_fb_restaurants(hotel_id);
CREATE INDEX idx_onboarding_fb_bars_hotel_id ON onboarding_fb_bars(hotel_id);

-- Migrate existing restaurant data to new table (if any exists)
INSERT INTO onboarding_fb_restaurants (hotel_id, name, cuisine, seats_indoor, exclusive_booking, minimum_price, opening_hours)
SELECT 
  hotel_id,
  restaurant_name,
  restaurant_cuisine,
  COALESCE(restaurant_seats, 0),
  COALESCE(restaurant_exclusive, FALSE),
  COALESCE(restaurant_price_minimum, 0),
  restaurant_opening_hours
FROM onboarding_food_beverage_details 
WHERE restaurant_name IS NOT NULL AND restaurant_name != '';

-- Migrate existing bar data to new table (if any exists)
INSERT INTO onboarding_fb_bars (hotel_id, name, seats_indoor, exclusive_booking, snacks_available, opening_hours)
SELECT 
  hotel_id,
  bar_name,
  COALESCE(bar_seats, 0),
  COALESCE(bar_exclusive, FALSE),
  COALESCE(bar_snacks_available, FALSE),
  bar_opening_hours
FROM onboarding_food_beverage_details 
WHERE bar_name IS NOT NULL AND bar_name != '';

-- Update the total_restaurants count based on migrated data
UPDATE onboarding_food_beverage_details fbd
SET total_restaurants = (
  SELECT COUNT(*) 
  FROM onboarding_fb_restaurants r 
  WHERE r.hotel_id = fbd.hotel_id
);

-- Map service_times to room_service_hours and set room_service_available
UPDATE onboarding_food_beverage_details 
SET room_service_hours = service_times,
    room_service_available = CASE WHEN service_times IS NOT NULL AND service_times != '' THEN TRUE ELSE FALSE END;

-- Drop old columns that are no longer needed
ALTER TABLE onboarding_food_beverage_details 
DROP COLUMN restaurant_name,
DROP COLUMN restaurant_cuisine,
DROP COLUMN restaurant_seats,
DROP COLUMN restaurant_opening_hours,
DROP COLUMN restaurant_exclusive,
DROP COLUMN restaurant_price_minimum,
DROP COLUMN bar_name,
DROP COLUMN bar_seats,
DROP COLUMN bar_exclusive,
DROP COLUMN bar_snacks_available,
DROP COLUMN bar_opening_hours,
DROP COLUMN service_times;

-- Make hotel_id unique if it's not already (since we added an auto-increment primary key)
ALTER TABLE onboarding_food_beverage_details 
ADD CONSTRAINT unique_hotel_id UNIQUE (hotel_id); 