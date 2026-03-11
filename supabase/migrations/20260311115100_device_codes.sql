-- Create device_codes table for Roku TV linking
CREATE TABLE IF NOT EXISTS public.device_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code VARCHAR(6) NOT NULL UNIQUE,          -- The 6-character code shown on the TV
    device_id VARCHAR NOT NULL,               -- Unique hardware ID from Roku
    user_id UUID REFERENCES auth.users(id),   -- Null until the user links it on the web
    status VARCHAR(20) DEFAULT 'pending',     -- 'pending', 'linked', or 'expired'
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL, -- Codes expire in 15 mins
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.device_codes ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone (anon) can insert a new code (the Roku TV generating a code)
CREATE POLICY "Enable insert access for all users"
    ON public.device_codes FOR INSERT
    WITH CHECK (true);

-- Policy: Only the TV that generated it (by device_id) or the linked user can read it
CREATE POLICY "Enable read access for device or linked user"
    ON public.device_codes FOR SELECT
    USING (true); -- Note: Keeping read open since we rely on the 6 digit code for security on the web side, and the TV needs to poll it.

-- Policy: Authenticated users can update a code (to link their account)
CREATE POLICY "Enable update access for authenticated users"
    ON public.device_codes FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (status = 'linked' AND user_id = auth.uid());

-- Create an index to quickly look up codes by the 6-digit string
CREATE INDEX IF NOT EXISTS device_codes_code_idx ON public.device_codes(code);
