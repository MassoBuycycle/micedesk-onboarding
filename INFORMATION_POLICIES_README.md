# Information Policies Implementation

This document describes the implementation of the Information Policies system for the hotel onboarding tool.

## Overview

The Information Policies system allows hotels to define and manage three types of policies:
- **Room Information**: Details about room amenities, check-in requirements, etc.
- **Service Information**: Information about hotel services like breakfast, parking, etc.
- **General Policies**: Hotel-wide policies like cancellation, pet policies, etc.

## Database Schema

### Tables Created

1. **information_policies**
   - `id` (INT, AUTO_INCREMENT, PRIMARY KEY)
   - `hotel_id` (VARCHAR(50)) - External hotel identifier (e.g., HB4I2, 57392, H5425)
   - `type` (ENUM) - 'room_information', 'service_information', 'general_policies'
   - `created_at`, `updated_at` (TIMESTAMP)

2. **information_policy_items**
   - `id` (INT, AUTO_INCREMENT, PRIMARY KEY)
   - `information_policy_id` (INT, FOREIGN KEY)
   - `title` (VARCHAR(255))
   - `is_condition` (BOOLEAN) - Whether this item represents a condition/requirement
   - `created_at`, `updated_at` (TIMESTAMP)

3. **information_policy_item_details**
   - `id` (INT, AUTO_INCREMENT, PRIMARY KEY)
   - `information_policy_item_id` (INT, FOREIGN KEY)
   - `name` (VARCHAR(255))
   - `description` (TEXT)
   - `created_at`, `updated_at` (TIMESTAMP)

### Hotels Table Update

Added `hotel_id` field to the existing `hotels` table:
- `hotel_id` (VARCHAR(50), UNIQUE) - External hotel identifier

## Backend Implementation

### Files Created/Modified

1. **Database Schema**
   - `backend/src/db/information_policies_schema.sql` - Main schema definition
   - `backend/src/db/hotels_schema_update.sql` - Hotels table update
   - `setup_information_policies.sql` - Complete setup script with sample data

2. **Controller**
   - `backend/src/controllers/informationPoliciesController.js` - CRUD operations

3. **Routes**
   - `backend/src/routes/informationPoliciesRoutes.js` - API endpoints

4. **Server Configuration**
   - Updated `backend/src/server.ts` to include information policies routes
   - Updated `backend/src/controllers/hotelController.js` to handle hotel_id field

### API Endpoints

- `GET /api/information-policies/hotel/:hotelId` - Get all policies for a hotel
- `GET /api/information-policies/hotel/:hotelId/type/:type` - Get policies by type
- `POST /api/information-policies` - Create new policy
- `PUT /api/information-policies/:id` - Update existing policy
- `DELETE /api/information-policies/:id` - Delete policy

## Frontend Implementation

### Files Created/Modified

1. **Form Component**
   - `frontend/src/components/forms/InformationPoliciesForm.tsx` - Main form component

2. **API Client**
   - `frontend/src/apiClient/informationPoliciesApi.ts` - Frontend API functions

3. **Form Integration**
   - Updated `frontend/src/hooks/useHotelFormState.ts` - Added information policies step
   - Updated `frontend/src/components/hotel-form/FormStepContent.tsx` - Added form step
   - Updated `frontend/src/components/forms/HotelForm.tsx` - Added hotel_id field
   - Updated `frontend/src/components/forms/hotel-sections/BasicInfoSection.tsx` - Added hotel_id input

### Form Features

The Information Policies form includes:
- Hotel ID field (external identifier)
- Policy type selection (room_information, service_information, general_policies)
- Dynamic policy items with:
  - Title field
  - Condition toggle (is_condition)
  - Multiple details per item (name + description)
- Add/remove functionality for items and details
- Form validation using Zod schema

## Setup Instructions

### 1. Database Setup

Run the setup script to create tables and sample data:

```sql
-- Option 1: Run the complete setup script
mysql -u root -p hotel_cms < setup_information_policies.sql

-- Option 2: Run individual scripts
mysql -u root -p hotel_cms < backend/src/db/hotels_schema_update.sql
mysql -u root -p hotel_cms < backend/src/db/information_policies_schema.sql
```

### 2. Backend Setup

The backend routes are automatically included when the server starts. Make sure the server is running:

```bash
cd backend
npm start
```

### 3. Frontend Integration

The information policies form is integrated as the final step in the hotel onboarding process. It appears after the Food & Beverage step.

### 4. Testing

Use the provided test script to verify the API works:

```bash
node test_information_policies_api.js
```

## Usage Example

### Creating a Policy via API

```javascript
const policyData = {
  hotel_id: "HB4I2",
  type: "room_information",
  items: [
    {
      title: "Check-in Requirements",
      is_condition: true,
      details: [
        {
          name: "Valid ID Required",
          description: "Guests must present a valid government-issued photo ID at check-in"
        },
        {
          name: "Credit Card Authorization", 
          description: "A credit card is required for incidental charges"
        }
      ]
    }
  ]
};

const response = await fetch('/api/information-policies', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(policyData)
});
```

### Frontend Form Usage

The form is automatically included in the hotel onboarding flow. Users can:

1. Enter the external hotel ID
2. Select policy type
3. Add multiple policy items
4. For each item, add multiple details
5. Mark items as conditions if they represent requirements

## Data Flow

1. **Hotel Creation**: Hotel is created with external `hotel_id`
2. **Form Steps**: User progresses through hotel onboarding steps
3. **Information Policies**: Final step allows defining policies
4. **API Submission**: Policies are submitted to backend API
5. **Database Storage**: Data is stored in normalized table structure

## Key Features

- **Hierarchical Structure**: Policies → Items → Details
- **Flexible Types**: Three predefined policy types
- **Condition Marking**: Items can be marked as conditions/requirements
- **External Hotel ID**: Uses external identifier instead of database ID
- **Full CRUD**: Complete create, read, update, delete operations
- **Form Validation**: Client-side validation with Zod
- **Responsive UI**: Modern, user-friendly interface

## Notes

- The `hotel_id` field is the external identifier (e.g., HB4I2, 57392, H5425), not the database auto-increment ID
- Policies are linked to hotels via this external identifier
- The system supports multiple policies per hotel and type
- Foreign key constraints ensure data integrity
- Timestamps track creation and modification times

## Troubleshooting

### Common Issues

1. **Database Connection**: Ensure MySQL is running and credentials are correct
2. **Missing Tables**: Run the setup script to create required tables
3. **API Errors**: Check server logs for detailed error messages
4. **Form Validation**: Ensure all required fields are filled

### Testing

The test script (`test_information_policies_api.js`) provides comprehensive API testing including:
- Policy creation
- Retrieval by hotel and type
- Updates
- Deletion

Run this script to verify the implementation is working correctly. 