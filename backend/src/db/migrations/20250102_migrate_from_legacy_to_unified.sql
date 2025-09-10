-- Migration: Merge legacy event tables into onboarding_event_details and backfill new structures
-- Safe to run multiple times (idempotent inserts guarded by NOT EXISTS; updates are SET ... = COALESCE(...))

START TRANSACTION;

-- 1) Backfill unified event details from legacy per-section tables
--    Assumes onboarding_event_details table exists (see consolidated schema).

INSERT INTO onboarding_event_details (
  event_id,
  -- Booking
  has_options, allows_split_options, option_duration, allows_overbooking, rooms_only,
  last_minute_leadtime, contracted_companies, refused_requests, unwanted_marketing,
  requires_second_signature, exclusive_clients,
  -- Financials
  requires_deposit, deposit_rules, deposit_invoicer, has_info_invoice, payment_methods,
  invoice_handling, commission_rules, has_minimum_spent,
  -- Operations/contracting
  sold_with_rooms_only, last_minute_lead_time, sent_over_time_material, lunch_location,
  min_participants_package, coffee_break_location, advance_days_for_material,
  storage_free_of_charge, storage_pricing_info, room_drop_cost, hotel_exclusive_clients,
  exclusive_clients_info, deposit_needed_event, deposit_rules_event, deposit_invoice_creator,
  informational_invoice_created, payment_methods_events, final_invoice_handling_event,
  unwanted_marketing_tools, first_second_option, split_options, option_hold_duration,
  overbooking_policy, deposit_required, accepted_payment_methods, second_signature_required,
  has_overtime_material, min_participants, coffee_location, material_advance_days,
  room_drop_fee, has_storage, minimum_spent_info,
  -- Technical
  beamer_lumens, copy_cost, software_presentation, wifi_data_rate,
  has_ac_or_ventilation, has_blackout_curtains, is_soundproof, has_daylight,
  is_hybrid_meeting_possible, technical_support_available, technical_notes
)
SELECT e.id AS event_id,
  -- Booking (b)
  b.has_options, b.allows_split_options, b.option_duration, b.allows_overbooking, b.rooms_only,
  b.last_minute_leadtime, b.contracted_companies, b.refused_requests, b.unwanted_marketing,
  b.requires_second_signature, b.exclusive_clients,
  -- Financials (f)
  f.requires_deposit, f.deposit_rules, f.deposit_invoicer, f.has_info_invoice, f.payment_methods,
  f.invoice_handling, f.commission_rules, f.has_minimum_spent,
  -- Operations (o)
  o.sold_with_rooms_only, o.last_minute_lead_time, o.sent_over_time_material, o.lunch_location,
  o.min_participants_package, o.coffee_break_location, o.advance_days_for_material,
  o.storage_free_of_charge, o.storage_pricing_info, o.room_drop_cost, o.hotel_exclusive_clients,
  o.exclusive_clients_info, o.deposit_needed_event, o.deposit_rules_event, o.deposit_invoice_creator,
  o.informational_invoice_created, o.payment_methods_events, o.final_invoice_handling_event,
  o.unwanted_marketing_tools, o.first_second_option, o.split_options, o.option_hold_duration,
  o.overbooking_policy, o.deposit_required, o.accepted_payment_methods, o.second_signature_required,
  o.has_overtime_material, o.min_participants, o.coffee_location, o.material_advance_days,
  o.room_drop_fee, o.has_storage, o.minimum_spent_info,
  -- Technical (t)
  t.beamer_lumens, t.copy_cost, t.software_presentation, t.wifi_data_rate,
  t.has_ac_or_ventilation, t.has_blackout_curtains, t.is_soundproof, t.has_daylight,
  t.is_hybrid_meeting_possible, t.technical_support_available, t.technical_notes
FROM onboarding_events e
LEFT JOIN onboarding_event_booking b ON b.event_id = e.id
LEFT JOIN onboarding_event_financials f ON f.event_id = e.id
LEFT JOIN onboarding_event_operations o ON o.event_id = e.id
LEFT JOIN onboarding_event_technical t ON t.event_id = e.id
WHERE NOT EXISTS (
  SELECT 1 FROM onboarding_event_details d WHERE d.event_id = e.id
);

-- Optional: For events that already have event_details, update only missing (NULL) fields from legacy tables
UPDATE onboarding_event_details d
LEFT JOIN onboarding_event_booking b ON b.event_id = d.event_id
LEFT JOIN onboarding_event_financials f ON f.event_id = d.event_id
LEFT JOIN onboarding_event_operations o ON o.event_id = d.event_id
LEFT JOIN onboarding_event_technical t ON t.event_id = d.event_id
SET
  -- Booking
  d.has_options = COALESCE(d.has_options, b.has_options),
  d.allows_split_options = COALESCE(d.allows_split_options, b.allows_split_options),
  d.option_duration = COALESCE(d.option_duration, b.option_duration),
  d.allows_overbooking = COALESCE(d.allows_overbooking, b.allows_overbooking),
  d.rooms_only = COALESCE(d.rooms_only, b.rooms_only),
  d.last_minute_leadtime = COALESCE(d.last_minute_leadtime, b.last_minute_leadtime),
  d.contracted_companies = COALESCE(d.contracted_companies, b.contracted_companies),
  d.refused_requests = COALESCE(d.refused_requests, b.refused_requests),
  d.unwanted_marketing = COALESCE(d.unwanted_marketing, b.unwanted_marketing),
  d.requires_second_signature = COALESCE(d.requires_second_signature, b.requires_second_signature),
  d.exclusive_clients = COALESCE(d.exclusive_clients, b.exclusive_clients),
  -- Financials
  d.requires_deposit = COALESCE(d.requires_deposit, f.requires_deposit),
  d.deposit_rules = COALESCE(d.deposit_rules, f.deposit_rules),
  d.deposit_invoicer = COALESCE(d.deposit_invoicer, f.deposit_invoicer),
  d.has_info_invoice = COALESCE(d.has_info_invoice, f.has_info_invoice),
  d.payment_methods = COALESCE(d.payment_methods, f.payment_methods),
  d.invoice_handling = COALESCE(d.invoice_handling, f.invoice_handling),
  d.commission_rules = COALESCE(d.commission_rules, f.commission_rules),
  d.has_minimum_spent = COALESCE(d.has_minimum_spent, f.has_minimum_spent),
  -- Operations / contracting
  d.sold_with_rooms_only = COALESCE(d.sold_with_rooms_only, o.sold_with_rooms_only),
  d.last_minute_lead_time = COALESCE(d.last_minute_lead_time, o.last_minute_lead_time),
  d.sent_over_time_material = COALESCE(d.sent_over_time_material, o.sent_over_time_material),
  d.lunch_location = COALESCE(d.lunch_location, o.lunch_location),
  d.min_participants_package = COALESCE(d.min_participants_package, o.min_participants_package),
  d.coffee_break_location = COALESCE(d.coffee_break_location, o.coffee_break_location),
  d.advance_days_for_material = COALESCE(d.advance_days_for_material, o.advance_days_for_material),
  d.storage_free_of_charge = COALESCE(d.storage_free_of_charge, o.storage_free_of_charge),
  d.storage_pricing_info = COALESCE(d.storage_pricing_info, o.storage_pricing_info),
  d.room_drop_cost = COALESCE(d.room_drop_cost, o.room_drop_cost),
  d.hotel_exclusive_clients = COALESCE(d.hotel_exclusive_clients, o.hotel_exclusive_clients),
  d.exclusive_clients_info = COALESCE(d.exclusive_clients_info, o.exclusive_clients_info),
  d.deposit_needed_event = COALESCE(d.deposit_needed_event, o.deposit_needed_event),
  d.deposit_rules_event = COALESCE(d.deposit_rules_event, o.deposit_rules_event),
  d.deposit_invoice_creator = COALESCE(d.deposit_invoice_creator, o.deposit_invoice_creator),
  d.informational_invoice_created = COALESCE(d.informational_invoice_created, o.informational_invoice_created),
  d.payment_methods_events = COALESCE(d.payment_methods_events, o.payment_methods_events),
  d.final_invoice_handling_event = COALESCE(d.final_invoice_handling_event, o.final_invoice_handling_event),
  d.unwanted_marketing_tools = COALESCE(d.unwanted_marketing_tools, o.unwanted_marketing_tools),
  d.first_second_option = COALESCE(d.first_second_option, o.first_second_option),
  d.split_options = COALESCE(d.split_options, o.split_options),
  d.option_hold_duration = COALESCE(d.option_hold_duration, o.option_hold_duration),
  d.overbooking_policy = COALESCE(d.overbooking_policy, o.overbooking_policy),
  d.deposit_required = COALESCE(d.deposit_required, o.deposit_required),
  d.accepted_payment_methods = COALESCE(d.accepted_payment_methods, o.accepted_payment_methods),
  d.second_signature_required = COALESCE(d.second_signature_required, o.second_signature_required),
  d.has_overtime_material = COALESCE(d.has_overtime_material, o.has_overtime_material),
  d.min_participants = COALESCE(d.min_participants, o.min_participants),
  d.coffee_location = COALESCE(d.coffee_location, o.coffee_location),
  d.material_advance_days = COALESCE(d.material_advance_days, o.material_advance_days),
  d.room_drop_fee = COALESCE(d.room_drop_fee, o.room_drop_fee),
  d.has_storage = COALESCE(d.has_storage, o.has_storage),
  d.minimum_spent_info = COALESCE(d.minimum_spent_info, o.minimum_spent_info),
  -- Technical
  d.beamer_lumens = COALESCE(d.beamer_lumens, t.beamer_lumens),
  d.copy_cost = COALESCE(d.copy_cost, t.copy_cost),
  d.software_presentation = COALESCE(d.software_presentation, t.software_presentation),
  d.wifi_data_rate = COALESCE(d.wifi_data_rate, t.wifi_data_rate),
  d.has_ac_or_ventilation = COALESCE(d.has_ac_or_ventilation, t.has_ac_or_ventilation),
  d.has_blackout_curtains = COALESCE(d.has_blackout_curtains, t.has_blackout_curtains),
  d.is_soundproof = COALESCE(d.is_soundproof, t.is_soundproof),
  d.has_daylight = COALESCE(d.has_daylight, t.has_daylight),
  d.is_hybrid_meeting_possible = COALESCE(d.is_hybrid_meeting_possible, t.is_hybrid_meeting_possible),
  d.technical_support_available = COALESCE(d.technical_support_available, t.technical_support_available),
  d.technical_notes = COALESCE(d.technical_notes, t.technical_notes);

-- 2) F&B extraction: move legacy single restaurant/bar fields into new per-outlet tables
--    (keeps existing onboarding_food_beverage_details record unchanged)

INSERT INTO onboarding_fb_restaurants (
  hotel_id, name, cuisine, seats_indoor, seats_outdoor, exclusive_booking, minimum_price, opening_hours
)
SELECT d.hotel_id,
       d.restaurant_name,
       d.restaurant_cuisine,
       COALESCE(d.restaurant_seats, 0),
       0,
       COALESCE(d.restaurant_exclusive, 0),
       COALESCE(d.restaurant_price_minimum, 0),
       d.restaurant_opening_hours
FROM onboarding_food_beverage_details d
WHERE d.restaurant_name IS NOT NULL AND d.restaurant_name <> ''
  AND NOT EXISTS (
    SELECT 1 FROM onboarding_fb_restaurants r WHERE r.hotel_id = d.hotel_id AND r.name = d.restaurant_name
  );

INSERT INTO onboarding_fb_bars (
  hotel_id, name, seats_indoor, seats_outdoor, exclusive_booking, opening_hours, snacks_available
)
SELECT d.hotel_id,
       d.bar_name,
       COALESCE(d.bar_seats, 0),
       0,
       COALESCE(d.bar_exclusive, 0),
       d.bar_opening_hours,
       COALESCE(d.bar_snacks_available, 0)
FROM onboarding_food_beverage_details d
WHERE d.bar_name IS NOT NULL AND d.bar_name <> ''
  AND NOT EXISTS (
    SELECT 1 FROM onboarding_fb_bars b WHERE b.hotel_id = d.hotel_id AND b.name = d.bar_name
  );

-- 3) Backfill flattened hotel contact/policy fields from onboarding_hotel_info into onboarding_hotels

UPDATE onboarding_hotels h
JOIN onboarding_hotel_info i ON i.hotel_id = h.id
SET
  h.contact_name = COALESCE(h.contact_name, i.contact_name),
  h.contact_position = COALESCE(h.contact_position, i.contact_position),
  h.contact_phone = COALESCE(h.contact_phone, i.contact_phone),
  h.contact_email = COALESCE(h.contact_email, i.contact_email),
  h.check_in_time = COALESCE(h.check_in_time, i.check_in_time),
  h.check_out_time = COALESCE(h.check_out_time, i.check_out_time),
  h.early_check_in_time_frame = COALESCE(h.early_check_in_time_frame, i.early_check_in_time_frame),
  h.early_check_in_fee = COALESCE(h.early_check_in_fee, i.early_check_in_fee),
  h.late_check_out_time = COALESCE(h.late_check_out_time, i.late_check_out_time),
  h.late_check_out_fee = COALESCE(h.late_check_out_fee, i.late_check_out_fee),
  h.reception_hours = COALESCE(h.reception_hours, i.reception_hours),
  h.single_rooms = COALESCE(h.single_rooms, i.single_rooms),
  h.double_rooms = COALESCE(h.double_rooms, i.double_rooms),
  h.connecting_rooms = COALESCE(h.connecting_rooms, i.connecting_rooms),
  h.accessible_rooms = COALESCE(h.accessible_rooms, i.accessible_rooms),
  h.pets_allowed = COALESCE(h.pets_allowed, i.pets_allowed),
  h.pet_fee = COALESCE(h.pet_fee, i.pet_fee),
  h.pet_inclusions = COALESCE(h.pet_inclusions, i.pet_inclusions);

COMMIT;

-- Optional cleanup: only run after verifying data
-- DROP TABLE IF EXISTS onboarding_event_booking;
-- DROP TABLE IF EXISTS onboarding_event_financials;
-- DROP TABLE IF EXISTS onboarding_event_operations;
-- DROP TABLE IF EXISTS onboarding_event_technical;
