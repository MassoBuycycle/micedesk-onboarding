CREATE TABLE IF NOT EXISTS file_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL,
  category VARCHAR(50) NOT NULL,
  allowed_extensions JSON NOT NULL,
  max_size INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_code_category (code, category)
);

-- Insert default file types
INSERT INTO file_types (name, code, category, allowed_extensions, max_size)
VALUES 
  ('Images', 'images', 'hotel', '["jpg", "jpeg", "png", "webp"]', 5242880),
  ('Documents', 'documents', 'hotel', '["pdf", "doc", "docx"]', 10485760),
  ('Terms of Service', 'tos', 'hotel', '["pdf"]', 5242880),
  ('Images', 'images', 'event', '["jpg", "jpeg", "png", "webp"]', 5242880),
  ('Floor Plans', 'floor_plans', 'event', '["pdf", "jpg", "jpeg", "png"]', 10485760),
  ('Menu', 'menu', 'fb', '["pdf", "jpg", "jpeg", "png"]', 5242880),
  ('Room Photos', 'photos', 'room', '["jpg", "jpeg", "png", "webp"]', 5242880)
ON DUPLICATE KEY UPDATE id = id; -- No-op to skip duplicates