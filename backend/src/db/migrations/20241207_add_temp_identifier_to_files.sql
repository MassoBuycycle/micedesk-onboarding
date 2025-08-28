-- Add temp_identifier column to files table for better temporary file tracking
ALTER TABLE onboarding_files ADD COLUMN temp_identifier VARCHAR(50) NULL AFTER is_temporary;

-- Add index for better performance when querying temporary files
CREATE INDEX idx_files_temp_identifier ON onboarding_files(temp_identifier); 