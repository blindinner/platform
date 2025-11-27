-- Add webhook logging and security settings

-- Webhook request logs table
CREATE TABLE webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  webhook_type VARCHAR(20) NOT NULL CHECK (webhook_type IN ('campaign', 'organization')),
  request_ip INET,
  request_headers JSONB,
  request_payload JSONB,
  response_status INTEGER,
  response_message TEXT,
  processing_time_ms INTEGER,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for efficient querying
CREATE INDEX idx_webhook_logs_campaign_created ON webhook_logs(campaign_id, created_at DESC);
CREATE INDEX idx_webhook_logs_created ON webhook_logs(created_at DESC);

-- Add webhook security settings to campaigns
ALTER TABLE campaigns
ADD COLUMN rate_limit_per_hour INTEGER DEFAULT 100,
ADD COLUMN rate_limit_enabled BOOLEAN DEFAULT true;

-- Add account-level webhook settings to user_profiles
ALTER TABLE user_profiles
ADD COLUMN webhook_rate_limit_default INTEGER DEFAULT 100,
ADD COLUMN webhook_alerts_enabled BOOLEAN DEFAULT true,
ADD COLUMN webhook_alert_email VARCHAR(255);

-- Function to clean up old webhook logs (keep last 100 per campaign)
CREATE OR REPLACE FUNCTION cleanup_old_webhook_logs()
RETURNS trigger AS $$
BEGIN
  DELETE FROM webhook_logs
  WHERE id IN (
    SELECT id
    FROM webhook_logs
    WHERE campaign_id = NEW.campaign_id
    ORDER BY created_at DESC
    OFFSET 100
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically cleanup old logs
CREATE TRIGGER trigger_cleanup_webhook_logs
  AFTER INSERT ON webhook_logs
  FOR EACH ROW
  EXECUTE FUNCTION cleanup_old_webhook_logs();

-- View for rate limiting checks (requests in last hour)
CREATE OR REPLACE VIEW webhook_rate_limit_status AS
SELECT
  campaign_id,
  COUNT(*) as requests_last_hour,
  MAX(created_at) as last_request_at
FROM webhook_logs
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY campaign_id;

COMMENT ON TABLE webhook_logs IS 'Stores all incoming webhook requests for monitoring and debugging';
COMMENT ON VIEW webhook_rate_limit_status IS 'Current rate limit status per campaign (requests in last hour)';
