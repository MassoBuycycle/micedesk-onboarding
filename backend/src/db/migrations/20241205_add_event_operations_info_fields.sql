-- Migration: Add info fields for minimum spent and exclusive clients
-- Date: 2024-12-05
-- Description: Adds text fields that appear when has_minimum_spent or hotel_exclusive_clients are true

-- Add minimum_spent_info column to event_operations table
ALTER TABLE event_operations 
ADD COLUMN IF NOT EXISTS minimum_spent_info TEXT AFTER has_minimum_spent;

-- Add exclusive_clients_info column to event_operations table
ALTER TABLE event_operations 
ADD COLUMN IF NOT EXISTS exclusive_clients_info TEXT AFTER hotel_exclusive_clients;

-- Add the same columns to onboarding_event_operations table
ALTER TABLE onboarding_event_operations 
ADD COLUMN IF NOT EXISTS minimum_spent_info TEXT AFTER has_minimum_spent;

ALTER TABLE onboarding_event_operations 
ADD COLUMN IF NOT EXISTS exclusive_clients_info TEXT AFTER hotel_exclusive_clients;

-- Update table comments
ALTER TABLE event_operations 
COMMENT = 'Event operational handling including minimum spent and exclusive client details';

ALTER TABLE onboarding_event_operations 
COMMENT = 'Onboarding event operational handling including minimum spent and exclusive client details'; 