-- Add detailed contact information fields
-- Split name into first_name and last_name, add phone number

-- Add new columns to contacts table
ALTER TABLE contacts
ADD COLUMN IF NOT EXISTS first_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS last_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS phone VARCHAR(50);

-- Migrate existing 'name' data to 'first_name' if it exists
UPDATE contacts
SET first_name = name
WHERE first_name IS NULL AND name IS NOT NULL AND name != '';

-- Comments
COMMENT ON COLUMN contacts.first_name IS 'Customer first name';
COMMENT ON COLUMN contacts.last_name IS 'Customer last name';
COMMENT ON COLUMN contacts.phone IS 'Customer phone number';

-- Note: Keep the 'name' column for backward compatibility
-- New integrations should use first_name and last_name
