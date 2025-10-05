# Schema Cleanup Notes

## Summary
This document outlines the discrepancies found between the production database schema and the codebase, and tracks the cleanup actions needed.

## Production vs Code Schema Comparison

### Tables that exist in CODE but NOT in PRODUCTION

1. **Event Tables** (lines 715-865 in `backend/src/db/onboarding_full_schema.sql`)
   - `onboarding_event_booking`
   - `onboarding_event_financials`
   - `onboarding_event_operations`
   - `onboarding_event_technical`
   
   **Production has:** Single consolidated `onboarding_event_details` table
   
   **Action:** Remove these extra table definitions from schema. These appear to be legacy tables that were consolidated.

2. **F&B Contacts Table**
   - `fb_contacts` (referenced in `backend/src/controllers/fbController.js`)
   
   **Production has:** Contact fields are part of `onboarding_food_beverage_details` table (fnb_contact_name, fnb_contact_position, fnb_contact_phone, fnb_contact_email)
   
   **Action:** Update `fbController.js` to use the food_beverage_details table or remove the controller if unused.

### Field Inconsistencies

#### Hotels Table (`onboarding_hotels`)

1. **Hotel ID field naming**
   - **Code schema (line 130):** Has both `hotel_id VARCHAR(50) UNIQUE` AND `system_hotel_id VARCHAR(50) UNIQUE`
   - **Production:** Only has `system_hotel_id VARCHAR(50)` with a UNIQUE constraint named `hotel_id`
   - **Action:** Remove the `hotel_id` field from schema, only keep `system_hotel_id`

2. **Opening/Renovation date fields**
   - **Code schema (lines 156-157):** Has both `opening_date INT, latest_renovation_date INT` AND `opening_year INT, latest_renovation_year INT`
   - **Production:** Only has `opening_year INT, latest_renovation_year INT`
   - **Action:** Remove `opening_date` and `latest_renovation_date` fields
   - **Note:** hotelController.js has logic for both field names (lines 6, 14, 147, 248) - keep the `opening_year` logic

3. **Fee type fields**
   - **Code schema (lines 189, 199):** Has `early_check_in_fee_type ENUM('fixed', 'per_hour')` and `pet_fee_type ENUM('fixed', 'per_hour')`
   - **Production:** Does NOT have these fields
   - **Action:** These fields are in migration file `20250105_add_fee_pricing_types.sql` but haven't been run on production. Either:
     - Remove from code if not needed, OR
     - Run the migration on production

#### Room Policies Table (`onboarding_room_policies`)

- **Code schema (line 249):** Has `early_check_in_fee_type ENUM('fixed', 'per_hour')`
- **Production:** Does NOT have this field
- **Action:** Same as hotels table - remove or run migration

#### Room Pet Policies Table (`onboarding_room_pet_policies`)

- **Code schema (line 278):** Has `dog_fee_type ENUM('fixed', 'per_hour')`
- **Production:** Does NOT have this field
- **Action:** Same as above

### Event Equipment Table Structure

- **Code schema (line 828):** Uses `equipment_id INT NOT NULL` as foreign key to `onboarding_equipment_types(id)`
- **Production:** Uses `equipment_type VARCHAR(100) NOT NULL` as direct string value (part of composite primary key)
- **Action:** Update schema to match production structure
- **Note:** Production has BOTH tables:
  - `onboarding_event_equipment` (equipment_type VARCHAR)
  - `onboarding_event_av_equipment` (equipment_name VARCHAR, quantity, price_per_unit)

### Frontend Schema

- **File:** `frontend/full_schema.sql`
- **Issue:** Uses non-prefixed table names (`hotels`, `rooms`, `events` instead of `onboarding_*`) and has completely different structure
- **Action:** Either remove this file or update it to match production schema

## Code References That Need Updates

### Controllers

1. **fbController.js** - Uses non-existent `fb_contacts` table (lines 39, 47, 77, 102)
2. **hotelController.js** - Has logic for both `opening_date` and `opening_year` (lines 6, 14)
3. **eventEquipmentController.js** - May need update if event_equipment structure changes
4. **eventAvEquipmentController.js** - References `equipment_id` which may need review

### Config

**backend/src/db/config.js** - `TABLES_TO_PREFIX` list includes:
- `event_booking`, `event_financials`, `event_operations`, `event_technical`, `event_contracting`, `event_handling` (don't exist in production)
- Missing: `fb_restaurants`, `fb_bars`, `contract_details`, and other production tables

## Actions Checklist

- [ ] Remove extra event tables from `backend/src/db/onboarding_full_schema.sql`
- [ ] Remove `hotel_id`, `opening_date`, `latest_renovation_date` fields from hotels table in schema
- [ ] Remove or document fee_type fields (pending migration decision)
- [ ] Fix event_equipment table structure to use equipment_type VARCHAR
- [ ] Update TABLES_TO_PREFIX in config.js to match production tables exactly
- [ ] Fix or remove fbController.js fb_contacts references
- [ ] Remove or update frontend/full_schema.sql
- [ ] Update hotelController.js to only use opening_year/latest_renovation_year

## Migration Files Status

The following migration files exist but may not have been run on production:
- `backend/src/db/migrations/20250105_add_fee_pricing_types.sql` - Adds fee_type columns
- `backend/src/db/migrations/20250105_add_billing_email.sql` - Adds billing_email (already in production)
- `backend/src/db/migrations/20250105_add_distance_notes.sql` - Adds note fields for distances (already in production)

## Notes

- The code uses automatic table prefixing via `backend/src/db/config.js`
- Controllers use table names without `onboarding_` prefix, which get automatically prefixed at runtime
- Some lookup tables (`payment_methods`, `standard_features`, `equipment_types`) are commented out from auto-prefixing and need manual prefixing in controllers

