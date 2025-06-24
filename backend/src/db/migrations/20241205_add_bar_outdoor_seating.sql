-- Migration: Add outdoor seating to bars
-- Date: 2024-12-05
-- Description: Adds seats_outdoor column to onboarding_fb_bars table

-- Add seats_outdoor column to bars table
ALTER TABLE onboarding_fb_bars 
ADD COLUMN IF NOT EXISTS seats_outdoor INT DEFAULT 0 AFTER seats_indoor;

-- Create a comment to document the change
ALTER TABLE onboarding_fb_bars 
COMMENT = 'Stores bar information including indoor and outdoor seating capacity'; 