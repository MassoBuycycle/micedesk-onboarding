-- Main F&B details table (updated to match new frontend structure)
CREATE TABLE IF NOT EXISTS onboarding_food_beverage_details (
  id INT AUTO_INCREMENT PRIMARY KEY,
  hotel_id INT UNIQUE NOT NULL,
  fnb_contact_name VARCHAR(255),
  fnb_contact_position VARCHAR(255),
  fnb_contact_phone VARCHAR(50),
  fnb_contact_email VARCHAR(255),
  total_restaurants INT DEFAULT 0,
  room_service_available BOOLEAN DEFAULT FALSE,
  room_service_hours VARCHAR(255),
  breakfast_restaurant_name VARCHAR(255),
  breakfast_hours VARCHAR(255),
  breakfast_cost_per_person DECIMAL(10,2),
  breakfast_cost_per_child DECIMAL(10,2),
  breakfast_child_pricing_tiers TEXT,
  breakfast_room_used_for_events BOOLEAN DEFAULT FALSE,
  staff_planning_lead_time VARCHAR(255),
  special_diet_allergy_deadline VARCHAR(255),
  conference_packages_offered TEXT,
  additional_packages_bookable BOOLEAN DEFAULT FALSE,
  existing_packages_customizable BOOLEAN DEFAULT FALSE,
  coffee_break_inclusions TEXT,
  standard_lunch_offerings TEXT,
  buffet_minimum_persons INT,
  additional_packages_available TEXT,
  functions_created_by VARCHAR(255),
  functions_completion_deadline VARCHAR(255),
  departments_requiring_functions VARCHAR(255),
  function_meeting_schedule VARCHAR(255),
  function_meeting_participants VARCHAR(255),
  mice_desk_involvement TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_onboarding_food_beverage_details_hotel FOREIGN KEY (hotel_id) REFERENCES onboarding_hotels(id) ON DELETE CASCADE
);

-- Restaurants table (multiple restaurants per hotel)
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

-- Bars table (multiple bars per hotel)
CREATE TABLE IF NOT EXISTS onboarding_fb_bars (
  id INT AUTO_INCREMENT PRIMARY KEY,
  hotel_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  seats_indoor INT DEFAULT 0,
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