-- Add file types for room category images
INSERT INTO file_types (name, code, category, allowed_extensions, max_size)
VALUES 
  ('Room Category Images', 'images', 'room-category-images', '["jpg", "jpeg", "png", "webp"]', 5242880)
ON DUPLICATE KEY UPDATE id = id; -- No-op to skip duplicates 