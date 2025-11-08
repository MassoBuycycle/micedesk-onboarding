# Duplicate Event Creation Fix

## Problem
When creating an event through the onboarding wizard, duplicate events were being created in the database. This caused:
1. Two `event` requests appearing in the network tab
2. One succeeding, one failing with `DUPLICATE_EVENT_DETECTED` error
3. The `createdEventId` not being set properly
4. Event spaces form showing "NO eventID found" error

## Root Cause
The event creation was happening in **two places simultaneously**:

1. **EventInfoForm.tsx** - Was creating the event immediately to save equipment data
2. **useHotelFormState.ts** - Was also creating the event when moving to the next step

Both requests were fired almost simultaneously, triggering the backend's duplicate detection mechanism (5-second window check).

## Solution
**Removed event creation from EventInfoForm** and let `useHotelFormState` handle all event creation and related data persistence.

### Changes Made

#### 1. EventInfoForm.tsx
- **REMOVED**: Direct event creation via `apiCreateEvent()`
- **REMOVED**: Equipment saving via `saveEventEquipment()` 
- **REMOVED**: Unused helper functions (`buildEventPayload`, `saveEventEquipment`)
- **REMOVED**: Unused imports (`apiCreateEvent`, `upsertEquipment`, `mapEventFormToApi`)
- **NOW**: Simply validates data and passes it to `onNext()` callback
- **RESULT**: No duplicate requests, cleaner separation of concerns

#### 2. useHotelFormState.ts
- **NO CHANGES NEEDED** - Already had proper handling for:
  - Event creation
  - Equipment data persistence  
  - Duplicate detection (as a safety net)
  - All event-related data (booking, operations, financials, technical, contracting)

### How It Works Now

```
User fills EventInfoForm
    ↓
User clicks "Next"
    ↓
EventInfoForm validates data
    ↓
EventInfoForm calls onNext(fullPayload)
    ↓
useHotelFormState.handleNext() receives data
    ↓
useHotelFormState creates event (ONE request)
    ↓
useHotelFormState saves all related data (booking, equipment, etc.)
    ↓
useHotelFormState sets createdEventId
    ↓
User moves to EventSpacesForm
    ↓
EventSpacesForm has access to createdEventId ✅
```

## Benefits
1. ✅ **No more duplicate events** - Single point of event creation
2. ✅ **Proper eventId propagation** - createdEventId is set correctly
3. ✅ **Cleaner code** - Better separation of concerns
4. ✅ **Maintains functionality** - All data (equipment, booking, etc.) still saved
5. ✅ **Better error handling** - Centralized in useHotelFormState
6. ✅ **Duplicate detection still active** - Backend protection remains as safety net

## Backend Duplicate Detection
The backend's 5-second duplicate detection (in `eventMainController.js`) remains active as a safety measure:

```javascript
// Lines 189-208 in eventMainController.js
const [recentEvents] = await connection.query(
    `SELECT id, created_at FROM onboarding_events 
     WHERE hotel_id = ? 
     AND created_at >= DATE_SUB(NOW(), INTERVAL 5 SECOND)
     ORDER BY created_at DESC LIMIT 1`,
    [eventsMainData.hotel_id]
);

if (recentEvents.length > 0) {
    return res.status(409).json({ 
        error: 'An event for this hotel was just created...',
        existingEventId: existingEventId,
        code: 'DUPLICATE_EVENT_DETECTED'
    });
}
```

This protection is now a safety net rather than being triggered on every event creation.

## Testing Recommendations
1. Create a new event through the wizard
2. Verify only ONE event creation request in network tab
3. Verify event is created successfully
4. Verify equipment data is saved
5. Verify EventSpacesForm receives the eventId
6. Verify spaces can be created successfully
7. Try rapid double-clicks to verify duplicate protection still works

## Files Modified
- `frontend/src/components/forms/EventInfoForm.tsx`

## Date
November 8, 2025

