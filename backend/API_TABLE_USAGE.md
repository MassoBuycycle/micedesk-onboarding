# API Database Table Usage Documentation

This document provides a comprehensive overview of all database tables used by the Hotel Onboarding Tool API.

## Database Connection
- **Database**: `hotel_cms` 
- **Schema**: Uses non-prefixed table names (regular operational tables)
- **Note**: The `onboarding_` prefixed tables in `onboarding_full_schema.sql` appear to be for a separate onboarding workflow system

## Tables Used by API Endpoints

### 🏨 **Core Hotel Management**

#### `hotels` ⭐ **HEAVILY USED**
**Primary hotel information table**
- **Used by**: All hotel-related endpoints
- **Controllers**: `hotelController.js`, `userHotelController.js`, `hotelAggregateController.js`, `approvalController.js`, `eventMainController.js`, `roomController.js`, `fbController.js`, `fbDetailsController.js`, `roleController.js`
- **Operations**: SELECT, INSERT, UPDATE, DELETE
- **Key endpoints**:
  - `GET /api/hotels` - List all hotels
  - `GET /api/hotels/:id` - Get hotel details
  - `POST /api/hotels` - Create hotel
  - `PUT /api/hotels/:id` - Update hotel
  - `DELETE /api/hotels/:id` - Delete hotel

#### `food_beverage_details` 
**Food & beverage information per hotel**
- **Used by**: `fbDetailsController.js`, `hotelAggregateController.js`
- **Operations**: SELECT, INSERT, UPDATE, DELETE (via INSERT ON DUPLICATE KEY UPDATE)
- **Key endpoints**:
  - `GET /api/hotels/:hotelId/fb/details` - Get F&B details
  - `POST /api/hotels/:hotelId/fb/details` - Create/update F&B details
  - `DELETE /api/hotels/:hotelId/fb/details` - Delete F&B details

### 🛏️ **Room Management**

#### `rooms` ⭐ **HEAVILY USED**
**Main rooms table**
- **Used by**: `roomController.js`, `hotelAggregateController.js`, `approvalController.js`
- **Operations**: SELECT, INSERT, UPDATE
- **Key endpoints**:
  - `POST /api/rooms/main` - Create/update room configuration
  - `GET /api/hotels/:hotelId/aggregate` - Get hotel with room data

#### `room_contacts`
**Room contact information**
- **Used by**: `roomController.js` (via `upsertRelatedData`)
- **Operations**: SELECT, INSERT, UPDATE
- **Key endpoints**:
  - `POST /api/rooms/main` - Manages contact data as part of room config

#### `room_policies`
**Room check-in/out policies and payment methods**
- **Used by**: `roomController.js` (via `upsertRelatedData`)
- **Operations**: SELECT, INSERT, UPDATE
- **Key endpoints**:
  - `POST /api/rooms/main` - Manages policies as part of room config

#### `room_inventory`
**Room counts by type**
- **Used by**: `roomController.js` (via `upsertRelatedData`)
- **Operations**: SELECT, INSERT, UPDATE
- **Key endpoints**:
  - `POST /api/rooms/main` - Manages inventory as part of room config

#### `room_pet_policies`
**Pet policy information**
- **Used by**: `roomController.js` (via `upsertRelatedData`)
- **Operations**: SELECT, INSERT, UPDATE
- **Key endpoints**:
  - `POST /api/rooms/main` - Manages pet policies as part of room config

#### `room_category_infos`
**Room categories and details**
- **Used by**: `roomCategoryController.js`, `hotelAggregateController.js`
- **Operations**: SELECT, INSERT, UPDATE, DELETE
- **Key endpoints**:
  - `GET /api/room-types/:id/categories` - Get room categories
  - `POST /api/room-types/:id/categories` - Create category
  - `PUT /api/room-categories/:id` - Update category
  - `DELETE /api/room-categories/:id` - Delete category

#### `room_operational_handling`
**Room revenue management and operational policies**
- **Used by**: `roomController.js`, `hotelAggregateController.js`
- **Operations**: SELECT, INSERT, UPDATE
- **Key endpoints**:
  - `POST /api/rooms/:roomId/operational` - Create/update operational handling
  - `GET /api/rooms/:roomId/operational` - Get operational data

#### `room_types`
**Room type definitions**
- **Used by**: `roomCategoryController.js`
- **Operations**: SELECT
- **Key endpoints**:
  - `GET /api/room-types/:id` - Get room type details
  - Used in room category management

#### `room_standard_features`
**Standard amenities available in rooms**
- **Used by**: `roomInfoController.js`
- **Operations**: SELECT, UPDATE
- **Key endpoints**:
  - `GET /api/rooms/info` - Get room features
  - `PUT /api/rooms/info` - Update room info including features
  - `PUT /api/rooms/features` - Update standard features

### 🎪 **Event Management**

#### `events` ⭐ **HEAVILY USED**
**Main events table**
- **Used by**: `eventMainController.js`, `approvalController.js`, `hotelAggregateController.js`
- **Operations**: SELECT, INSERT, UPDATE
- **Key endpoints**:
  - `POST /api/events` - Create event
  - `PUT /api/events/:id` - Update event

#### `event_booking`
**Event booking policies and rules**
- **Used by**: `eventBookingController.js`, `eventMainController.js`
- **Operations**: SELECT, INSERT, UPDATE
- **Key endpoints**:
  - `GET /api/events/:eventId/booking` - Get booking info
  - `POST /api/events/:eventId/booking` - Create/update booking policies

#### `event_financials`
**Event financial policies and payment methods**
- **Used by**: `eventFinancialsController.js`, `eventMainController.js`
- **Operations**: SELECT, INSERT, UPDATE
- **Key endpoints**:
  - `GET /api/events/:eventId/financials` - Get financial policies
  - `POST /api/events/:eventId/financials` - Create/update financials

#### `event_operations`
**Event operational details and logistics**
- **Used by**: `eventOperationsController.js`, `eventMainController.js`
- **Operations**: SELECT, INSERT, UPDATE
- **Key endpoints**:
  - `GET /api/events/:eventId/operations` - Get operations info
  - `POST /api/events/:eventId/operations` - Create/update operations

#### `event_spaces`
**Event venues and meeting rooms**
- **Used by**: `eventSpacesController.js`, `hotelAggregateController.js`, `eventMainController.js`
- **Operations**: SELECT, INSERT, UPDATE, DELETE
- **Key endpoints**:
  - `GET /api/events/:eventId/spaces` - List event spaces
  - `POST /api/events/:eventId/spaces` - Create space
  - `PUT /api/event-spaces/:id` - Update space
  - `DELETE /api/event-spaces/:id` - Delete space

#### `event_technical`
**Technical requirements for events**
- **Used by**: `eventTechnicalController.js`
- **Operations**: SELECT, INSERT, UPDATE
- **Key endpoints**:
  - `GET /api/events/:eventId/technical` - Get technical requirements
  - `POST /api/events/:eventId/technical` - Create/update technical info

#### `event_equipment`
**Event equipment inventory and pricing**
- **Used by**: `eventEquipmentController.js`, `eventAvEquipmentController.js`
- **Operations**: SELECT, INSERT, DELETE
- **Key endpoints**:
  - `GET /api/events/:eventId/equipment` - List equipment
  - `POST /api/events/:eventId/equipment` - Add equipment
  - `DELETE /api/events/:eventId/equipment` - Remove equipment

#### `event_contracting`
**Event contracting and business rules**
- **Used by**: `eventContractingController.js`
- **Operations**: SELECT, INSERT, UPDATE
- **Key endpoints**:
  - `GET /api/events/:eventId/contracting` - Get contracting info
  - `POST /api/events/:eventId/contracting` - Create/update contracting

#### `event_handling`
**Event handling procedures**
- **Used by**: `eventHandlingController.js`
- **Operations**: SELECT, INSERT, UPDATE
- **Key endpoints**:
  - `GET /api/events/:eventId/handling` - Get handling procedures
  - `POST /api/events/:eventId/handling` - Create/update handling

#### `equipment_types`
**Equipment type lookup table**
- **Used by**: `eventAvEquipmentController.js`
- **Operations**: SELECT (via JOIN)
- **Key endpoints**:
  - Used in equipment queries for type information

### 👥 **User Management & Security**

#### `users` ⭐ **HEAVILY USED**
**User accounts and authentication**
- **Used by**: `userController.js`, `authController.js` (implied)
- **Operations**: SELECT, INSERT, UPDATE
- **Key endpoints**:
  - `POST /api/users` - Create user
  - `PUT /api/users/:id` - Update user
  - Used in authentication flows

#### `roles`
**User roles definition**
- **Used by**: `roleController.js`, `userController.js`
- **Operations**: SELECT
- **Key endpoints**:
  - Used in role assignment and permission checking

#### `user_roles`
**User-role assignments**
- **Used by**: `userController.js`, `roleController.js`
- **Operations**: SELECT, INSERT, DELETE
- **Key endpoints**:
  - `PUT /api/users/:id` - Updates user roles
  - Used in role management

#### `permissions`
**Permission definitions**
- **Used by**: `roleController.js`
- **Operations**: SELECT
- **Key endpoints**:
  - Used in role and permission management

#### `role_permissions`
**Role-permission mappings**
- **Used by**: `roleController.js`
- **Operations**: SELECT
- **Key endpoints**:
  - Used in permission checking and role management

### 📄 **Information Policies**

#### `information_policies`
**Hotel information policy categories**
- **Used by**: `informationPoliciesController.js`
- **Operations**: SELECT, INSERT, UPDATE
- **Key endpoints**:
  - `GET /api/hotels/:hotelId/information-policies` - Get policies
  - `POST /api/hotels/:hotelId/information-policies` - Create policy
  - `PUT /api/information-policies/:id` - Update policy

#### `information_policy_items`
**Individual policy items**
- **Used by**: `informationPoliciesController.js`
- **Operations**: SELECT, INSERT, UPDATE, DELETE
- **Key endpoints**:
  - Managed as part of information policy operations

#### `information_policy_item_details`
**Detailed policy item information**
- **Used by**: `informationPoliciesController.js`
- **Operations**: SELECT, INSERT, UPDATE, DELETE
- **Key endpoints**:
  - Managed as part of information policy operations

### 🍽️ **Food & Beverage (Alternative)**

#### `fb_contacts`
**F&B contact information (legacy/alternative table)**
- **Used by**: `fbController.js`
- **Operations**: INSERT, UPDATE (via INSERT ON DUPLICATE KEY UPDATE), SELECT
- **Key endpoints**:
  - `POST /api/hotels/:hotelId/fb/contact` - Create/update F&B contact

### 🔧 **Utility & Lookup Tables**

#### `payment_methods`
**Accepted payment methods**
- **Used by**: `roomInfoController.js`, `hotelController.js`
- **Operations**: SELECT, DELETE, INSERT
- **Key endpoints**:
  - `GET /api/rooms/info` - Gets payment methods
  - `PUT /api/rooms/info` - Updates payment methods
  - `POST /api/hotels` - Creates default payment methods

#### `standard_features`
**Standard hotel features lookup**
- **Used by**: `roomInfoController.js`, `hotelController.js`
- **Operations**: SELECT, DELETE, INSERT
- **Key endpoints**:
  - `GET /api/rooms/info` - Gets standard features
  - `PUT /api/rooms/info` - Updates standard features
  - `POST /api/hotels` - Creates default features

## 📊 **Table Usage Summary**

### ⭐ **Most Critical Tables** (Used across multiple controllers)
1. **`hotels`** - Core hotel data (7+ controllers)
2. **`rooms`** - Room management (3+ controllers)
3. **`events`** - Event management (3+ controllers)
4. **`users`** - User management (2+ controllers)

### 📈 **High Usage Tables** (Complex operations)
- **`event_spaces`** - Full CRUD operations
- **`room_category_infos`** - Full CRUD operations
- **`food_beverage_details`** - Complex upsert operations

### 🔍 **Specialized Tables** (Single purpose)
- **`event_technical`** - Technical requirements only
- **`event_contracting`** - Contracting rules only
- **`room_contacts`** - Contact info only
- **`fb_contacts`** - Alternative F&B contacts

### 📋 **Lookup Tables** (Reference data)
- **`payment_methods`** - Payment options
- **`standard_features`** - Feature options
- **`equipment_types`** - Equipment reference
- **`roles`** - User roles
- **`permissions`** - System permissions

## ⚠️ **Important Notes**

1. **Schema Mismatch**: The API uses non-prefixed table names, while `onboarding_full_schema.sql` creates `onboarding_` prefixed tables
2. **Database**: All API operations target the `hotel_cms` database
3. **Transaction Usage**: Many controllers use database transactions for complex operations
4. **Upsert Patterns**: Several tables use `INSERT ... ON DUPLICATE KEY UPDATE` for data persistence
5. **JSON Fields**: Some tables store JSON data (e.g., `payment_methods` in various tables)

## 🚫 **Unused/Missing Tables**

The following tables from the schema are **NOT** currently used by the API:
- **`files`** / **`onboarding_files`** - File management
- **`file_types`** / **`onboarding_file_types`** - File type definitions
- **`pending_changes`** / **`onboarding_pending_changes`** - Approval workflow
- **`entry_assignments`** / **`onboarding_entry_assignments`** - Entry assignments
- **`hotel_secure_data`** / **`onboarding_hotel_secure_data`** - Encrypted credentials
- **`resource_permissions`** / **`onboarding_resource_permissions`** - Resource-level permissions

These tables may be for planned features or alternative workflows not yet implemented in the current API.

## 🗑️ **Database Cleanup Script**

Based on the actual database schema analysis, here are the tables that can be safely removed as they are **NOT used by the current API**:

```sql
-- ============================================================================
-- HOTEL CMS DATABASE CLEANUP SCRIPT
-- Removes tables that are not used by the current API implementation
-- ============================================================================

-- WARNING: This will permanently delete data. Make sure to backup first!
-- Run: mysqldump hotel_cms > hotel_cms_backup.sql

USE hotel_cms;

-- ============================================================================
-- STEP 1: Remove tables with no foreign key dependencies (safe to delete first)
-- ============================================================================

-- Remove restaurant and bar management tables (not used by API)
DROP TABLE IF EXISTS `bars`;
DROP TABLE IF EXISTS `restaurants`;

-- Remove old/duplicate standard room features (global template, not room-specific)
-- NOTE: Keep `room_standard_features` which is linked to specific rooms
DROP TABLE IF EXISTS `standard_room_features`;

-- ============================================================================
-- STEP 2: Remove workflow/approval system tables (not implemented in current API)
-- ============================================================================

-- Remove approval workflow tables (not used by current API)
DROP TABLE IF EXISTS `pending_changes`;
DROP TABLE IF EXISTS `entry_assignments`;

-- Remove resource-level permissions (not used by current API)
DROP TABLE IF EXISTS `resource_permissions`;

-- ============================================================================  
-- STEP 3: Remove user-hotel assignment tables (check if used by your user management)
-- ============================================================================

-- CAUTION: These might be used by user management - verify before uncommenting
-- DROP TABLE IF EXISTS `user_hotel_assignments`;
-- DROP TABLE IF EXISTS `user_all_hotels_access`;

-- ============================================================================
-- STEP 4: TABLES TO KEEP (DO NOT DELETE)
-- ============================================================================

-- ❌ DO NOT DELETE: `hotel_announcements` - Actively used for announcements system
-- ❌ DO NOT DELETE: `hotel_secure_data` - Actively used for secure credentials management

-- ============================================================================
-- VERIFICATION: Check what tables remain
-- ============================================================================

-- Run this to see remaining tables:
-- SHOW TABLES;

-- Check table sizes to see what was cleaned up:
-- SELECT 
--   TABLE_NAME, 
--   ROUND(((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024), 2) AS 'SIZE_MB'
-- FROM information_schema.TABLES 
-- WHERE TABLE_SCHEMA = 'hotel_cms'
-- ORDER BY (DATA_LENGTH + INDEX_LENGTH) DESC;
```

## 📋 **Tables Being Removed & Reasons**

### ✅ **Safe to Remove** (Not used by API):
1. **`bars`** - Bar management (not implemented in current API)
2. **`restaurants`** - Restaurant management (not implemented in current API)  
3. **`standard_room_features`** - Duplicate/old version of room features (use `room_standard_features` instead)
4. **`pending_changes`** - Approval workflow (not implemented)
5. **`entry_assignments`** - Entry assignment system (not implemented)
6. **`resource_permissions`** - Resource-level permissions (not used)

### ⚠️ **Verify Before Removing** (Commented out in script):
7. **`user_hotel_assignments`** - User-hotel assignments (may be used in user management)
8. **`user_all_hotels_access`** - All-hotels access (may be used in user management)

### ✅ **Tables to KEEP** (Actively used):
- **`hotel_announcements`** - ✅ **HEAVILY USED** - Announcement system with full frontend/backend implementation
- **`hotel_secure_data`** - ✅ **HEAVILY USED** - Secure credentials management with encryption

## 💾 **Before Running the Script**

1. **Backup your database first**:
   ```bash
   mysqldump hotel_cms > hotel_cms_backup_$(date +%Y%m%d).sql
   ```

2. **Test on a copy first** if possible

3. **Verify user management tables** - Check if `user_hotel_assignments` and `user_all_hotels_access` are used in your user management system before removing them

## 📊 **Expected Impact**

After cleanup, your database will contain **~35 tables** focused on:
- ✅ Core hotel management (`hotels`, `food_beverage_details`)
- ✅ Room management (8 tables: `rooms`, `room_*`)  
- ✅ Event management (6+ tables: `events`, `event_*`)
- ✅ User & security (5 tables: `users`, `roles`, etc.)
- ✅ Information policies (3 tables)
- ✅ File management (2 tables: `files`, `file_types`)
- ✅ **Announcements system** (`hotel_announcements`)
- ✅ **Secure data management** (`hotel_secure_data`)
- ✅ Utility tables (`payment_methods`, `standard_features`, `equipment_types`)

This removes approximately **5-6 unused tables** and will make your database cleaner and more focused on the actual API functionality. 