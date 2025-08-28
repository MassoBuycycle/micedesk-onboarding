-- Migration to create approval system tables with correct prefix
-- This fixes the issue where approval system tables were created without the onboarding_ prefix

-- Create pending changes table to track edits needing approval
CREATE TABLE IF NOT EXISTS onboarding_pending_changes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  entry_id INT NOT NULL,
  entry_type ENUM('hotel', 'room', 'event', 'room_operations', 'room_space', 'event_space', 'food_beverage') NOT NULL DEFAULT 'hotel',
  user_id INT NOT NULL,
  change_data JSON NOT NULL,
  original_data JSON NOT NULL,
  status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  reviewed_by INT NULL,
  review_notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES onboarding_users(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewed_by) REFERENCES onboarding_users(id) ON DELETE SET NULL
);

-- Create entry assignments table
CREATE TABLE IF NOT EXISTS onboarding_entry_assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  entry_id INT NOT NULL,
  entry_type ENUM('hotel', 'room', 'event', 'room_operations', 'room_space', 'event_space', 'food_beverage') NOT NULL DEFAULT 'hotel',
  user_id INT NOT NULL,
  assigned_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES onboarding_users(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_by) REFERENCES onboarding_users(id) ON DELETE CASCADE,
  UNIQUE KEY (entry_id, entry_type, user_id)
);

-- Create indexes for better performance
CREATE INDEX idx_pending_changes_status ON onboarding_pending_changes(status);
CREATE INDEX idx_pending_changes_entry_type ON onboarding_pending_changes(entry_type);
CREATE INDEX idx_pending_changes_user_id ON onboarding_pending_changes(user_id);
CREATE INDEX idx_entry_assignments_entry ON onboarding_entry_assignments(entry_id, entry_type);
CREATE INDEX idx_entry_assignments_user ON onboarding_entry_assignments(user_id); 