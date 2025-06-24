-- Migration: Add technical notes field to events
-- Date: 2024-12-05
-- Description: Adds technical_notes column to event_technical table for additional notes

-- Add technical_notes column to event_technical table
ALTER TABLE event_technical 
ADD COLUMN IF NOT EXISTS technical_notes TEXT AFTER technical_support_available;

-- Add technical_notes column to onboarding_event_technical table
ALTER TABLE onboarding_event_technical 
ADD COLUMN IF NOT EXISTS technical_notes TEXT AFTER technical_support_available;

-- Add comment to document the change
ALTER TABLE event_technical 
COMMENT = 'Event technical information including equipment details and notes';

ALTER TABLE onboarding_event_technical 
COMMENT = 'Onboarding event technical information including equipment details and notes'; 