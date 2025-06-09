-- Event operations table (comprehensive version with all fields from old and new schemas)
DROP TABLE IF EXISTS event_operations;

CREATE TABLE IF NOT EXISTS event_operations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  -- Fields from event_handling
  sold_with_rooms_only BOOLEAN DEFAULT FALSE,
  last_minute_lead_time VARCHAR(100),
  sent_over_time_material BOOLEAN DEFAULT FALSE,
  lunch_location TEXT,
  min_participants_package INT DEFAULT 0,
  coffee_break_location TEXT,
  advance_days_for_material INT DEFAULT 0,
  room_drop_cost DECIMAL(10, 2) DEFAULT 0,
  hotel_exclusive_clients BOOLEAN DEFAULT FALSE,
  minimum_spent BOOLEAN DEFAULT FALSE,
  storage_room BOOLEAN DEFAULT FALSE,
  deposit_needed_event BOOLEAN DEFAULT FALSE,
  deposit_rules_event TEXT,
  deposit_invoice_creator VARCHAR(255),
  informational_invoice_created BOOLEAN DEFAULT FALSE,
  payment_methods_events JSON,
  final_invoice_handling_event TEXT,
  
  -- Fields from event_contracting
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
  
  -- Adding equivalent fields from new schema with both naming conventions for compatibility
  has_overtime_material BOOLEAN DEFAULT FALSE,
  min_participants INT DEFAULT 0,
  coffee_location TEXT,
  material_advance_days INT DEFAULT 0,
  room_drop_fee DECIMAL(10, 2) DEFAULT 0,
  has_storage BOOLEAN DEFAULT FALSE,
  has_minimum_spent BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
); 