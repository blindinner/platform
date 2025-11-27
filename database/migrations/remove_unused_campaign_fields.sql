-- Remove fields no longer needed after product pivot
-- Campaign-specific webhooks removed in favor of org-level only
-- Email automation removed in favor of flexible distribution

-- STEP 1: Migrate existing data before applying constraints
-- Convert old 'webhook_campaign' integration type to 'webhook_organization'
UPDATE campaigns
SET integration_type = 'webhook_organization'
WHERE integration_type = 'webhook_campaign';

-- STEP 2: Remove campaign-specific webhook token (only using org-level webhooks now)
ALTER TABLE campaigns DROP COLUMN IF EXISTS webhook_token;

-- STEP 3: Remove email template fields (not sending automated emails anymore)
ALTER TABLE campaigns DROP COLUMN IF EXISTS email_subject;
ALTER TABLE campaigns DROP COLUMN IF EXISTS email_template;

-- STEP 4: Drop the old webhook token index (if exists)
DROP INDEX IF EXISTS idx_campaigns_webhook_token;

-- STEP 5: Update integration_type check constraint
-- Remove 'webhook_campaign' option, keep only 'manual' and 'webhook_organization'
ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS campaigns_integration_type_check;
ALTER TABLE campaigns
  ADD CONSTRAINT campaigns_integration_type_check
  CHECK (integration_type IN ('manual', 'webhook_organization'));

-- Add event end date for credit unlocking (if not exists)
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS event_end_date DATE;

-- Add commission settings
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS commission_type VARCHAR(10) DEFAULT 'fixed';
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS commission_value DECIMAL(10,2) DEFAULT 3.00;

-- Add credits unlocked tracking
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS credits_unlocked BOOLEAN DEFAULT false;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS credits_unlock_date TIMESTAMPTZ;

-- Add comments
COMMENT ON COLUMN campaigns.event_end_date IS 'Date when event ends - used to unlock credits for referrers';
COMMENT ON COLUMN campaigns.commission_type IS 'Type of commission: fixed (e.g., $3 per sale) or percentage (e.g., 10%)';
COMMENT ON COLUMN campaigns.commission_value IS 'Commission amount (dollar amount if fixed, percentage if percentage)';
COMMENT ON COLUMN campaigns.credits_unlocked IS 'Whether credits have been unlocked for this campaign';
