-- Add event_end_date to campaigns table for event-based credit unlocking
ALTER TABLE campaigns
ADD COLUMN IF NOT EXISTS event_end_date TIMESTAMP;

COMMENT ON COLUMN campaigns.event_end_date IS 'Date when the event ends - used to unlock credits for event_based unlock type';
