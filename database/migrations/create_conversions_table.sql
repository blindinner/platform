-- Drop existing conversions table if it exists with old structure
DROP TABLE IF EXISTS conversions CASCADE;

-- Conversions table: Track successful referral purchases
CREATE TABLE conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Campaign and referrer info
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  referrer_contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,

  -- Referral tracking
  referral_code VARCHAR(50) NOT NULL,

  -- Purchase details
  referred_customer_email VARCHAR(255) NOT NULL,
  referred_customer_first_name VARCHAR(255),
  referred_customer_last_name VARCHAR(255),
  referred_customer_phone VARCHAR(50),
  order_id VARCHAR(255),
  amount DECIMAL(10,2),

  -- Commission/credit details
  commission_type VARCHAR(20) NOT NULL,
  commission_value DECIMAL(10,2) NOT NULL,
  commission_amount DECIMAL(10,2) NOT NULL,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_conversions_campaign_id ON conversions(campaign_id);
CREATE INDEX idx_conversions_referrer_contact_id ON conversions(referrer_contact_id);
CREATE INDEX idx_conversions_referral_code ON conversions(referral_code);
CREATE INDEX idx_conversions_order_id ON conversions(order_id);
CREATE INDEX idx_conversions_created_at ON conversions(created_at);

-- Comments
COMMENT ON TABLE conversions IS 'Track successful purchases made through referral links';
COMMENT ON COLUMN conversions.referrer_contact_id IS 'The contact who referred this purchase (gets the credit)';
COMMENT ON COLUMN conversions.referral_code IS 'The referral code used for this purchase';
COMMENT ON COLUMN conversions.commission_type IS 'fixed or percentage - copied from campaign at time of conversion';
COMMENT ON COLUMN conversions.commission_value IS 'Commission value - copied from campaign at time of conversion';
COMMENT ON COLUMN conversions.commission_amount IS 'Calculated credit amount earned by referrer';
