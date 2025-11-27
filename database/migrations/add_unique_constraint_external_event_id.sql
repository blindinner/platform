-- Add unique constraint on external_event_id per organizer
-- This prevents duplicate external event IDs for the same organizer
-- which would break organization webhook routing

-- Drop the existing non-unique index
DROP INDEX IF EXISTS idx_campaigns_external_event;

-- Create a unique index instead
-- This ensures each organizer can only have ONE campaign per external_event_id
CREATE UNIQUE INDEX idx_campaigns_external_event_unique
ON campaigns(organizer_id, external_event_id)
WHERE external_event_id IS NOT NULL;

-- This allows:
-- ✅ User A: campaign with external_event_id = "summer-fest"
-- ✅ User B: campaign with external_event_id = "summer-fest" (different organizer)
-- ✅ User A: campaign with external_event_id = NULL (no external ID)
-- ✅ User A: another campaign with external_event_id = NULL (multiple nulls allowed)
-- ❌ User A: second campaign with external_event_id = "summer-fest" (BLOCKED - duplicate)

COMMENT ON INDEX idx_campaigns_external_event_unique IS
'Ensures each organizer can only map one campaign per external event/product ID';
