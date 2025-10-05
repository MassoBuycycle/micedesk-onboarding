-- Migration: Add note columns for all distance fields
-- Date: 2025-01-05
-- Description: Add note fields for highway, fair, train station, and public transport distances

-- Add note columns for all distance fields
ALTER TABLE onboarding_hotels
  ADD COLUMN highway_note TEXT NULL AFTER distance_to_highway_km,
  ADD COLUMN fair_note TEXT NULL AFTER distance_to_fair_km,
  ADD COLUMN train_station_note TEXT NULL AFTER distance_to_train_station,
  ADD COLUMN public_transport_note TEXT NULL AFTER distance_to_public_transport;

