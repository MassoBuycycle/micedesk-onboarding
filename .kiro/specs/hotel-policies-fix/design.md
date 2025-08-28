# Design Document

## Overview

The hotel policies feature has two main issues that need to be addressed:

1. **Database Table Name Mismatch**: The backend controller is using table names without the `onboarding_` prefix, but the actual database tables have this prefix.
2. **Missing Default Column Handling**: The controller tries to insert a `default` field that may not exist in the current table structure.

## Architecture

The fix involves updating the backend controller to:
- Use correct table names with `onboarding_` prefix
- Properly handle the `default` column in policy item details
- Ensure database queries match the actual schema

## Components and Interfaces

### Backend Controller Updates

**File**: `backend/src/controllers/informationPoliciesController.js`

**Changes Required**:
1. Update all SQL queries to use `onboarding_` prefixed table names:
   - `information_policies` → `onboarding_information_policies`
   - `information_policy_items` → `onboarding_information_policy_items`
   - `information_policy_item_details` → `onboarding_information_policy_item_details`

2. Add proper handling for the `default` column in policy item details

### Database Schema Verification

**Migration Required**: Ensure the `default` column exists in `onboarding_information_policy_item_details` table.

## Data Models

### Information Policy Structure
```javascript
{
  id: number,
  system_hotel_id: string,
  type: 'room_information' | 'service_information' | 'general_policies',
  items: [
    {
      id: number,
      title: string,
      is_condition: boolean,
      details: [
        {
          id: number,
          name: string,
          description: string,
          default: boolean  // This field needs proper handling
        }
      ]
    }
  ]
}
```

## Error Handling

1. **Database Connection Errors**: Proper transaction rollback and connection release
2. **Missing Table Errors**: Clear error messages if tables don't exist
3. **Column Mismatch Errors**: Handle cases where `default` column might not exist
4. **Validation Errors**: Ensure required fields are present before database operations

## Testing Strategy

1. **Unit Tests**: Test each controller method with correct table names
2. **Integration Tests**: Test full policy creation and retrieval flow
3. **Database Tests**: Verify queries work with actual database schema
4. **Frontend Tests**: Ensure UI properly displays saved policies

## Implementation Details

### SQL Query Updates

**Before**:
```sql
INSERT INTO information_policy_item_details 
(information_policy_item_id, name, description, `default`) 
VALUES (?, ?, ?, ?)
```

**After**:
```sql
INSERT INTO onboarding_information_policy_item_details 
(information_policy_item_id, name, description, `default`) 
VALUES (?, ?, ?, ?)
```

### Error Message Improvements

- Remove duplicate success/info messages
- Provide clear feedback when no policies exist
- Show specific error details for debugging

### Database Migration Check

Verify that the migration `20241207_add_default_to_policy_details.sql` has been applied to ensure the `default` column exists.