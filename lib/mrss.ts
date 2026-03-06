const CHANNEL_TITLE = 'T.O.N.Y. — Top of New York';
const CHANNEL_LINK = 'https://tony-top-of-new-york.vercel.app';
const CHANNEL_DESCRIPTION = 'A Bronx Crime Saga. Seven seasons. One family.';
const CHANNEL_LANGUAGE = 'en-us';

export interface FilmForMrss {
  slug: string;
  title: string;
  description: string | null;
  mux_public_playback_id: string;
  duration_seconds: number | null;
  season_number: number | null;
  episode_number: number | null;
  air_date: string | null;
  content_rating: string | null;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function buildMrssItem(film: FilmForMrss, vastTagUrl: string): string {
  const playbackId = film.mux_public_playback_id;
  const streamUrl = `https://stream.mux.com/${playbackId}.m3u8`;
  const thumbnailUrl = escapeXml(`https://image.mux.com/${playbackId}/thumbnail.jpg?width=1920&height=1080`);
  const duration = film.duration_seconds ?? 0;
  const rating = (film.content_rating ?? 'TV-MA').toLowerCase();
  const pubDate = film.air_date
    ? new Date(film.air_date).toUTCString()
    : new Date().toUTCString();
  const title = escapeXml(film.title);
  const description = escapeXml(film.description ?? '');

  const adTag = vastTagUrl
    ? `\n      <media:advertisement type="vast">${vastTagUrl}</media:advertisement>`
    : '';

  return `    <item>
      <title>${title}</title>
      <description>${description}</description>
      <pubDate>${pubDate}</pubDate>
      <guid isPermaLink="false">tony-${film.slug}</guid>
      <media:content
        url="${streamUrl}"
        type="application/x-mpegURL"
        duration="${duration}"
        medium="video"
      />
      <media:thumbnail
        url="${thumbnailUrl}"
        width="1920"
        height="1080"
      />
      <media:rating scheme="urn:v-chip">${rating}</media:rating>
      <media:category>Drama</media:category>${adTag}
      <roku:adSupported>true</roku:adSupported>
    </item>`;
}

export function buildMrssFeed(films: FilmForMrss[], vastTagUrl: string): string {
  const items = films.map(f => buildMrssItem(f, vastTagUrl)).join('\n\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:media="http://search.yahoo.com/mrss/"
  xmlns:roku="http://www.roku.com/ns/1.0"
  xmlns:dcterms="http://purl.org/dc/terms/">
  <channel>
    <title>${CHANNEL_TITLE}</title>
    <link>${CHANNEL_LINK}</link>
    <description>${CHANNEL_DESCRIPTION}</description>
    <language>${CHANNEL_LANGUAGE}</language>
    <image>
      <url>${CHANNEL_LINK}/og-image.jpg</url>
      <title>${CHANNEL_TITLE}</title>
      <link>${CHANNEL_LINK}</link>
    </image>

${items}

  </channel>
</rss>`;
}
