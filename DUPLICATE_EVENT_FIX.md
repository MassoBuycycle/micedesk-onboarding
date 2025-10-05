# Duplicate Event Creation Fix

## Problem Description

Duplicate `onboarding_events` entries were being created with different event_ids in the same second, which cascaded to create duplicate rooms, event_spaces, and equipment entries.

### Root Causes Identified

1. **No duplicate prevention in backend** - The `createEvent` controller always created a new event without checking for recent duplicates
2. **No submission protection in frontend** - Users could double-click submit buttons, sending multiple requests
3. **No database constraints** - The table had no unique constraints to prevent duplicate insertions
4. **No performance index** - Queries to check for duplicates would be slow without proper indexing

## Solution Implemented

### 1. Backend Duplicate Detection ✅

**File:** `backend/src/controllers/eventMainController.js`

Added duplicate detection logic that:
- Checks for events with the same `hotel_id` created within the last 5 seconds
- Returns a 409 Conflict status if a duplicate is detected
- Includes the existing event ID in the error response
- Uses a transaction to ensure data consistency

```javascript
// Check for recent duplicate events (within last 5 seconds)
const [recentEvents] = await connection.query(
    `SELECT id, created_at FROM events 
     WHERE hotel_id = ? 
     AND created_at >= DATE_SUB(NOW(), INTERVAL 5 SECOND)
     ORDER BY created_at DESC LIMIT 1`,
    [eventsMainData.hotel_id]
);

if (recentEvents.length > 0) {
    await connection.rollback();
    const existingEventId = recentEvents[0].id;
    return res.status(409).json({ 
        error: 'An event for this hotel was just created...',
        existingEventId: existingEventId,
        code: 'DUPLICATE_EVENT_DETECTED'
    });
}
```

### 2. Frontend Loading State & Button Disabling ✅

**File:** `frontend/src/components/forms/EventInfoForm.tsx`

Added:
- `isSubmitting` state to track submission status
- Button disabled during submission
- Loading indicator UI
- Duplicate error handling with user-friendly message

```typescript
const [isSubmitting, setIsSubmitting] = useState(false);

// In submit function:
if (isSubmitting) {
    toast.warning("Please wait, your request is being processed...");
    return;
}
```

### 3. Error Recovery in Form State Hook ✅

**File:** `frontend/src/hooks/useHotelFormState.ts`

Added graceful handling of duplicate errors:
- Catches `DUPLICATE_EVENT_DETECTED` errors
- Uses the existing event ID from the error response
- Continues the workflow with the existing event
- Shows a warning toast instead of failing

### 4. Database Performance Index ✅

**Files:**
- `backend/src/db/migrations/20250105_add_event_duplicate_check_index.sql`
- `backend/src/db/onboarding_full_schema.sql`

Added composite index:
```sql
ALTER TABLE onboarding_events 
ADD INDEX idx_hotel_created (hotel_id, created_at);
```

This index optimizes the duplicate detection query from O(n) to O(log n).

## Deployment Instructions

### 1. Run the Database Migration

```bash
cd backend/src/db/migrations
mysql -u [username] -p [database_name] < 20250105_add_event_duplicate_check_index.sql
```

Or use your preferred migration tool.

### 2. Deploy Backend Changes

The backend changes are backward compatible - they only add additional validation.

### 3. Deploy Frontend Changes

The frontend changes are also backward compatible - they add loading states without breaking existing functionality.

## Cleaning Up Existing Duplicates

To identify and clean up existing duplicate events, use this SQL query:

```sql
-- Find duplicate events (same hotel_id, created within 1 second of each other)
SELECT 
    e1.id as event_id_1,
    e2.id as event_id_2,
    e1.hotel_id,
    e1.created_at as created_at_1,
    e2.created_at as created_at_2,
    TIMESTAMPDIFF(SECOND, e1.created_at, e2.created_at) as seconds_apart
FROM onboarding_events e1
JOIN onboarding_events e2 ON e1.hotel_id = e2.hotel_id 
    AND e1.id < e2.id
    AND TIMESTAMPDIFF(SECOND, e1.created_at, e2.created_at) <= 1
ORDER BY e1.hotel_id, e1.created_at;
```

### Manual Cleanup Process

⚠️ **IMPORTANT:** Back up your database before running these commands!

```sql
-- Step 1: Identify the duplicate event IDs to delete
-- Review the output carefully and decide which event to keep (usually the first one)

-- Step 2: Delete the duplicate event (cascade will handle related records)
-- Replace [duplicate_event_id] with the actual ID
DELETE FROM onboarding_events WHERE id = [duplicate_event_id];
```

### Automated Cleanup Script (Use with Caution)

```sql
-- This will automatically delete the LATER event in each duplicate pair
-- within 1 second of the original

START TRANSACTION;

DELETE e2 FROM onboarding_events e1
JOIN onboarding_events e2 ON e1.hotel_id = e2.hotel_id 
    AND e1.id < e2.id
    AND TIMESTAMPDIFF(SECOND, e1.created_at, e2.created_at) <= 1;

-- Review the number of rows affected before committing!
-- COMMIT;  -- Uncomment to commit
-- ROLLBACK;  -- Or rollback if something looks wrong
```

## Verification

After deployment, verify the fix works by:

1. **Testing duplicate prevention:**
   - Try to submit an event form twice rapidly
   - Verify the second submission shows a warning message
   - Confirm only one event was created

2. **Testing button disabling:**
   - Click submit button once
   - Verify button is disabled during submission
   - Verify button shows "Creating..." text

3. **Testing performance:**
   - Check query performance with `EXPLAIN` on the duplicate check query
   - Verify the index is being used

```sql
EXPLAIN SELECT id, created_at FROM onboarding_events 
WHERE hotel_id = 1 
AND created_at >= DATE_SUB(NOW(), INTERVAL 5 SECOND);
-- Should show "Using index" in Extra column
```

## Time Window Configuration

The current duplicate detection window is **5 seconds**. This can be adjusted in `eventMainController.js`:

```javascript
// Change INTERVAL 5 SECOND to your desired value
AND created_at >= DATE_SUB(NOW(), INTERVAL 5 SECOND)
```

Recommended values:
- **5 seconds** (current) - Good for preventing accidental double-clicks
- **10 seconds** - More conservative, prevents network retries
- **2-3 seconds** - Minimal protection, allows rapid successive event creation

## Monitoring

Add monitoring for:
- Number of 409 responses from `/api/events` endpoint
- Frequency of duplicate detection
- Any increase might indicate a UI issue or bot activity

## Related Issues

This fix also prevents duplicate creation of:
- Event spaces (via CASCADE)
- Event equipment (via CASCADE)
- Event details (via CASCADE)
- AV equipment (via CASCADE)

## Testing Checklist

- [ ] Backend returns 409 for duplicate submissions
- [ ] Frontend shows warning for duplicate attempts
- [ ] Submit button disables during submission
- [ ] Loading state displays correctly
- [ ] Existing event ID is used on duplicate detection
- [ ] Database index is created successfully
- [ ] Query performance is acceptable
- [ ] Existing duplicates are cleaned up (if any)

## Support

If you encounter issues with this fix, check:
1. Database migration ran successfully
2. Index was created: `SHOW INDEX FROM onboarding_events;`
3. Backend logs for duplicate detection messages
4. Frontend console for error responses
5. Network tab for 409 status codes

## Future Enhancements

Consider adding:
1. **Idempotency keys** - For more robust duplicate prevention across requests
2. **Request deduplication** - At the API gateway level
3. **More granular duplicate detection** - Check contact info similarity, not just hotel_id
4. **Duplicate monitoring dashboard** - Track prevented duplicates over time

