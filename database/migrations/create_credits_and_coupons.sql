-- Credits table: Track credits earned by contacts from successful referrals
CREATE TABLE IF NOT EXISTS credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  conversion_id UUID REFERENCES conversions(id) ON DELETE SET NULL,

  -- Credit details
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'available', 'redeemed', 'expired')),

  -- Unlocking (credits become available after event ends)
  unlocked_at TIMESTAMP,

  -- Redemption tracking (coupon_id added later)
  redeemed_at TIMESTAMP,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Coupons table: Coupon codes that can be generated from credits
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,

  -- Coupon details
  code VARCHAR(50) UNIQUE NOT NULL,
  credit_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'redeemed', 'expired')),

  -- Expiration
  expires_at TIMESTAMP,

  -- Redemption tracking
  redeemed_at TIMESTAMP,
  redeemed_by VARCHAR(255), -- Email or identifier of who redeemed it

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add coupon_id column to credits now that coupons table exists
ALTER TABLE credits ADD COLUMN IF NOT EXISTS coupon_id UUID;
ALTER TABLE credits ADD CONSTRAINT credits_coupon_id_fkey
  FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE SET NULL;

-- Indexes for performance
CREATE INDEX idx_credits_contact_id ON credits(contact_id);
CREATE INDEX idx_credits_campaign_id ON credits(campaign_id);
CREATE INDEX idx_credits_status ON credits(status);
CREATE INDEX idx_credits_conversion_id ON credits(conversion_id);

CREATE INDEX idx_coupons_contact_id ON coupons(contact_id);
CREATE INDEX idx_coupons_campaign_id ON coupons(campaign_id);
CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_status ON coupons(status);

-- Comments
COMMENT ON TABLE credits IS 'Individual credit entries earned from successful referrals';
COMMENT ON TABLE coupons IS 'Coupon codes generated from accumulated credits';

COMMENT ON COLUMN credits.status IS 'pending: event not ended yet, available: ready to use, redeemed: used in coupon, expired: past expiration';
COMMENT ON COLUMN credits.unlocked_at IS 'When credits became available (usually after event ends)';
COMMENT ON COLUMN credits.coupon_id IS 'The coupon this credit was redeemed for';

COMMENT ON COLUMN coupons.code IS 'Unique coupon code given to customer';
COMMENT ON COLUMN coupons.credit_amount IS 'Total credit value represented by this coupon';
COMMENT ON COLUMN coupons.redeemed_by IS 'Email or identifier of who redeemed the coupon';
