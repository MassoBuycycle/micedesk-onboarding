-- Script to find and analyze duplicate events in the database
-- Run this to identify duplicate onboarding_events that need cleanup

-- =====================================================
-- 1. Find duplicate events created in the same second
-- =====================================================
SELECT 
    e1.id as older_event_id,
    e2.id as newer_event_id,
    e1.hotel_id,
    e1.contact_name,
    e1.created_at as older_created_at,
    e2.created_at as newer_created_at,
    TIMESTAMPDIFF(MICROSECOND, e1.created_at, e2.created_at) / 1000000.0 as seconds_apart,
    -- Check if they have related records
    (SELECT COUNT(*) FROM onboarding_event_spaces WHERE event_id = e1.id) as older_spaces_count,
    (SELECT COUNT(*) FROM onboarding_event_spaces WHERE event_id = e2.id) as newer_spaces_count,
    (SELECT COUNT(*) FROM onboarding_event_equipment WHERE event_id = e1.id) as older_equipment_count,
    (SELECT COUNT(*) FROM onboarding_event_equipment WHERE event_id = e2.id) as newer_equipment_count
FROM onboarding_events e1
JOIN onboarding_events e2 ON e1.hotel_id = e2.hotel_id 
    AND e1.id < e2.id
    AND TIMESTAMPDIFF(SECOND, e1.created_at, e2.created_at) <= 1
ORDER BY e1.hotel_id, e1.created_at;

-- =====================================================
-- 2. Count duplicates by hotel
-- =====================================================
SELECT 
    e1.hotel_id,
    h.name as hotel_name,
    COUNT(*) as duplicate_pairs
FROM onboarding_events e1
JOIN onboarding_events e2 ON e1.hotel_id = e2.hotel_id 
    AND e1.id < e2.id
    AND TIMESTAMPDIFF(SECOND, e1.created_at, e2.created_at) <= 1
LEFT JOIN onboarding_hotels h ON e1.hotel_id = h.id
GROUP BY e1.hotel_id, h.name
ORDER BY duplicate_pairs DESC;

-- =====================================================
-- 3. Detailed view of one duplicate set (change ID as needed)
-- =====================================================
-- Uncomment and set the event_id to analyze a specific duplicate
/*
SET @event_id_1 = 123;  -- Replace with actual ID
SET @event_id_2 = 124;  -- Replace with actual ID

SELECT 'Event 1' as event, e1.* FROM onboarding_events e1 WHERE e1.id = @event_id_1
UNION ALL
SELECT 'Event 2' as event, e2.* FROM onboarding_events e2 WHERE e2.id = @event_id_2;

SELECT 'Event 1 Spaces' as data_type, es.* FROM onboarding_event_spaces es WHERE es.event_id = @event_id_1
UNION ALL
SELECT 'Event 2 Spaces' as data_type, es.* FROM onboarding_event_spaces es WHERE es.event_id = @event_id_2;

SELECT 'Event 1 Equipment' as data_type, eq.* FROM onboarding_event_equipment eq WHERE eq.event_id = @event_id_1
UNION ALL
SELECT 'Event 2 Equipment' as data_type, eq.* FROM onboarding_event_equipment eq WHERE eq.event_id = @event_id_2;
*/

-- =====================================================
-- 4. Generate DELETE statements for newer duplicates
-- =====================================================
-- This generates the SQL commands to delete duplicate events
-- REVIEW CAREFULLY before executing!
SELECT 
    CONCAT('DELETE FROM onboarding_events WHERE id = ', e2.id, '; -- Hotel ID: ', e1.hotel_id, ', Created: ', e2.created_at) as delete_statement
FROM onboarding_events e1
JOIN onboarding_events e2 ON e1.hotel_id = e2.hotel_id 
    AND e1.id < e2.id
    AND TIMESTAMPDIFF(SECOND, e1.created_at, e2.created_at) <= 1
ORDER BY e1.hotel_id, e1.created_at;

-- =====================================================
-- IMPORTANT NOTES:
-- =====================================================
-- 1. Always backup your database before deleting records
-- 2. The CASCADE on foreign keys will automatically delete:
--    - event_spaces
--    - event_equipment
--    - event_details
--    - event_av_equipment
-- 3. Review each duplicate pair before deleting
-- 4. Consider if any duplicate has important data that should be merged first

