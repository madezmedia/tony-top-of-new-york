import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { buildMrssFeed } from '../lib/mrss.js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const VAST_TAG_URL = process.env.VAST_TAG_URL ?? '';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const { data: films, error } = await supabase
    .from('films')
    .select(
      'slug, title, description, mux_public_playback_id, duration_seconds, season_number, episode_number, air_date, content_rating'
    )
    .eq('is_fast_available', true)
    .not('mux_public_playback_id', 'is', null)
    .order('season_number', { ascending: true })
    .order('episode_number', { ascending: true });

  if (error) {
    console.error('Feed error:', error);
    return res.status(500).send('Internal server error');
  }

  const xml = buildMrssFeed(films ?? [], VAST_TAG_URL);

  res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  return res.status(200).send(xml);
}
