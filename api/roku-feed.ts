import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
    console.error('Roku feed error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }

  const episodes = (films ?? []).map(f => ({
    id: f.slug,
    title: f.title,
    description: f.description ?? '',
    releaseDate: f.air_date ?? '',
    runtime: f.duration_seconds ?? 0,
    rating: f.content_rating ?? 'TV-MA',
    thumbnail: `https://image.mux.com/${f.mux_public_playback_id}/thumbnail.jpg?width=1920&height=1080`,
    streamUrl: `https://stream.mux.com/${f.mux_public_playback_id}.m3u8`,
    requiresToken: true,
    season: f.season_number ?? 1,
    episode: f.episode_number ?? 1,
  }));

  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.setHeader('Access-Control-Allow-Origin', '*');
  return res.status(200).json({ episodes });
}
