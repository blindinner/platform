-- Add organization-level default commission settings
-- These are used when auto-creating campaigns via webhook

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS webhook_default_commission_type VARCHAR(10) DEFAULT 'fixed',
ADD COLUMN IF NOT EXISTS webhook_default_commission_value DECIMAL(10,2) DEFAULT 3.00;

-- Add destination_url to contacts (store ticket_url from webhook payload)
ALTER TABLE contacts
ADD COLUMN IF NOT EXISTS destination_url TEXT;

COMMENT ON COLUMN user_profiles.webhook_default_commission_type IS 'Default commission type for auto-created campaigns (fixed or percentage)';
COMMENT ON COLUMN user_profiles.webhook_default_commission_value IS 'Default commission value for auto-created campaigns';
COMMENT ON COLUMN contacts.destination_url IS 'Ticket URL from webhook payload (where referral link redirects to)';
