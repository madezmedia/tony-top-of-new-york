-- Roku Purchases Table
-- Records Roku Pay (Channel Store) purchases

CREATE TABLE IF NOT EXISTS roku_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  transaction_id TEXT NOT NULL UNIQUE,
  receipt JSONB,
  entitlement_type TEXT NOT NULL CHECK (entitlement_type IN ('episode', 'season', 'all_access')),
  film_id UUID REFERENCES films(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent duplicate transactions
  CONSTRAINT unique_transaction UNIQUE (transaction_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_roku_purchases_user_id ON roku_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_roku_purchases_transaction_id ON roku_purchases(transaction_id);
CREATE INDEX IF NOT EXISTS idx_roku_purchases_product_id ON roku_purchases(product_id);
CREATE INDEX IF NOT EXISTS idx_roku_purchases_film_id ON roku_purchases(film_id);

-- RLS
ALTER TABLE roku_purchases ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Service role has full access" ON roku_purchases
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Users can see their own purchases
CREATE POLICY "Users can read own purchases" ON roku_purchases
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Allow service role to insert purchases (via API)
CREATE POLICY "Allow purchase creation via API" ON roku_purchases
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Comment
COMMENT ON TABLE roku_purchases IS 'Stores Roku Pay (Channel Store) purchase records';
COMMENT ON COLUMN roku_purchases.entitlement_type IS 'Type of entitlement: episode, season, or all_access';
COMMENT ON COLUMN roku_purchases.receipt IS 'Raw receipt data from Roku Channel Store';
