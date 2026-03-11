import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/grant-access
 * Called after a user returns from Square checkout with ?success=1.
 * Checks pending_orders and creates an entitlement if a matching order exists.
 * This is a backup to the webhook — the webhook may fire later and upsert.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify user
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing authorization token' });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const { slug } = req.body;
    if (!slug) {
      return res.status(400).json({ error: 'Missing slug parameter' });
    }

    // Look up the film
    const { data: film, error: filmError } = await supabase
      .from('films')
      .select('id, slug, title')
      .eq('slug', slug)
      .single();

    if (filmError || !film) {
      return res.status(404).json({ error: 'Film not found' });
    }

    // Check if user already has an active entitlement
    const { data: existingEntitlement } = await supabase
      .from('entitlements')
      .select('id')
      .eq('user_id', user.id)
      .eq('film_id', film.id)
      .eq('active', true)
      .single();

    if (existingEntitlement) {
      return res.status(200).json({ granted: true, alreadyHadAccess: true });
    }

    // Check if there's a pending order for this user + film
    const { data: pendingOrder } = await supabase
      .from('pending_orders')
      .select('*')
      .eq('user_id', user.id)
      .eq('film_id', film.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!pendingOrder) {
      return res.status(403).json({
        error: 'No pending purchase found. If you just paid, please wait a moment and refresh.',
        granted: false,
      });
    }

    // Pending order exists — the user went through checkout.
    // Grant the entitlement.
    const { error: entitlementError } = await supabase
      .from('entitlements')
      .upsert(
        {
          user_id: user.id,
          film_id: film.id,
          active: true,
          purchased_at: new Date().toISOString(),
          square_payment_id: pendingOrder.square_order_id || 'checkout_redirect',
        },
        {
          onConflict: 'user_id,film_id',
        }
      );

    if (entitlementError) {
      console.error('Error creating entitlement:', entitlementError);
      return res.status(500).json({ error: 'Failed to grant access' });
    }

    // Clean up the pending order
    await supabase
      .from('pending_orders')
      .delete()
      .eq('id', pendingOrder.id);

    console.log(`Access granted for user ${user.id} on film ${film.id} via checkout redirect`);

    return res.status(200).json({ granted: true, alreadyHadAccess: false });
  } catch (error) {
    console.error('Error granting access:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
