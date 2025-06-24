-- Migration: Add MICE desk handling scope field to room operational handling
-- Date: 2024-12-05
-- Description: Adds field to track at what point groups are handled by MICE DESK

-- Add mice_desk_handling_scope column to onboarding_room_operational_handling
ALTER TABLE onboarding_room_operational_handling
ADD COLUMN IF NOT EXISTS mice_desk_handling_scope TEXT DEFAULT NULL AFTER handled_by_mice_desk;

-- Add comment for documentation
ALTER TABLE onboarding_room_operational_handling
MODIFY COLUMN mice_desk_handling_scope TEXT DEFAULT NULL 
COMMENT 'Describes at what point groups are handled by MICE DESK (e.g., from inquiry to contract, complete, etc.)'; 