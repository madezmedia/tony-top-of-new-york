/**
 * Database types for Supabase
 *
 * Run this SQL in Supabase to create the tables:
 *
 * -- Films table
 * CREATE TABLE films (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   slug TEXT UNIQUE NOT NULL,
 *   title TEXT NOT NULL,
 *   tagline TEXT,
 *   description TEXT,
 *   price_cents INTEGER NOT NULL DEFAULT 999,
 *   mux_playback_id TEXT NOT NULL,
 *   mux_asset_id TEXT,
 *   trailer_url TEXT,
 *   poster_url TEXT,
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
 *   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 * );
 *
 * -- Entitlements table (user purchases)
 * CREATE TABLE entitlements (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
 *   film_id UUID REFERENCES films(id) ON DELETE CASCADE,
 *   active BOOLEAN DEFAULT true,
 *   purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
 *   square_payment_id TEXT,
 *   UNIQUE(user_id, film_id)
 * );
 *
 * -- Pending orders (for webhook reconciliation)
 * CREATE TABLE pending_orders (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
 *   film_id UUID REFERENCES films(id) ON DELETE CASCADE,
 *   square_payment_link_id TEXT,
 *   square_order_id TEXT,
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 * );
 *
 * -- Download logs (for analytics)
 * CREATE TABLE download_logs (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
 *   film_id UUID REFERENCES films(id) ON DELETE CASCADE,
 *   quality TEXT,
 *   downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 * );
 *
 * -- Enable RLS
 * ALTER TABLE films ENABLE ROW LEVEL SECURITY;
 * ALTER TABLE entitlements ENABLE ROW LEVEL SECURITY;
 * ALTER TABLE pending_orders ENABLE ROW LEVEL SECURITY;
 * ALTER TABLE download_logs ENABLE ROW LEVEL SECURITY;
 *
 * -- Public read access to films
 * CREATE POLICY "Public can view films" ON films
 *   FOR SELECT USING (true);
 *
 * -- Users can view their own entitlements
 * CREATE POLICY "Users can view own entitlements" ON entitlements
 *   FOR SELECT USING (auth.uid() = user_id);
 *
 * -- Service role can manage entitlements
 * CREATE POLICY "Service can manage entitlements" ON entitlements
 *   FOR ALL USING (auth.role() = 'service_role');
 *
 * -- Service role can manage pending orders
 * CREATE POLICY "Service can manage pending_orders" ON pending_orders
 *   FOR ALL USING (auth.role() = 'service_role');
 *
 * -- Service role can manage download logs
 * CREATE POLICY "Service can manage download_logs" ON download_logs
 *   FOR ALL USING (auth.role() = 'service_role');
 *
 * -- Insert initial T.O.N.Y. film
 * INSERT INTO films (slug, title, tagline, price_cents, mux_playback_id, trailer_url)
 * VALUES (
 *   'tony-top-of-new-york',
 *   'T.O.N.Y. - Top of New York',
 *   'In the unforgiving streets of the Bronx, power is earned, loyalty is tested, and survival comes at a cost.',
 *   999,
 *   'YOUR_MUX_PLAYBACK_ID_HERE',
 *   'https://www.youtube.com/embed/F1wtn1g_SZI'
 * );
 */

export interface Database {
  public: {
    Tables: {
      films: {
        Row: {
          id: string;
          slug: string;
          title: string;
          tagline: string | null;
          description: string | null;
          price_cents: number;
          mux_playback_id: string;
          mux_asset_id: string | null;
          trailer_url: string | null;
          poster_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          tagline?: string | null;
          description?: string | null;
          price_cents?: number;
          mux_playback_id: string;
          mux_asset_id?: string | null;
          trailer_url?: string | null;
          poster_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          tagline?: string | null;
          description?: string | null;
          price_cents?: number;
          mux_playback_id?: string;
          mux_asset_id?: string | null;
          trailer_url?: string | null;
          poster_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      entitlements: {
        Row: {
          id: string;
          user_id: string;
          film_id: string;
          active: boolean;
          purchased_at: string;
          square_payment_id: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          film_id: string;
          active?: boolean;
          purchased_at?: string;
          square_payment_id?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          film_id?: string;
          active?: boolean;
          purchased_at?: string;
          square_payment_id?: string | null;
        };
      };
      pending_orders: {
        Row: {
          id: string;
          user_id: string;
          film_id: string;
          square_payment_link_id: string | null;
          square_order_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          film_id: string;
          square_payment_link_id?: string | null;
          square_order_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          film_id?: string;
          square_payment_link_id?: string | null;
          square_order_id?: string | null;
          created_at?: string;
        };
      };
      download_logs: {
        Row: {
          id: string;
          user_id: string;
          film_id: string;
          quality: string | null;
          downloaded_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          film_id: string;
          quality?: string | null;
          downloaded_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          film_id?: string;
          quality?: string | null;
          downloaded_at?: string;
        };
      };
    };
  };
}

// Helper types
export type Film = Database['public']['Tables']['films']['Row'];
export type Entitlement = Database['public']['Tables']['entitlements']['Row'];
export type PendingOrder = Database['public']['Tables']['pending_orders']['Row'];
export type DownloadLog = Database['public']['Tables']['download_logs']['Row'];
