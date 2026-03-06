import { describe, it, expect } from 'vitest';
import { buildMrssItem, buildMrssFeed } from './mrss';

const sampleFilm = {
  slug: 's01e01-concrete-jungle',
  title: 'S01E01 – Concrete Jungle',
  description: 'Michael Cortez returns to the Bronx after years away.',
  mux_public_playback_id: 'abc123def456',
  duration_seconds: 2880,
  season_number: 1,
  episode_number: 1,
  air_date: '2023-10-12',
  content_rating: 'TV-MA',
};

describe('buildMrssItem', () => {
  it('includes correct Mux HLS stream URL', () => {
    const item = buildMrssItem(sampleFilm, 'https://vast.example.com/tag');
    expect(item).toContain('stream.mux.com/abc123def456.m3u8');
  });

  it('includes correct Mux thumbnail URL', () => {
    const item = buildMrssItem(sampleFilm, 'https://vast.example.com/tag');
    expect(item).toContain('image.mux.com/abc123def456/thumbnail.jpg');
  });

  it('includes VAST ad tag in media:advertisement', () => {
    const item = buildMrssItem(sampleFilm, 'https://vast.example.com/tag');
    expect(item).toContain('https://vast.example.com/tag');
    expect(item).toContain('media:advertisement');
  });

  it('omits media:advertisement when vastTagUrl is empty', () => {
    const item = buildMrssItem(sampleFilm, '');
    expect(item).not.toContain('media:advertisement');
  });

  it('includes content rating', () => {
    const item = buildMrssItem(sampleFilm, '');
    expect(item).toContain('tv-ma');
  });

  it('includes roku:adSupported true', () => {
    const item = buildMrssItem(sampleFilm, '');
    expect(item).toContain('<roku:adSupported>true</roku:adSupported>');
  });

  it('escapes ampersands in title and description', () => {
    const filmWithAmp = { ...sampleFilm, title: 'Rock & Roll', description: 'Fast & Furious' };
    const item = buildMrssItem(filmWithAmp, '');
    expect(item).toContain('Rock &amp; Roll');
    expect(item).toContain('Fast &amp; Furious');
  });

  it('includes duration in media:content', () => {
    const item = buildMrssItem(sampleFilm, '');
    expect(item).toContain('duration="2880"');
  });
});

describe('buildMrssFeed', () => {
  it('wraps items in valid RSS 2.0 envelope', () => {
    const feed = buildMrssFeed([sampleFilm], '');
    expect(feed).toContain('<?xml version="1.0"');
    expect(feed).toContain('<rss version="2.0"');
    expect(feed).toContain('</rss>');
  });

  it('includes media and roku namespaces', () => {
    const feed = buildMrssFeed([sampleFilm], '');
    expect(feed).toContain('xmlns:media="http://search.yahoo.com/mrss/"');
    expect(feed).toContain('xmlns:roku="http://www.roku.com/ns/1.0"');
  });

  it('includes channel title T.O.N.Y.', () => {
    const feed = buildMrssFeed([sampleFilm], '');
    expect(feed).toContain('T.O.N.Y.');
  });

  it('includes the episode item in the feed', () => {
    const feed = buildMrssFeed([sampleFilm], '');
    expect(feed).toContain('abc123def456');
  });
});
