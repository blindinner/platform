-- Make creative_image_url, email_subject, and email_template optional for webhook-based campaigns
-- These fields are only needed for manual email campaigns, not webhook campaigns

ALTER TABLE campaigns
ALTER COLUMN creative_image_url DROP NOT NULL;

ALTER TABLE campaigns
ALTER COLUMN email_subject DROP NOT NULL;

ALTER TABLE campaigns
ALTER COLUMN email_template DROP NOT NULL;

-- Add comments to clarify when these fields are used
COMMENT ON COLUMN campaigns.creative_image_url IS 'Optional: Image URL for manual campaigns with custom creatives';
COMMENT ON COLUMN campaigns.email_subject IS 'Optional: Email subject for manual email campaigns';
COMMENT ON COLUMN campaigns.email_template IS 'Optional: Email template for manual email campaigns';
