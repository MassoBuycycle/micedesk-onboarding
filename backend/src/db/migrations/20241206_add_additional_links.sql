-- Add additional_links field to onboarding_hotels table
-- This field stores JSON array of links with name and link properties

ALTER TABLE onboarding_hotels 
ADD COLUMN additional_links JSON DEFAULT NULL 
COMMENT 'JSON array of additional links with name and link properties';

-- Ensure external_billing_id field exists for storing Allinvos/Cisbox number
ALTER TABLE onboarding_hotels
ADD COLUMN IF NOT EXISTS external_billing_id VARCHAR(100) NULL;

-- Example structure:
-- [
--   {
--     "name": "Test Link",
--     "link": "https://example.com/test"
--   },
--   {
--     "name": "Documentation", 
--     "link": "https://docs.example.com"
--   }
-- ] 