-- Add client_id to user_profiles for organization-level webhooks
-- This enables a single webhook URL per organization/client

-- Add client_id: unique identifier for organization-level webhooks
ALTER TABLE user_profiles
ADD COLUMN client_id VARCHAR(64) UNIQUE;

-- Create index for fast client_id lookups
CREATE INDEX idx_user_profiles_client_id ON user_profiles(client_id) WHERE client_id IS NOT NULL;

-- Add comment to clarify usage
COMMENT ON COLUMN user_profiles.client_id IS 'Unique client identifier for organization-level webhook URLs (e.g., client_abc123...)';

-- Generate client_ids for existing users
UPDATE user_profiles
SET client_id = CONCAT('client_', encode(gen_random_bytes(20), 'hex'))
WHERE client_id IS NULL;

-- Make client_id NOT NULL after populating existing records
ALTER TABLE user_profiles
ALTER COLUMN client_id SET NOT NULL;
