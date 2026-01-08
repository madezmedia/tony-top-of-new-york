import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key for server-side operations
const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const MUX_SIGNING_KEY_ID = process.env.MUX_SIGNING_KEY_ID!;
const MUX_PRIVATE_KEY = process.env.MUX_SIGNING_PRIVATE_KEY
  ? Buffer.from(process.env.MUX_SIGNING_PRIVATE_KEY, 'base64').toString('utf8')
  : '';

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
      .select('*')
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

    if (!entitlement) {
      return res.status(403).json({ error: 'No active entitlement for this film' });
    }

    // Generate Mux signed playback token
    const playbackId = film.mux_playback_id;

    const muxToken = jwt.sign(
      {
        sub: playbackId,
        aud: 'v', // 'v' for video playback
        kid: MUX_SIGNING_KEY_ID,
        exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour expiry
      },
      MUX_PRIVATE_KEY,
      { algorithm: 'RS256' }
    );

    // Also generate a storyboard token for thumbnails
    const storyboardToken = jwt.sign(
      {
        sub: playbackId,
        aud: 's', // 's' for storyboard
        kid: MUX_SIGNING_KEY_ID,
        exp: Math.floor(Date.now() / 1000) + 60 * 60,
      },
      MUX_PRIVATE_KEY,
      { algorithm: 'RS256' }
    );

    // Generate thumbnail token
    const thumbnailToken = jwt.sign(
      {
        sub: playbackId,
        aud: 't', // 't' for thumbnail
        kid: MUX_SIGNING_KEY_ID,
        exp: Math.floor(Date.now() / 1000) + 60 * 60,
      },
      MUX_PRIVATE_KEY,
      { algorithm: 'RS256' }
    );

    return res.status(200).json({
      playbackId,
      tokens: {
        playback: muxToken,
        storyboard: storyboardToken,
        thumbnail: thumbnailToken,
      },
    });
  } catch (error) {
    console.error('Error generating Mux token:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
