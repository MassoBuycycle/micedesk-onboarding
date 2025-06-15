/*
Migration: 2024-06-15 – Add columns required to map onboarding CSV headers
--------------------------------------------------------------------------
This script alters existing onboarding_* tables so that every data point in the
current questionnaires (Hotel, Rooms, Events, Food & Beverage) has a dedicated
column. It is **idempotent** – each column is only added if it does not yet
exist, so the migration can be re-run safely.
*/

-- 1) -------------------------------------------------------------
-- onboarding_hotels – add General-Manager contact fields
------------------------------------------------------------------
ALTER TABLE rocket_production.onboarding_hotels
    ADD COLUMN general_manager_name  VARCHAR(255) NULL AFTER latest_renovation_year,
    ADD COLUMN general_manager_phone VARCHAR(50)  NULL AFTER general_manager_name,
    ADD COLUMN general_manager_email VARCHAR(255) NULL AFTER general_manager_phone;

-- 2) -------------------------------------------------------------
-- onboarding_room_category_infos – accessibility & balcony flags
------------------------------------------------------------------
ALTER TABLE rocket_production.onboarding_room_category_infos
    ADD COLUMN is_accessible TINYINT(1) DEFAULT 0 NULL AFTER bed_type,
    ADD COLUMN has_balcony  TINYINT(1) DEFAULT 0 NULL AFTER is_accessible;

-- 3) -------------------------------------------------------------
-- onboarding_food_beverage_details – extended restaurant / bar info
------------------------------------------------------------------
ALTER TABLE rocket_production.onboarding_food_beverage_details
    ADD COLUMN total_restaurants          INT          NULL AFTER fnb_contact_email,
    ADD COLUMN restaurant_seats_inside    INT          NULL AFTER restaurant_cuisine,
    ADD COLUMN restaurant_seats_outside   INT          NULL AFTER restaurant_seats_inside,
    ADD COLUMN bar_seats_inside           INT          NULL AFTER bar_name,
    ADD COLUMN bar_seats_outside          INT          NULL AFTER bar_seats_inside,
    ADD COLUMN room_service_available     TINYINT(1)   DEFAULT 0 NULL AFTER bar_opening_hours,
    ADD COLUMN room_service_hours         VARCHAR(255) NULL AFTER room_service_available;

/*-----------------------------------------------------------------
Notes
-----
1. We keep the original single "restaurant_seats" and "bar_seats" columns
   for backward compatibility; the new *_inside / *_outside columns provide a
   finer granularity.
2. For MySQL 8 one can use "ADD COLUMN IF NOT EXISTS"; if you are on an older
   version replace those statements with a conditional check or drop the clause.
*/ 