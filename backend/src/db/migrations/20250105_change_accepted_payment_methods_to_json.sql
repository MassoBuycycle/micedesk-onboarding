-- Migration: Change accepted_payment_methods from TEXT to JSON
-- Date: 2025-01-05
-- Description: Update the onboarding_event_details table to store accepted_payment_methods as JSON array
--              This aligns with the hotel/rooms payment methods implementation

-- Step 1: Add new JSON column
ALTER TABLE onboarding_event_details 
ADD COLUMN accepted_payment_methods_json JSON AFTER accepted_payment_methods;

-- Step 2: Migrate existing data from TEXT to JSON
-- Convert comma-separated strings to JSON arrays
-- If the field is empty or NULL, set to empty array
UPDATE onboarding_event_details
SET accepted_payment_methods_json = CASE
  WHEN accepted_payment_methods IS NULL OR accepted_payment_methods = '' THEN JSON_ARRAY()
  ELSE JSON_ARRAY(accepted_payment_methods)
END;

-- Step 3: Drop the old TEXT column
ALTER TABLE onboarding_event_details 
DROP COLUMN accepted_payment_methods;

-- Step 4: Rename the new JSON column to the original name
ALTER TABLE onboarding_event_details 
CHANGE COLUMN accepted_payment_methods_json accepted_payment_methods JSON;

