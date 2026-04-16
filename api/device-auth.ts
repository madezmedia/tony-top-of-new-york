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
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Missing code parameter' });
    }

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

    // Find the device code
    const { data: deviceCode, error: queryError } = await supabase
      .from('device_codes')
      .select('*')
      .eq('code', code)
      .single();

    if (queryError || !deviceCode) {
      return res.status(404).json({ error: 'Invalid device code' });
    }

    // Check if code has expired
    if (new Date(deviceCode.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Device code has expired' });
    }

    // Check if already completed
    if (deviceCode.status === 'completed') {
      return res.status(400).json({ error: 'Device code already used' });
    }

    // Update device code with user ID and mark as completed
    const { error: updateError } = await supabase
      .from('device_codes')
      .update({
        user_id: user.id,
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('code', code);

    if (updateError) {
      console.error('Error updating device code:', updateError);
      return res.status(500).json({ error: 'Failed to authorize device' });
    }

    return res.status(200).json({
      success: true,
      message: 'Device successfully authorized',
      device_id: deviceCode.device_id,
    });
  } catch (error) {
    console.error('Error in device-auth endpoint:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
