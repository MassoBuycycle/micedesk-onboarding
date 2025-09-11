-- Migration: Add missing columns to hotels table (fax, external_billing_id, airport_note)
-- Safe to run once in production (no IF NOT EXISTS used to keep it simple)
-- Ensure you only run this migration a single time.

ALTER TABLE hotels
  ADD COLUMN fax VARCHAR(50) NULL AFTER phone,
  ADD COLUMN external_billing_id VARCHAR(100) NULL AFTER billing_address_vat,
  ADD COLUMN airport_note TEXT NULL AFTER distance_to_airport_km;

