-- Add credit unlock settings to campaigns table
ALTER TABLE campaigns
ADD COLUMN IF NOT EXISTS credit_unlock_type VARCHAR(20) DEFAULT 'event_based' CHECK (credit_unlock_type IN ('event_based', 'immediate', 'delayed')),
ADD COLUMN IF NOT EXISTS credit_unlock_days INTEGER DEFAULT 0;

-- Add default credit unlock settings to user_profiles table
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS default_credit_unlock_type VARCHAR(20) DEFAULT 'event_based' CHECK (default_credit_unlock_type IN ('event_based', 'immediate', 'delayed')),
ADD COLUMN IF NOT EXISTS default_credit_unlock_days INTEGER DEFAULT 0;

-- Comments
COMMENT ON COLUMN campaigns.credit_unlock_type IS 'How credits unlock: event_based (after event ends), immediate (right away), delayed (after X days)';
COMMENT ON COLUMN campaigns.credit_unlock_days IS 'Number of days to wait before unlocking credits (only used for delayed type)';

COMMENT ON COLUMN user_profiles.default_credit_unlock_type IS 'Default credit unlock type for auto-created campaigns';
COMMENT ON COLUMN user_profiles.default_credit_unlock_days IS 'Default number of days to wait before unlocking credits';
