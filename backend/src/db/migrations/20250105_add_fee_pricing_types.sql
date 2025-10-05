-- Migration: Add pricing type fields for early check-in fee and dog fee
-- Date: 2025-01-05
-- Description: Adds columns to specify whether fees are fixed (Festpreis) or per hour (pro Stunde)

-- Add pricing type columns to onboarding_room_policies table (for room-level fees)
ALTER TABLE onboarding_room_policies
  ADD COLUMN early_check_in_fee_type ENUM('fixed', 'per_hour') DEFAULT 'fixed' COMMENT 'Pricing type: fixed (Festpreis) or per_hour (pro Stunde)';

-- Add pricing type columns to onboarding_room_pet_policies table (for room-level pet fees)
ALTER TABLE onboarding_room_pet_policies
  ADD COLUMN dog_fee_type ENUM('fixed', 'per_hour') DEFAULT 'fixed' COMMENT 'Pricing type: fixed (Festpreis) or per_hour (pro Stunde)';

-- Add pricing type columns to onboarding_hotels table (main hotel table with flattened fields)
ALTER TABLE onboarding_hotels
  ADD COLUMN early_check_in_fee_type ENUM('fixed', 'per_hour') DEFAULT 'fixed' COMMENT 'Pricing type: fixed (Festpreis) or per_hour (pro Stunde)' AFTER early_check_in_fee,
  ADD COLUMN pet_fee_type ENUM('fixed', 'per_hour') DEFAULT 'fixed' COMMENT 'Pricing type: fixed (Festpreis) or per_hour (pro Stunde)' AFTER pet_fee;

