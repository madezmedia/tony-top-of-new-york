import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function generateShortCode(): string {
  // Generate a random 6-character alphanumeric code, avoiding confusing chars like O/0, I/1
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * POST /api/device/code
 * Called by Roku app to generate a new linking code.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const deviceId = req.body.deviceId || req.body.deviceid;
  if (!deviceId) {
    console.warn('[api/device/code] Missing deviceId. Body:', req.body);
    return res.status(400).json({ error: 'Missing deviceId parameter' });
  }

  try {
    let code = '';
    let isUnique = false;
    let attempts = 0;

    // Try to gen sequence up to 5 times to avoid collisions
    while (!isUnique && attempts < 5) {
      code = generateShortCode();
      const { data } = await supabase
        .from('device_codes')
        .select('id')
        .eq('code', code)
        .eq('status', 'pending')
        .single();
      
      if (!data) isUnique = true;
      attempts++;
    }

    if (!isUnique) {
      return res.status(500).json({ error: 'Failed to generate unique code' });
    }

    // Set expiration to 15 minutes from now
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    const { error } = await supabase
      .from('device_codes')
      .insert({
        code,
        device_id: deviceId,
        status: 'pending',
        expires_at: expiresAt.toISOString()
      });

    if (error) throw error;

    return res.status(200).json({
      code,
      expiresIn: 900, // 15 mins in seconds
      interval: 5 // Recommended polling interval in seconds
    });
  } catch (error) {
    console.error('Error generating device code:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
