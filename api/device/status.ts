import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { createHmac } from 'crypto';

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Need service role to fetch the user's token later
);

/**
 * POST /api/device/status
 * Polled by Roku app. If status='linked', returns a custom session token for the Roku.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Robust handling for Roku redirects
  const code = (req.body?.code || req.query?.code) as string;
  const deviceId = (req.body?.deviceId || req.body?.deviceid || req.query?.deviceId || req.query?.deviceid) as string;

  if (!code || !deviceId) {
    return res.status(400).json({
      error: 'Missing code or deviceId',
      method: req.method
    });
  }

  try {
    const uppercaseCode = code.toUpperCase().trim();

    const { data: deviceCode, error: findError } = await supabase
      .from('device_codes')
      .select('id, status, user_id, expires_at')
      .eq('code', uppercaseCode)
      .eq('device_id', deviceId)
      .single();

    if (findError || !deviceCode) {
      return res.status(404).json({ status: 'invalid' });
    }

    if (deviceCode.status === 'expired' || new Date(deviceCode.expires_at) < new Date()) {
      return res.status(200).json({ status: 'expired' });
    }

    if (deviceCode.status === 'pending') {
      return res.status(200).json({ status: 'pending' });
    }

    if (deviceCode.status === 'linked' && deviceCode.user_id) {
      // The TV was successfully linked by a web user!
      // We must generate a custom JWT using the Supabase Service Role so the Roku can authenticate natively

      // Note: We cannot get the actual OAuth access_token from Supabase directly via admin API,
      // so the easiest secure method for a TV is to issue a Custom Token using the user's ID,
      // which Supabase accepts as an auth token if signed with the JWT secret.
      
      const jwtSecret = process.env.SUPABASE_JWT_SECRET;
      
      if (!jwtSecret) {
         console.error('Missing SUPABASE_JWT_SECRET in environment');
         return res.status(500).json({ error: 'Server configuration error' });
      }

      // Generate a long-lived custom JWT for the TV
      // Using standard jsonwebtoken lib (we might need to ensure it's installed, or use WebCrypto API)
      
      // Simple HS256 JWT signature using crypto
      const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
      const payload = Buffer.from(JSON.stringify({
        aud: 'authenticated',
        role: 'authenticated',
        sub: deviceCode.user_id,
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 365) // 1 year expiration for Roku TV
      })).toString('base64url');
      
      const signature = createHmac('sha256', jwtSecret)
                              .update(`${header}.${payload}`)
                              .digest('base64url');
                              
      const customToken = `${header}.${payload}.${signature}`;

      // Clean up the code since it's used
      await supabase.from('device_codes').delete().eq('id', deviceCode.id);

      return res.status(200).json({
        status: 'linked',
        token: customToken
      });
    }

    return res.status(200).json({ status: deviceCode.status });

  } catch (error) {
    console.error('Error checking device status:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
