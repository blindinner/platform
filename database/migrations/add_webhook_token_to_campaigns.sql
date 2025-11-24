-- Add webhook fields to campaigns table for secure webhook URLs
-- This enables both campaign-specific and organization-level webhooks

-- Add webhook_token: unique, secure token for campaign-specific webhooks
ALTER TABLE campaigns
ADD COLUMN webhook_token VARCHAR(64) UNIQUE;

-- Add integration_type: how contacts will be added to this campaign
ALTER TABLE campaigns
ADD COLUMN integration_type VARCHAR(20) DEFAULT 'manual' CHECK (integration_type IN ('manual', 'webhook_campaign', 'webhook_organization'));

-- Add external_event_id: optional mapping to external platform event/product ID
ALTER TABLE campaigns
ADD COLUMN external_event_id VARCHAR(255);

-- Create index for webhook_token lookups (fast webhook routing)
CREATE INDEX idx_campaigns_webhook_token ON campaigns(webhook_token) WHERE webhook_token IS NOT NULL;

-- Create index for external_event_id lookups (organization webhook routing)
CREATE INDEX idx_campaigns_external_event ON campaigns(organizer_id, external_event_id)
WHERE external_event_id IS NOT NULL;

-- Add comments to clarify usage
COMMENT ON COLUMN campaigns.webhook_token IS 'Unique secure token for campaign-specific webhook URLs (e.g., /api/webhooks/camp_abc123...)';
COMMENT ON COLUMN campaigns.integration_type IS 'How contacts are added: manual (CSV upload), webhook_campaign (unique URL per campaign), webhook_organization (shared URL with campaign_id/external_event_id)';
COMMENT ON COLUMN campaigns.external_event_id IS 'Optional: Your event/product ID from external platform (Shopify, Eventbrite, etc.) for organization webhook mapping';

-- Generate webhook tokens for existing campaigns
UPDATE campaigns
SET webhook_token = CONCAT('camp_', encode(gen_random_bytes(24), 'hex'))
WHERE webhook_token IS NULL;

-- Make webhook_token NOT NULL after populating existing records
ALTER TABLE campaigns
ALTER COLUMN webhook_token SET NOT NULL;
