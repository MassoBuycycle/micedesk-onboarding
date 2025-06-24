-- Migration: Add parking remarks and group handling notes fields
-- Date: 2024-12-05
-- Description: Adds notes fields for parking remarks and group handling

-- Add parking_remarks column to onboarding_hotels table
ALTER TABLE onboarding_hotels
ADD COLUMN parking_remarks TEXT DEFAULT NULL AFTER parking_cost_per_day;

-- Add comment for documentation
ALTER TABLE onboarding_hotels
MODIFY COLUMN parking_remarks TEXT DEFAULT NULL 
COMMENT 'Additional remarks about parking (e.g., nearby bus parking not belonging to hotel)';

-- Add group_handling_notes column to onboarding_room_operational_handling
ALTER TABLE onboarding_room_operational_handling
ADD COLUMN group_handling_notes TEXT DEFAULT NULL AFTER group_rates;

-- Add comment for documentation
ALTER TABLE onboarding_room_operational_handling
MODIFY COLUMN group_handling_notes TEXT DEFAULT NULL 
COMMENT 'Additional notes about group handling and rates'; 