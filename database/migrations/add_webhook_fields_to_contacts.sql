-- Add fields to contacts table for webhook integration

-- Add order_id to track the original ticket purchase
ALTER TABLE contacts
ADD COLUMN IF NOT EXISTS order_id TEXT;

-- Add source to distinguish between manual uploads and webhook-generated contacts
ALTER TABLE contacts
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual';

-- Create index on order_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_contacts_order_id ON contacts(order_id);

-- Create index on source for filtering
CREATE INDEX IF NOT EXISTS idx_contacts_source ON contacts(source);

-- Add comment for documentation
COMMENT ON COLUMN contacts.order_id IS 'Original order/ticket ID from ticketing system';
COMMENT ON COLUMN contacts.source IS 'Source of contact creation: manual, csv, webhook, api';
