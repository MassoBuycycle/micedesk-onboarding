-- Add external hotel_id field to hotels table
-- This field stores the external hotel identifier (e.g. HB4I2, 57392, H5425)

ALTER TABLE hotels ADD COLUMN hotel_id VARCHAR(50) UNIQUE COMMENT 'External hotel ID (e.g. HB4I2, 57392, H5425)';

-- Add index for better performance
CREATE INDEX idx_hotels_hotel_id ON hotels(hotel_id);

-- Add columns for hotel main contact and room information that were previously missing but are used by backend controllers
-- Contact details
ALTER TABLE hotels
    ADD COLUMN contact_name VARCHAR(255),
    ADD COLUMN contact_position VARCHAR(255),
    ADD COLUMN contact_phone VARCHAR(50),
    ADD COLUMN contact_email VARCHAR(255);

-- Check-in / check-out details
ALTER TABLE hotels
    ADD COLUMN check_in_time TIME,
    ADD COLUMN check_out_time TIME,
    ADD COLUMN early_check_in_time_frame VARCHAR(50),
    ADD COLUMN early_check_in_fee DECIMAL(10,2) DEFAULT 0,
    ADD COLUMN late_check_out_time TIME,
    ADD COLUMN late_check_out_fee DECIMAL(10,2) DEFAULT 0,
    ADD COLUMN reception_hours VARCHAR(50);

-- Room counts
ALTER TABLE hotels
    ADD COLUMN single_rooms INT DEFAULT 0,
    ADD COLUMN double_rooms INT DEFAULT 0,
    ADD COLUMN connecting_rooms INT DEFAULT 0,
    ADD COLUMN accessible_rooms INT DEFAULT 0;

-- Pet policy
ALTER TABLE hotels
    ADD COLUMN pets_allowed BOOLEAN DEFAULT FALSE,
    ADD COLUMN pet_fee DECIMAL(10,2) DEFAULT 0,
    ADD COLUMN pet_inclusions TEXT; 