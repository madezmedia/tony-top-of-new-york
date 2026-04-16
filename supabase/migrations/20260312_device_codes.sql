-- Device Codes Table for Roku Device Authentication
-- This table stores temporary device codes for the Roku device flow

CREATE TABLE IF NOT EXISTS device_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  device_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
  expires_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure only one pending code per device
  CONSTRAINT unique_pending_device UNIQUE (device_id, status)
);

-- Index for faster lookups by code
CREATE INDEX IF NOT EXISTS idx_device_codes_code ON device_codes(code);

-- Index for faster lookups by device_id
CREATE INDEX IF NOT EXISTS idx_device_codes_device_id ON device_codes(device_id);

-- Index for status queries
CREATE INDEX IF NOT EXISTS idx_device_codes_status ON device_codes(status);

-- Function to automatically expire old pending codes
CREATE OR REPLACE FUNCTION expire_old_device_codes()
RETURNS void AS $$
BEGIN
  UPDATE device_codes
  SET status = 'expired'
  WHERE status = 'pending'
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Run a clean up every hour (optional, can be run via cron)
-- SELECT expire_old_device_codes();

-- Enable Row Level Security (RLS)
ALTER TABLE device_codes ENABLE ROW LEVEL SECURITY;

-- RLS Policies:
-- Allow service role to do everything
CREATE POLICY "Service role has full access" ON device_codes
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to read only completed codes for their devices
CREATE POLICY "Users can read completed device codes" ON device_codes
  FOR SELECT
  TO authenticated
  USING (status = 'completed' AND user_id = auth.uid());

-- Allow anyone to insert device codes (for Roku devices)
CREATE POLICY "Allow device code creation" ON device_codes
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow anonymous access to poll device status (for Roku devices)
CREATE POLICY "Allow device status polling" ON device_codes
  FOR SELECT
  TO anon
  USING (true);
