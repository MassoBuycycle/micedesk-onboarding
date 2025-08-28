-- Migration to fix room duplication and file assignment issues
-- Date: 2024-12-07

-- Add unique constraint to prevent multiple rooms per hotel
ALTER TABLE rooms ADD CONSTRAINT unique_hotel_room UNIQUE (hotel_id);

-- Add index to improve file assignment queries
CREATE INDEX idx_files_entity_type_temp ON files (entity_type, is_temporary, entity_id);

-- Add index for room category file assignments
CREATE INDEX idx_files_room_categories_temp ON files (entity_type, is_temporary, entity_id, storage_path);

-- Add constraint to ensure room categories belong to valid rooms
ALTER TABLE room_category_infos 
ADD CONSTRAINT fk_room_category_room 
FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE; 