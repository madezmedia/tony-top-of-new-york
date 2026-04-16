import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key for server-side operations
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
    const { device_id } = req.body;

    if (!device_id) {
      return res.status(400).json({ error: 'Missing device_id parameter' });
    }

    // Generate a 6-character device code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Calculate expiry time (15 minutes from now)
    const expires_at = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    // Store device code in Supabase
    const { data: deviceCode, error: insertError } = await supabase
      .from('device_codes')
      .insert({
        code,
        device_id,
        expires_at,
        status: 'pending',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating device code:', insertError);
      return res.status(500).json({ error: 'Failed to create device code' });
    }

    return res.status(200).json({
      code,
      device_id,
      expires_at,
      status: 'pending',
    });
  } catch (error) {
    console.error('Error in device-code endpoint:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
