-- Migration: Add Contract & Onboarding details
-- Date: 2024-12-05
-- Description: Adds table for contract and onboarding information

-- Create contract details table
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

-- Add index for faster lookups
CREATE INDEX idx_contract_details_hotel ON onboarding_contract_details(hotel_id); 