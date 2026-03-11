import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing authorization token' });
    }

    const token = authHeader.substring(7);

    // Verify user session with Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Fetch user's active entitlements joined with film data
    const { data: entitlements, error: entitlementsError } = await supabase
      .from('entitlements')
      .select(`
        id,
        active,
        purchased_at,
        films (
          id,
          slug,
          title,
          mux_playback_id
        )
      `)
      .eq('user_id', user.id)
      .eq('active', true)
      .order('purchased_at', { ascending: false });

    if (entitlementsError) {
      console.error('Error fetching purchased films:', entitlementsError);
      return res.status(500).json({ error: 'Failed to fetch purchases' });
    }

    // Format the response for the frontend
    const purchases = entitlements.map(entry => {
      // Cast since Supabase typings for joins can be tricky
      const film = Array.isArray(entry.films) ? entry.films[0] : entry.films;
      
      return {
        entitlementId: entry.id,
        purchasedAt: entry.purchased_at,
        film: film ? {
          id: film.id,
          slug: film.slug,
          title: film.title,
          muxPlaybackId: film.mux_playback_id
        } : null
      };
    }).filter(p => p.film !== null); // Filter out orphans

    return res.status(200).json({ purchases });
  } catch (error) {
    console.error('Error checking purchases:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
