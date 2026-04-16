import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { user_id, product_id, transaction_id, receipt } = req.body;

    if (!user_id || !product_id || !transaction_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify transaction hasn't been processed already
    const { data: existing } = await supabase
      .from('roku_purchases')
      .select('*')
      .eq('transaction_id', transaction_id)
      .single();

    if (existing) {
      return res.status(400).json({ error: 'Transaction already processed' });
    }

    // Determine entitlement based on product_id
    let entitlementType = 'episode';
    let filmId = null;
    let expiresAt = null;

    if (product_id.startsWith('tony.all.access')) {
      entitlementType = 'all_access';
      expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year
    } else if (product_id.startsWith('tony.season')) {
      entitlementType = 'season';
      expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    } else if (product_id.startsWith('tony.episode')) {
      entitlementType = 'episode';
      // Extract film ID from product_id (format: tony.episode.{filmId})
      const parts = product_id.split('.');
      if (parts.length > 2) {
        filmId = parts[2];
      }
    }

    // Record purchase in database
    const { data: purchase, error: purchaseError } = await supabase
      .from('roku_purchases')
      .insert({
        user_id,
        product_id,
        transaction_id,
        receipt,
        entitlement_type: entitlementType,
        film_id: filmId,
        expires_at: expiresAt,
      })
      .select()
      .single();

    if (purchaseError) {
      console.error('Error recording purchase:', purchaseError);
      return res.status(500).json({ error: 'Failed to record purchase' });
    }

    // Grant entitlement
    const { error: entitlementError } = await supabase
      .from('entitlements')
      .insert({
        user_id,
        film_id: filmId,
        entitlement_type: entitlementType,
        source: 'roku_pay',
        source_transaction_id: transaction_id,
        active: true,
        expires_at: expiresAt,
      });

    if (entitlementError) {
      console.error('Error granting entitlement:', entitlementError);
      // Don't fail the request if entitlement fails, purchase is recorded
    }

    return res.status(200).json({
      success: true,
      message: 'Purchase recorded and entitlement granted',
      purchase,
    });
  } catch (error) {
    console.error('Error in roku purchase endpoint:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
