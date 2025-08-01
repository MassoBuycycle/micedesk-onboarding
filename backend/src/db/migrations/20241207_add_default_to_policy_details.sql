-- Add default field to onboarding_information_policy_item_details table
ALTER TABLE onboarding_information_policy_item_details 
ADD COLUMN `default` TINYINT NULL DEFAULT 0;

-- Add index for better performance
CREATE INDEX idx_policy_detail_default ON onboarding_information_policy_item_details (`default`); 