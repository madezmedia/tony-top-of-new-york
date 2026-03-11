import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/device/link
 * Called by Web UI when an authenticated user enters the 6-digit code.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 1. Verify user session
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing authorization token' });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Missing code parameter' });
    }

    const uppercaseCode = code.toUpperCase().trim();

    // 2. Find the pending code
    const { data: deviceCode, error: findError } = await supabase
      .from('device_codes')
      .select('*')
      .eq('code', uppercaseCode)
      .eq('status', 'pending')
      .single();

    if (findError || !deviceCode) {
      return res.status(404).json({ error: 'Invalid or expired code. Please generate a new code on your TV.' });
    }

    // 3. Verify it's not expired
    if (new Date(deviceCode.expires_at) < new Date()) {
      // Mark as expired
      await supabase
        .from('device_codes')
        .update({ status: 'expired' })
        .eq('id', deviceCode.id);
        
      return res.status(400).json({ error: 'This code has expired. Please generate a new code on your TV.' });
    }

    // 4. Link the device to the user
    // We update using the service role to ensure it processes, but we record the auth.uid
    const { error: updateError } = await supabase
      .from('device_codes')
      .update({
        user_id: user.id,
        status: 'linked'
      })
      .eq('id', deviceCode.id);

    if (updateError) throw updateError;

    return res.status(200).json({ success: true, message: 'TV Successfully Linked!' });

  } catch (error) {
    console.error('Error linking device:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
