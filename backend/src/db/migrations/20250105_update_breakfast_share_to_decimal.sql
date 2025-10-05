-- Migration: Update breakfast_share from BOOLEAN to DECIMAL
-- This allows storing the actual breakfast share amount instead of just a boolean flag
-- Date: 2025-01-05

ALTER TABLE onboarding_room_operational_handling
MODIFY COLUMN breakfast_share DECIMAL(10,2) DEFAULT NULL
COMMENT 'Breakfast share amount in the rate';

