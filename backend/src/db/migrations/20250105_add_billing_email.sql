-- Migration: Add billing_email field to hotels table
-- Date: 2025-01-05
-- Description: Adds billing_email column to the onboarding_hotels table for billing contact information

USE hotel_cms;

-- Add billing_email column to onboarding_hotels table
ALTER TABLE onboarding_hotels 
ADD COLUMN billing_email VARCHAR(255) NULL 
AFTER billing_address_vat;

-- Add index for billing_email for faster searches
CREATE INDEX idx_onboarding_hotels_billing_email ON onboarding_hotels(billing_email);

