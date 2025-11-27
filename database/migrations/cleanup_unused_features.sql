-- Database optimization: Add performance indexes and update documentation
-- Email features kept as they're still an optional distribution method

-- STEP 1: Add comments for clarity on current product model
COMMENT ON TABLE campaigns IS 'Events/campaigns for referral link generation and credit tracking';
COMMENT ON TABLE contacts IS 'Customers who purchased tickets and received personalized referral links';
COMMENT ON TABLE clicks IS 'Tracks when referral links are clicked';
COMMENT ON TABLE conversions IS 'Tracks when referrals convert to ticket sales';
COMMENT ON TABLE share_actions IS 'Tracks when customers download/share creative content (Instagram, etc)';
COMMENT ON TABLE webhook_logs IS 'Logs all incoming webhook requests for monitoring and security';
COMMENT ON COLUMN campaigns.creative_image_url IS 'Optional: Image URL for social sharing (Instagram stories, etc)';
COMMENT ON COLUMN campaigns.commission_type IS 'Type of commission: fixed (e.g., $3 per sale) or percentage (e.g., 10%)';
COMMENT ON COLUMN campaigns.commission_value IS 'Commission amount (dollar amount if fixed, percentage if percentage)';

-- STEP 2: Ensure all tables have proper indexes for performance
-- Contacts table indexes
CREATE INDEX IF NOT EXISTS idx_contacts_campaign_email ON contacts(campaign_id, email);
CREATE INDEX IF NOT EXISTS idx_contacts_unique_code ON contacts(unique_code);
CREATE INDEX IF NOT EXISTS idx_contacts_campaign_created ON contacts(campaign_id, created_at DESC);

-- Clicks table indexes
CREATE INDEX IF NOT EXISTS idx_clicks_contact ON clicks(contact_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_clicks_campaign ON clicks(campaign_id, created_at DESC);

-- Conversions table indexes
CREATE INDEX IF NOT EXISTS idx_conversions_contact ON conversions(contact_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversions_campaign ON conversions(campaign_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversions_order_id ON conversions(order_id);

-- Share actions table indexes
CREATE INDEX IF NOT EXISTS idx_share_actions_contact ON share_actions(contact_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_share_actions_campaign ON share_actions(campaign_id, created_at DESC);

-- Campaigns table indexes (for credit unlocking queries)
CREATE INDEX IF NOT EXISTS idx_campaigns_event_end_date ON campaigns(event_end_date) WHERE event_end_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_campaigns_credits_unlocked ON campaigns(credits_unlocked, event_end_date);

-- STEP 3: Add helpful views for reporting
-- Campaign performance summary view
CREATE OR REPLACE VIEW campaign_performance AS
SELECT
  c.id as campaign_id,
  c.name as campaign_name,
  c.status,
  c.commission_type,
  c.commission_value,
  c.event_end_date,
  c.credits_unlocked,
  COUNT(DISTINCT co.id) as total_contacts,
  COUNT(DISTINCT cl.id) as total_clicks,
  COUNT(DISTINCT cv.id) as total_conversions,
  COALESCE(SUM(cv.amount), 0) as total_revenue
FROM campaigns c
LEFT JOIN contacts co ON co.campaign_id = c.id
LEFT JOIN clicks cl ON cl.campaign_id = c.id
LEFT JOIN conversions cv ON cv.campaign_id = c.id
GROUP BY c.id, c.name, c.status, c.commission_type, c.commission_value, c.event_end_date, c.credits_unlocked;

COMMENT ON VIEW campaign_performance IS 'Summary of campaign performance metrics for dashboard reporting';

-- Summary:
-- ✅ Added documentation comments to all tables
-- ✅ Added performance indexes for common queries
-- ✅ Created campaign performance view for reporting
-- ✅ Kept email features as optional distribution method
