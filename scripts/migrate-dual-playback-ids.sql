-- Add dual Mux playback ID columns to films table
ALTER TABLE films
  ADD COLUMN IF NOT EXISTS mux_public_playback_id TEXT,
  ADD COLUMN IF NOT EXISTS mux_signed_playback_id TEXT,
  ADD COLUMN IF NOT EXISTS duration_seconds INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS season_number INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS episode_number INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS air_date DATE,
  ADD COLUMN IF NOT EXISTS content_rating TEXT DEFAULT 'TV-MA',
  ADD COLUMN IF NOT EXISTS is_fast_available BOOLEAN DEFAULT false;

-- Populate signed column from existing mux_playback_id (existing IDs are signed policy)
UPDATE films
SET mux_signed_playback_id = mux_playback_id
WHERE mux_signed_playback_id IS NULL AND mux_playback_id IS NOT NULL;

-- Comment on new columns
COMMENT ON COLUMN films.mux_public_playback_id IS 'Mux playback ID with public policy — used for FAST/MRSS distribution';
COMMENT ON COLUMN films.mux_signed_playback_id IS 'Mux playback ID with signed policy — used for website paywall';
COMMENT ON COLUMN films.is_fast_available IS 'Whether this film is included in the MRSS feed for FAST distribution';
