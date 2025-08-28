-- Migration to fix room duplication and file assignment issues
-- Date: 2024-12-07

-- Add unique constraint to prevent multiple rooms per hotel
ALTER TABLE onboarding_rooms ADD CONSTRAINT unique_hotel_room UNIQUE (hotel_id);

-- Add index to improve file assignment queries (without storage_path to avoid key length issues)
CREATE INDEX idx_files_entity_type_temp ON files (entity_type, is_temporary, entity_id);

-- Add constraint to ensure room categories belong to valid rooms
ALTER TABLE onboarding_room_category_infos 
ADD CONSTRAINT fk_room_category_room 
FOREIGN KEY (room_id) REFERENCES onboarding_rooms(id) ON DELETE CASCADE;

-- Add unique constraint to prevent duplicate category names within the same room
ALTER TABLE onboarding_room_category_infos 
ADD CONSTRAINT unique_room_category_name 
UNIQUE (room_id, category_name);

-- Add unique constraint to prevent duplicate space names within the same event
ALTER TABLE event_spaces 
ADD CONSTRAINT unique_event_space_name 
UNIQUE (event_id, name); 