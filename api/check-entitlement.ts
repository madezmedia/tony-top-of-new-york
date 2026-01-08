import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
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

    const { slug } = req.body;
    if (!slug) {
      return res.status(400).json({ error: 'Missing slug parameter' });
    }

    // Look up film
    const { data: film, error: filmError } = await supabase
      .from('films')
      .select('id, slug, title, price_cents, trailer_url')
      .eq('slug', slug)
      .single();

    if (filmError || !film) {
      return res.status(404).json({ error: 'Film not found' });
    }

    // Check entitlement
    const { data: entitlement } = await supabase
      .from('entitlements')
      .select('*')
      .eq('user_id', user.id)
      .eq('film_id', film.id)
      .eq('active', true)
      .single();

    return res.status(200).json({
      hasAccess: !!entitlement,
      film: {
        id: film.id,
        slug: film.slug,
        title: film.title,
        priceCents: film.price_cents,
        trailerUrl: film.trailer_url,
      },
      entitlement: entitlement
        ? {
            purchasedAt: entitlement.purchased_at,
          }
        : null,
    });
  } catch (error) {
    console.error('Error checking entitlement:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
