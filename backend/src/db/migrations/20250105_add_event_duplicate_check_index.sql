-- Migration: Add index to optimize duplicate event detection
-- This index improves performance of queries checking for recently created events
-- by the same hotel_id

-- Add composite index on hotel_id and created_at for onboarding_events table
-- This supports the duplicate prevention query that checks:
-- WHERE hotel_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 5 SECOND)

ALTER TABLE onboarding_events 
ADD INDEX idx_hotel_created (hotel_id, created_at);

-- Note: This is a non-blocking operation on most MySQL versions (ALGORITHM=INPLACE)
-- The index will significantly speed up duplicate detection queries

