import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key for server-side operations
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
    const { code, device_id } = req.query;

    if (!code || !device_id) {
      return res.status(400).json({ error: 'Missing code or device_id parameter' });
    }

    // Query the device code status
    const { data: deviceCode, error: queryError } = await supabase
      .from('device_codes')
      .select('*')
      .eq('code', code)
      .eq('device_id', device_id)
      .single();

    if (queryError) {
      console.error('Error querying device code:', queryError);
      return res.status(500).json({ error: 'Failed to query device code' });
    }

    if (!deviceCode) {
      return res.status(404).json({ error: 'Device code not found' });
    }

    // Check if code has expired
    if (new Date(deviceCode.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Device code has expired' });
    }

    // If pending, return pending status
    if (deviceCode.status === 'pending') {
      return res.status(200).json({
        status: 'pending',
        message: 'Waiting for user authentication',
      });
    }

    // If completed, return the user's session tokens
    if (deviceCode.status === 'completed') {
      // Get user data
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', deviceCode.user_id)
        .single();

      return res.status(200).json({
        status: 'completed',
        user: userData,
        // You may want to generate a Supabase session token here
        // using the service role key
      });
    }

    return res.status(400).json({ error: 'Unknown device code status' });
  } catch (error) {
    console.error('Error in device-status endpoint:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
