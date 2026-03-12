import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { generateVideoToken, generateThumbnailToken, computeExpiry } from '../lib/mux-jwt.js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const signingOptions = {
  signingKeyId: process.env.MUX_SIGNING_KEY_ID!,
  privateKeyBase64: process.env.MUX_SIGNING_PRIVATE_KEY!,
  restrictionId: process.env.MUX_PLAYBACK_RESTRICTION_ROKU_ID,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { episodeId } = req.query;
  if (!episodeId || typeof episodeId !== 'string') {
    return res.status(400).json({ error: 'Missing episodeId parameter' });
  }

  const { data: film, error } = await supabase
    .from('films')
    .select('mux_public_playback_id, duration_seconds')
    .eq('slug', episodeId)
    .eq('is_fast_available', true)
    .single();

  if (error || !film || !film.mux_public_playback_id) {
    return res.status(404).json({ error: 'Episode not found or not available for FAST' });
  }

  const playbackId = film.mux_public_playback_id;
  const duration = film.duration_seconds || 0;

  try {
    const videoToken = generateVideoToken(playbackId, duration, signingOptions);
    const thumbnailToken = generateThumbnailToken(playbackId, signingOptions);
    const expiresAt = computeExpiry(duration || 0);

    res.setHeader('Cache-Control', 'private, no-store');

    return res.status(200).json({
      playbackId,
      token: videoToken,
      thumbnailToken,
      streamUrl: `https://stream.mux.com/${playbackId}.m3u8?token=${videoToken}`,
      expiresAt,
    });
  } catch (err) {
    console.error('Error generating Roku token:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
