-- Add status column to users table if it doesn't exist already
ALTER TABLE users 
ADD COLUMN status ENUM('active', 'pending', 'inactive') NOT NULL DEFAULT 'pending'; 