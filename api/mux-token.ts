import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { generateVideoToken, generateThumbnailToken, generateStoryboardToken } from '../lib/mux-jwt';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const signingOptions = {
  signingKeyId: process.env.MUX_SIGNING_KEY_ID!,
  privateKeyBase64: process.env.MUX_SIGNING_PRIVATE_KEY!,
  restrictionId: process.env.MUX_PLAYBACK_RESTRICTION_ID,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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

  const { data: film, error: filmError } = await supabase
    .from('films')
    .select('id, mux_signed_playback_id, mux_playback_id, duration_seconds')
    .eq('slug', slug)
    .single();

  if (filmError || !film) {
    return res.status(404).json({ error: 'Film not found' });
  }

  const { data: entitlement } = await supabase
    .from('entitlements')
    .select('id')
    .eq('user_id', user.id)
    .eq('film_id', film.id)
    .eq('active', true)
    .single();

  if (!entitlement) {
    return res.status(403).json({ error: 'No active entitlement for this film' });
  }

  // Use signed playback ID; fall back to legacy mux_playback_id for existing records
  const playbackId = film.mux_signed_playback_id || film.mux_playback_id;
  const duration = film.duration_seconds || 0;

  try {
    return res.status(200).json({
      playbackId,
      tokens: {
        playback: generateVideoToken(playbackId, duration, signingOptions),
        thumbnail: generateThumbnailToken(playbackId, signingOptions),
        storyboard: generateStoryboardToken(playbackId, signingOptions),
      },
    });
  } catch (error) {
    console.error('Error generating Mux token:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
