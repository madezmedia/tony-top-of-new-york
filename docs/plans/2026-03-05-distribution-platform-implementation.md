# T.O.N.Y. Distribution Platform Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the MRSS content feed, hardened Mux JWT token APIs, Roku token endpoint, and Roku SceneGraph app that together power FAST distribution to Apple TV aggregators and a Roku channel.

**Architecture:** A single `/api/feed.xml` endpoint serves MRSS to Apple's 16 aggregators. Mux assets carry dual playback IDs (public for FAST, signed for paywall). JWT signing is centralized in `lib/mux-jwt.ts` using RS256 with playback restrictions. The Roku app (Phase 2) fetches tokens at playback time from `/api/roku-token`.

**Tech Stack:** TypeScript, Vercel Serverless Functions, Supabase (postgres), jsonwebtoken (RS256), Mux HLS, BrightScript + SceneGraph (Roku), Vitest (tests)

---

## Context You Must Read First

- Design doc: `docs/plans/2026-03-05-distribution-platform-design.md`
- Existing JWT handler: `api/mux-token.ts` — uses `jsonwebtoken` directly (keep this pattern, do NOT switch to `@mux/mux-node` SDK)
- DB table: `films` (not `episodes`) — see schema in `lib/database.types.ts`
- `kid` claim goes in the JWT **payload** (not header) — this is Mux's accepted format per their docs

---

## Phase 1: Test Setup + DB Migration

### Task 1: Install Vitest and add test script

**Files:**
- Modify: `package.json`

**Step 1: Install Vitest**

```bash
cd /Users/michaelshaw/clawd/projects/tony-top-of-new-york
npm install --save-dev vitest @vitest/coverage-v8
```

**Step 2: Add test script to `package.json`**

In the `"scripts"` section, add:
```json
"test": "vitest run",
"test:watch": "vitest"
```

**Step 3: Verify**

```bash
npm test
```
Expected: `No test files found` (not an error — just nothing to run yet)

**Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add vitest for unit testing"
```

---

### Task 2: Supabase schema migration — dual Mux playback IDs

**Files:**
- Create: `scripts/migrate-dual-playback-ids.sql`

**Background:** The `films` table currently has a single `mux_playback_id`. We need to add `mux_public_playback_id` (for FAST/MRSS), `mux_signed_playback_id` (for paywall), `duration_seconds`, and `episode_number`/`season_number` for MRSS metadata.

**Step 1: Create the migration SQL file**

Create `scripts/migrate-dual-playback-ids.sql`:

```sql
-- Add dual Mux playback ID columns to films table
ALTER TABLE films
  ADD COLUMN IF NOT EXISTS mux_public_playback_id TEXT,
  ADD COLUMN IF NOT EXISTS mux_signed_playback_id TEXT,
  ADD COLUMN IF NOT EXISTS duration_seconds INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS season_number INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS episode_number INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS air_date DATE,
  ADD COLUMN IF NOT EXISTS content_rating TEXT DEFAULT 'TV-MA',
  ADD COLUMN IF NOT EXISTS is_fast_available BOOLEAN DEFAULT false;

-- Populate signed column from existing mux_playback_id (existing IDs are signed policy)
UPDATE films
SET mux_signed_playback_id = mux_playback_id
WHERE mux_signed_playback_id IS NULL AND mux_playback_id IS NOT NULL;

-- Comment on new columns
COMMENT ON COLUMN films.mux_public_playback_id IS 'Mux playback ID with public policy — used for FAST/MRSS distribution';
COMMENT ON COLUMN films.mux_signed_playback_id IS 'Mux playback ID with signed policy — used for website paywall';
COMMENT ON COLUMN films.is_fast_available IS 'Whether this film is included in the MRSS feed for FAST distribution';
```

**Step 2: Run in Supabase SQL Editor**

Go to your Supabase dashboard → SQL Editor → paste and run the migration.

**Step 3: Verify in Supabase**

Run this in the SQL Editor to confirm:
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'films'
ORDER BY ordinal_position;
```

Expected: you see `mux_public_playback_id`, `mux_signed_playback_id`, `duration_seconds`, etc.

**Step 4: Commit the SQL file**

```bash
git add scripts/migrate-dual-playback-ids.sql
git commit -m "chore: add migration for dual Mux playback IDs and FAST metadata"
```

---

## Phase 2: JWT Utility Library

### Task 3: Create `lib/mux-jwt.ts` — shared signing logic

**Files:**
- Create: `lib/mux-jwt.ts`
- Create: `lib/mux-jwt.test.ts`

**Background:** Currently `api/mux-token.ts` signs JWTs inline. We extract this into a shared utility so `api/roku-token.ts` and any future endpoint can reuse it. Keep using `jsonwebtoken` — do NOT add `@mux/mux-node`.

**Step 1: Write the failing tests first**

Create `lib/mux-jwt.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import jwt from 'jsonwebtoken';

// We'll test the module once it exists
// For now, write tests that describe expected behavior

describe('mux-jwt', () => {
  // Minimal RSA key pair for testing (DO NOT use in production)
  // Generate with: openssl genrsa 2048 | base64
  // For tests we use a known test key
  const TEST_KEY_ID = 'test-key-id-123';

  it('generateVideoToken returns a JWT with correct claims', async () => {
    const { generateVideoToken } = await import('./mux-jwt');
    const token = generateVideoToken('playback-id-abc', 2880, {
      signingKeyId: TEST_KEY_ID,
      privateKeyBase64: process.env.MUX_SIGNING_PRIVATE_KEY || 'test',
      restrictionId: 'restriction-xyz',
    });
    // Token should be a JWT string
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3);
  });

  it('generateVideoToken expiry is at least episodeDuration + 300 seconds', async () => {
    const { generateVideoToken } = await import('./mux-jwt');
    const before = Math.floor(Date.now() / 1000);
    const episodeDuration = 7200; // 2 hours
    const token = generateVideoToken('playback-id-abc', episodeDuration, {
      signingKeyId: TEST_KEY_ID,
      privateKeyBase64: process.env.MUX_SIGNING_PRIVATE_KEY || 'test',
    });
    // Decode without verification to inspect claims
    const decoded = jwt.decode(token) as Record<string, any>;
    expect(decoded.exp).toBeGreaterThanOrEqual(before + episodeDuration + 300);
    expect(decoded.sub).toBe('playback-id-abc');
    expect(decoded.aud).toBe('v');
    expect(decoded.kid).toBe(TEST_KEY_ID);
  });

  it('generateThumbnailToken sets aud to t', async () => {
    const { generateThumbnailToken } = await import('./mux-jwt');
    const token = generateThumbnailToken('playback-id-abc', {
      signingKeyId: TEST_KEY_ID,
      privateKeyBase64: process.env.MUX_SIGNING_PRIVATE_KEY || 'test',
    });
    const decoded = jwt.decode(token) as Record<string, any>;
    expect(decoded.aud).toBe('t');
  });

  it('generateStoryboardToken sets aud to s', async () => {
    const { generateStoryboardToken } = await import('./mux-jwt');
    const token = generateStoryboardToken('playback-id-abc', {
      signingKeyId: TEST_KEY_ID,
      privateKeyBase64: process.env.MUX_SIGNING_PRIVATE_KEY || 'test',
    });
    const decoded = jwt.decode(token) as Record<string, any>;
    expect(decoded.aud).toBe('s');
  });
});
```

**Step 2: Run tests to confirm they fail**

```bash
npm test
```
Expected: FAIL — `Cannot find module './mux-jwt'`

**Step 3: Implement `lib/mux-jwt.ts`**

```typescript
import jwt from 'jsonwebtoken';

export interface MuxSigningOptions {
  signingKeyId: string;
  privateKeyBase64: string;
  restrictionId?: string;
}

const MIN_EXPIRY_SECONDS = 4 * 60 * 60; // 4 hours

function getPrivateKey(base64: string): string {
  return Buffer.from(base64, 'base64').toString('utf8');
}

function computeExpiry(episodeDurationSeconds: number): number {
  const minExpiry = MIN_EXPIRY_SECONDS;
  const durationExpiry = episodeDurationSeconds + 300; // +5 min buffer
  return Math.floor(Date.now() / 1000) + Math.max(minExpiry, durationExpiry);
}

export function generateVideoToken(
  playbackId: string,
  episodeDurationSeconds: number,
  options: MuxSigningOptions
): string {
  const claims: Record<string, any> = {
    sub: playbackId,
    aud: 'v',
    kid: options.signingKeyId,
    exp: computeExpiry(episodeDurationSeconds),
  };

  if (options.restrictionId) {
    claims.playback_restriction_id = options.restrictionId;
  }

  return jwt.sign(claims, getPrivateKey(options.privateKeyBase64), {
    algorithm: 'RS256',
    noTimestamp: true, // exp is set manually above
  });
}

export function generateThumbnailToken(
  playbackId: string,
  options: MuxSigningOptions
): string {
  const claims: Record<string, any> = {
    sub: playbackId,
    aud: 't',
    kid: options.signingKeyId,
    exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24h for thumbnails
  };

  if (options.restrictionId) {
    claims.playback_restriction_id = options.restrictionId;
  }

  return jwt.sign(claims, getPrivateKey(options.privateKeyBase64), {
    algorithm: 'RS256',
    noTimestamp: true,
  });
}

export function generateStoryboardToken(
  playbackId: string,
  options: MuxSigningOptions
): string {
  const claims: Record<string, any> = {
    sub: playbackId,
    aud: 's',
    kid: options.signingKeyId,
    exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
  };

  return jwt.sign(claims, getPrivateKey(options.privateKeyBase64), {
    algorithm: 'RS256',
    noTimestamp: true,
  });
}
```

**Step 4: Run tests**

```bash
npm test
```

Expected: Tests that use only `jwt.decode()` (no verification) should pass. The tests with real signing will be skipped if no real key is set — that's fine for unit tests.

**Step 5: Commit**

```bash
git add lib/mux-jwt.ts lib/mux-jwt.test.ts
git commit -m "feat: add shared Mux JWT signing utility with expiry-duration logic"
```

---

## Phase 3: Harden Existing Token API

### Task 4: Update `api/mux-token.ts` — use shared lib + fix expiry + add restrictions

**Files:**
- Modify: `api/mux-token.ts`

**What changes:** Replace inline JWT signing with `lib/mux-jwt.ts`. Fix the 1-hour hardcoded expiry — use `duration_seconds` from the DB. Add `playback_restriction_id`. Switch to `mux_signed_playback_id`.

**Step 1: Read the current file before editing**

Re-read `api/mux-token.ts` (already read above — it's at line 1-116).

**Step 2: Replace the implementation**

Replace the entire file with:

```typescript
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

  // Use signed playback ID (fall back to legacy mux_playback_id for existing records)
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
```

**Step 3: Smoke test locally**

```bash
npm run dev
# In another terminal:
curl -X POST http://localhost:3000/api/mux-token \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-test-supabase-token>" \
  -d '{"slug":"s01e01-concrete-jungle"}'
```

Expected: `{"playbackId":"...","tokens":{"playback":"...","thumbnail":"...","storyboard":"..."}}`

**Step 4: Commit**

```bash
git add api/mux-token.ts
git commit -m "feat: harden mux-token with shared JWT lib, duration-based expiry, and playback restrictions"
```

---

## Phase 4: Roku Token Endpoint

### Task 5: Create `api/roku-token.ts` — public endpoint for Roku devices

**Files:**
- Create: `api/roku-token.ts`

**Background:** Roku devices don't send a `Referer` header, so we use a separate Mux Playback Restriction with `allow_no_referrer: true`. This endpoint is public (no Supabase auth) because FAST content is free.

**Step 1: Create `api/roku-token.ts`**

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { generateVideoToken, generateThumbnailToken } from '../lib/mux-jwt';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const signingOptions = {
  signingKeyId: process.env.MUX_SIGNING_KEY_ID!,
  privateKeyBase64: process.env.MUX_SIGNING_PRIVATE_KEY!,
  // Separate restriction ID: allow_no_referrer=true for Roku devices
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

  // Look up by slug — only return FAST-available films
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
  const exp = Math.floor(Date.now() / 1000) + Math.max(4 * 3600, duration + 300);

  try {
    const videoToken = generateVideoToken(playbackId, duration, signingOptions);
    const thumbnailToken = generateThumbnailToken(playbackId, signingOptions);

    // Cache for 1 hour (safe since tokens are valid for 4h+)
    res.setHeader('Cache-Control', 'public, max-age=3600');

    return res.status(200).json({
      playbackId,
      token: videoToken,
      thumbnailToken,
      streamUrl: `https://stream.mux.com/${playbackId}.m3u8?token=${videoToken}`,
      expiresAt: exp,
    });
  } catch (err) {
    console.error('Error generating Roku token:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
```

**Step 2: Smoke test**

```bash
curl "http://localhost:3000/api/roku-token?episodeId=s01e01-concrete-jungle"
```

Expected: JSON with `playbackId`, `token`, `streamUrl`, `expiresAt`

**Step 3: Commit**

```bash
git add api/roku-token.ts
git commit -m "feat: add Roku token endpoint with allow_no_referrer restriction"
```

---

## Phase 5: MRSS Feed

### Task 6: Create `api/feed.xml.ts` — MRSS endpoint for Apple aggregators

**Files:**
- Create: `api/feed.xml.ts`
- Create: `lib/mrss.ts`
- Create: `lib/mrss.test.ts`

**Step 1: Write failing tests for MRSS builder**

Create `lib/mrss.test.ts`:

```typescript
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
  it('includes correct Mux stream URL', () => {
    const item = buildMrssItem(sampleFilm, 'https://vast.example.com/tag');
    expect(item).toContain('stream.mux.com/abc123def456.m3u8');
  });

  it('includes correct Mux thumbnail URL', () => {
    const item = buildMrssItem(sampleFilm, 'https://vast.example.com/tag');
    expect(item).toContain('image.mux.com/abc123def456/thumbnail.jpg');
  });

  it('includes VAST ad tag', () => {
    const item = buildMrssItem(sampleFilm, 'https://vast.example.com/tag');
    expect(item).toContain('https://vast.example.com/tag');
  });

  it('includes content rating', () => {
    const item = buildMrssItem(sampleFilm, '');
    expect(item).toContain('TV-MA');
  });

  it('includes roku:adSupported', () => {
    const item = buildMrssItem(sampleFilm, '');
    expect(item).toContain('<roku:adSupported>true</roku:adSupported>');
  });
});

describe('buildMrssFeed', () => {
  it('wraps items in valid RSS channel', () => {
    const feed = buildMrssFeed([sampleFilm], 'https://vast.example.com/tag');
    expect(feed).toContain('<?xml version="1.0"');
    expect(feed).toContain('<rss version="2.0"');
    expect(feed).toContain('</rss>');
    expect(feed).toContain('T.O.N.Y.');
  });
});
```

**Step 2: Run tests to confirm they fail**

```bash
npm test
```
Expected: FAIL — `Cannot find module './mrss'`

**Step 3: Implement `lib/mrss.ts`**

```typescript
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

export function buildMrssItem(film: FilmForMrss, vastTagUrl: string): string {
  const playbackId = film.mux_public_playback_id;
  const streamUrl = `https://stream.mux.com/${playbackId}.m3u8`;
  const thumbnailUrl = `https://image.mux.com/${playbackId}/thumbnail.jpg?width=1920&height=1080`;
  const duration = film.duration_seconds ?? 0;
  const rating = film.content_rating ?? 'TV-MA';
  const pubDate = film.air_date
    ? new Date(film.air_date).toUTCString()
    : new Date().toUTCString();
  const description = (film.description ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const title = film.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  return `
    <item>
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
      <media:rating scheme="urn:v-chip">${rating.toLowerCase()}</media:rating>
      <media:category>Drama</media:category>
      ${vastTagUrl ? `<media:advertisement type="vast">${vastTagUrl}</media:advertisement>` : ''}
      <roku:adSupported>true</roku:adSupported>
    </item>`.trim();
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
```

**Step 4: Run tests**

```bash
npm test
```
Expected: All 6 MRSS tests PASS

**Step 5: Create `api/feed.xml.ts`**

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { buildMrssFeed } from '../lib/mrss';

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
```

**Step 6: Smoke test**

```bash
curl http://localhost:3000/api/feed.xml
```
Expected: Valid XML starting with `<?xml version="1.0"` and containing your film data (assuming you've set `is_fast_available = true` on at least one film in Supabase).

**Step 7: Validate the feed**

Paste the feed URL into: https://validator.w3.org/feed/

Expected: Valid RSS 2.0

**Step 8: Commit**

```bash
git add lib/mrss.ts lib/mrss.test.ts api/feed.xml.ts
git commit -m "feat: add MRSS feed endpoint for Apple aggregators and Roku"
```

---

## Phase 6: Roku JSON Feed

### Task 7: Create `api/roku-feed.ts` — JSON content API for Roku Phase 2 app

**Files:**
- Create: `api/roku-feed.ts`

**Background:** The Roku SceneGraph app fetches content as JSON (not MRSS). This endpoint returns a Roku-friendly content list.

**Step 1: Create `api/roku-feed.ts`**

```typescript
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
    // Roku app will replace streamUrl with signed URL from /api/roku-token
    requiresToken: true,
    season: f.season_number ?? 1,
    episode: f.episode_number ?? 1,
  }));

  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.setHeader('Access-Control-Allow-Origin', '*'); // Roku app needs CORS
  return res.status(200).json({ episodes });
}
```

**Step 2: Smoke test**

```bash
curl http://localhost:3000/api/roku-feed
```
Expected: `{"episodes":[{"id":"s01e01-concrete-jungle","title":"...","streamUrl":"https://stream.mux.com/..."}]}`

**Step 3: Commit**

```bash
git add api/roku-feed.ts
git commit -m "feat: add Roku JSON feed endpoint for Phase 2 SceneGraph app"
```

---

## Phase 7: Environment Variables

### Task 8: Document and configure all required env vars

**Files:**
- Create: `.env.example`

**Step 1: Create `.env.example`**

```bash
# Supabase
VITE_SUPABASE_URL=https://yourproject.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Mux API credentials (from dashboard.mux.com/settings/access-tokens)
MUX_TOKEN_ID=your-mux-api-token-id
MUX_TOKEN_SECRET=your-mux-api-token-secret

# Mux JWT signing (from dashboard.mux.com/settings/signing-keys)
MUX_SIGNING_KEY_ID=your-signing-key-id
MUX_SIGNING_PRIVATE_KEY=base64-encoded-private-key

# Mux Playback Restrictions
# Create these via POST https://api.mux.com/video/v1/playback-restrictions
MUX_PLAYBACK_RESTRICTION_ID=restriction-id-for-website
MUX_PLAYBACK_RESTRICTION_ROKU_ID=restriction-id-for-roku

# FAST Ad Network
VAST_TAG_URL=https://your-ad-server.com/vast
```

**Step 2: Create the Mux signing key (one-time)**

```bash
curl -X POST https://api.mux.com/system/v1/signing-keys \
  -H "Content-Type: application/json" \
  -u "$MUX_TOKEN_ID:$MUX_TOKEN_SECRET"
```

Save the returned `id` as `MUX_SIGNING_KEY_ID` and `private_key` (already base64) as `MUX_SIGNING_PRIVATE_KEY`.

**Step 3: Create website playback restriction (one-time)**

```bash
curl -X POST https://api.mux.com/video/v1/playback-restrictions \
  -H "Content-Type: application/json" \
  -u "$MUX_TOKEN_ID:$MUX_TOKEN_SECRET" \
  -d '{
    "referrer": {
      "allowed_domains": ["tony-top-of-new-york.vercel.app", "tonyseries.com"],
      "allow_no_referrer": false
    }
  }'
```

Save returned `data.id` as `MUX_PLAYBACK_RESTRICTION_ID`.

**Step 4: Create Roku playback restriction (one-time)**

```bash
curl -X POST https://api.mux.com/video/v1/playback-restrictions \
  -H "Content-Type: application/json" \
  -u "$MUX_TOKEN_ID:$MUX_TOKEN_SECRET" \
  -d '{
    "referrer": {
      "allowed_domains": ["*"],
      "allow_no_referrer": true
    },
    "user_agent": {
      "allow_no_user_agent": false,
      "allow_high_risk_user_agent": false
    }
  }'
```

Save returned `data.id` as `MUX_PLAYBACK_RESTRICTION_ROKU_ID`.

**Step 5: Add all vars to Vercel**

```bash
# For each variable:
vercel env add MUX_SIGNING_KEY_ID production
vercel env add MUX_SIGNING_PRIVATE_KEY production
vercel env add MUX_PLAYBACK_RESTRICTION_ID production
vercel env add MUX_PLAYBACK_RESTRICTION_ROKU_ID production
vercel env add VAST_TAG_URL production
```

**Step 6: Commit**

```bash
git add .env.example
git commit -m "chore: document required environment variables for distribution platform"
```

---

## Phase 8: Add Public Mux Playback ID to Episode 1

### Task 9: Create a public playback ID for Episode 1 in Mux and update Supabase

**Background:** Each existing asset has only a signed playback ID. For FAST, we need to add a public playback ID to the same asset.

**Step 1: Find the Mux asset ID for Episode 1**

In Supabase SQL Editor:
```sql
SELECT slug, mux_asset_id, mux_playback_id FROM films WHERE slug = 's01e01-concrete-jungle';
```

Note the `mux_asset_id`.

**Step 2: Add a public playback ID to the asset**

```bash
curl -X POST "https://api.mux.com/video/v1/assets/{ASSET_ID}/playback-ids" \
  -H "Content-Type: application/json" \
  -u "$MUX_TOKEN_ID:$MUX_TOKEN_SECRET" \
  -d '{"policy": "public"}'
```

Note the returned `data.id` — this is the public playback ID.

**Step 3: Update Supabase**

In Supabase SQL Editor:
```sql
UPDATE films
SET
  mux_public_playback_id = 'YOUR_PUBLIC_PLAYBACK_ID_HERE',
  mux_signed_playback_id = mux_playback_id, -- copy existing signed ID
  is_fast_available = true,
  duration_seconds = 2880  -- 48 minutes
WHERE slug = 's01e01-concrete-jungle';
```

**Step 4: Verify the feed includes Episode 1**

```bash
curl http://localhost:3000/api/feed.xml | grep "Concrete Jungle"
```
Expected: The episode title appears in the XML output.

**Step 5: Commit**

```bash
git add scripts/migrate-dual-playback-ids.sql
git commit -m "chore: document process for adding public Mux playback IDs per episode"
```

---

## Phase 9: Roku SceneGraph App (Phase 2)

### Task 10: Scaffold Roku app directory

**Files:**
- Create: `roku/manifest`
- Create: `roku/source/main.brs`
- Create: `roku/.gitignore`

**Step 1: Create `roku/manifest`**

```
title=TONY - Top of New York
major_version=1
minor_version=0
build_version=1

ui_resolutions=hd,fhd
supports_input_launch=1

mm_icon_focus_hd=pkg:/images/icon-hd.png
mm_icon_side_hd=pkg:/images/icon-hd.png
mm_icon_focus_sd=pkg:/images/icon-sd.png

splash_screen_hd=pkg:/images/splash-hd.jpg
splash_color=#020B13
splash_min_time=1500

bs_const=const_debug_enable=false
```

**Step 2: Create `roku/source/main.brs`**

```brightscript
sub Main(args as dynamic)
  screen = CreateObject("roSGScreen")
  m.port = CreateObject("roMessagePort")
  screen.setMessagePort(m.port)

  scene = screen.CreateScene("HomeScene")
  screen.show()

  ' Pass deep link args if any
  if args.contentId <> invalid and args.mediaType <> invalid
    scene.callFunc("playContent", {contentId: args.contentId, mediaType: args.mediaType})
  end if

  while true
    msg = wait(0, m.port)
    msgType = type(msg)
    if msgType = "roSGScreenEvent"
      if msg.isScreenClosed() then return
    end if
  end while
end sub
```

**Step 3: Create `roku/.gitignore`**

```
*.pkg
out/
```

**Step 4: Commit**

```bash
git add roku/
git commit -m "feat: scaffold Roku SceneGraph app directory structure"
```

---

### Task 11: Roku HomeScreen — episode grid

**Files:**
- Create: `roku/components/HomeScene.xml`
- Create: `roku/components/HomeScene.brs`

**Step 1: Create `roku/components/HomeScene.xml`**

```xml
<?xml version="1.0" encoding="utf-8" ?>
<component name="HomeScene" extends="Scene">
  <script type="text/brightscript" uri="pkg:/components/HomeScene.brs" />

  <children>
    <!-- Background -->
    <Rectangle
      id="background"
      width="1920"
      height="1080"
      color="#020B13"
    />

    <!-- T.O.N.Y. Logo / Title -->
    <Label
      id="showTitle"
      text="T.O.N.Y. | TOP OF NEW YORK"
      font="font:LargeBoldSystemFont"
      color="#DAAB2D"
      translation="[80, 60]"
    />

    <Label
      id="showTagline"
      text="A Bronx Crime Saga"
      font="font:SmallSystemFont"
      color="#AAAAAA"
      translation="[80, 110]"
    />

    <!-- Episode Grid -->
    <RowList
      id="episodeGrid"
      translation="[80, 180]"
      itemSize="[400, 280]"
      itemSpacing="[20, 0]"
      numRows="1"
      rowLabelOffset="[0, -40]"
    />

    <!-- Loading indicator -->
    <BusySpinner
      id="loadingSpinner"
      translation="[930, 480]"
      visible="true"
    />
  </children>
</component>
```

**Step 2: Create `roku/components/HomeScene.brs`**

```brightscript
sub init()
  m.episodeGrid = m.top.findNode("episodeGrid")
  m.loadingSpinner = m.top.findNode("loadingSpinner")

  m.episodeGrid.observeField("itemSelected", "onEpisodeSelected")

  fetchEpisodes()
end sub

sub fetchEpisodes()
  m.loadingSpinner.visible = true

  ' Fetch episode list from JSON API
  request = CreateObject("roUrlTransfer")
  request.setUrl("https://tony-top-of-new-york.vercel.app/api/roku-feed")
  request.setCertificatesFile("common:/certs/ca-bundle.crt")
  request.addHeader("Content-Type", "application/json")

  response = request.GetToString()
  if response <> ""
    parsed = ParseJson(response)
    if parsed <> invalid and parsed.episodes <> invalid
      buildEpisodeGrid(parsed.episodes)
    end if
  end if

  m.loadingSpinner.visible = false
end sub

sub buildEpisodeGrid(episodes as object)
  contentNode = CreateObject("roSGNode", "ContentNode")

  row = contentNode.createChild("ContentNode")
  row.title = "Season 1 Episodes"

  for each ep in episodes
    item = row.createChild("ContentNode")
    item.title = ep.title
    item.description = ep.description
    item.hdPosterUrl = ep.thumbnail
    item.length = ep.runtime
    item.rating = ep.rating
    item.id = ep.id  ' slug used to fetch token
  end for

  m.episodeGrid.content = contentNode
end sub

sub onEpisodeSelected()
  selectedItem = m.episodeGrid.content.getChild(0).getChild(m.episodeGrid.itemSelected)
  if selectedItem <> invalid
    m.top.getScene().callFunc("playEpisode", {id: selectedItem.id, title: selectedItem.title})
  end if
end sub

function playContent(args as object) as void
  ' Handle deep link launches
  m.top.getScene().callFunc("playEpisode", {id: args.contentId, title: ""})
end function
```

**Step 3: Commit**

```bash
git add roku/components/
git commit -m "feat: add Roku HomeScene with episode grid and JSON feed integration"
```

---

### Task 12: Roku PlayerScreen — Mux HLS + JWT + VAST

**Files:**
- Create: `roku/components/PlayerScene.xml`
- Create: `roku/components/PlayerScene.brs`

**Step 1: Create `roku/components/PlayerScene.xml`**

```xml
<?xml version="1.0" encoding="utf-8" ?>
<component name="PlayerScene" extends="Scene">
  <script type="text/brightscript" uri="pkg:/components/PlayerScene.brs" />

  <interface>
    <field id="episodeId" type="string" onChange="onEpisodeIdChange" />
    <field id="episodeTitle" type="string" />
  </interface>

  <children>
    <Rectangle
      id="background"
      width="1920"
      height="1080"
      color="#000000"
    />

    <Video
      id="videoPlayer"
      width="1920"
      height="1080"
      translation="[0, 0]"
    />

    <BusySpinner
      id="loadingSpinner"
      translation="[930, 480]"
      visible="true"
    />

    <Label
      id="errorLabel"
      text=""
      color="#FF4444"
      font="font:MediumSystemFont"
      translation="[80, 500]"
      visible="false"
    />
  </children>
</component>
```

**Step 2: Create `roku/components/PlayerScene.brs`**

```brightscript
sub init()
  m.videoPlayer = m.top.findNode("videoPlayer")
  m.loadingSpinner = m.top.findNode("loadingSpinner")
  m.errorLabel = m.top.findNode("errorLabel")

  m.videoPlayer.observeField("state", "onVideoStateChange")
  m.videoPlayer.observeField("position", "onPositionChange")
end sub

sub onEpisodeIdChange()
  episodeId = m.top.episodeId
  if episodeId <> "" then
    loadAndPlayEpisode(episodeId)
  end if
end sub

sub loadAndPlayEpisode(episodeId as string)
  m.loadingSpinner.visible = true
  m.errorLabel.visible = false

  ' Step 1: Fetch signed JWT from /api/roku-token
  tokenUrl = "https://tony-top-of-new-york.vercel.app/api/roku-token?episodeId=" + episodeId
  request = CreateObject("roUrlTransfer")
  request.setUrl(tokenUrl)
  request.setCertificatesFile("common:/certs/ca-bundle.crt")

  tokenResponse = request.GetToString()

  if tokenResponse = ""
    showError("Failed to load episode. Please try again.")
    return
  end if

  tokenData = ParseJson(tokenResponse)
  if tokenData = invalid or tokenData.streamUrl = invalid
    showError("Episode not available.")
    return
  end if

  ' Step 2: Build content node with signed stream URL
  content = CreateObject("roSGNode", "ContentNode")
  content.url = tokenData.streamUrl  ' Already includes ?token=JWT
  content.title = m.top.episodeTitle
  content.streamFormat = "hls"

  ' Step 3: Set up VAST pre-roll via roAdManager
  ' (Roku handles ad insertion before playback starts)
  content.adBreaks = [
    {
      offset: 0,
      ads: [{
        adServer: "https://tony-top-of-new-york.vercel.app/api/vast-tag"
      }]
    }
  ]

  m.videoPlayer.content = content
  m.videoPlayer.control = "play"
  m.loadingSpinner.visible = false
end sub

sub onVideoStateChange()
  state = m.videoPlayer.state
  if state = "error"
    showError("Playback error. Please try again.")
  else if state = "playing"
    m.loadingSpinner.visible = false
    m.errorLabel.visible = false
  end if
end sub

sub onPositionChange()
  ' Token refresh: if within 10 minutes of expiry, fetch a new token
  ' Simplified: refresh every 3.5 hours
  position = m.videoPlayer.position
  if position > 0 and Int(position) mod 12600 = 0  ' 3.5 * 3600
    loadAndPlayEpisode(m.top.episodeId)
  end if
end sub

sub showError(message as string)
  m.loadingSpinner.visible = false
  m.errorLabel.text = message
  m.errorLabel.visible = true
end sub
```

**Step 3: Commit**

```bash
git add roku/components/PlayerScene.xml roku/components/PlayerScene.brs
git commit -m "feat: add Roku PlayerScreen with Mux HLS JWT playback and VAST pre-roll"
```

---

## Phase 10: Deploy and Verify

### Task 13: Deploy to Vercel and validate feed

**Step 1: Push to GitHub**

```bash
git push origin main
```

Vercel auto-deploys on push.

**Step 2: Validate live feed**

```bash
curl https://tony-top-of-new-york.vercel.app/api/feed.xml
```

Expected: Valid MRSS XML with T.O.N.Y. episodes.

**Step 3: Validate feed with W3C**

Go to https://validator.w3.org/feed/ → enter the feed URL → confirm: `This is a valid RSS feed`.

**Step 4: Validate Mux tokens**

```bash
curl "https://tony-top-of-new-york.vercel.app/api/roku-token?episodeId=s01e01-concrete-jungle"
```

Expected: JSON with `streamUrl` containing a valid Mux HLS URL with `?token=`.

**Step 5: Commit any deployment fixes**

```bash
git add .
git commit -m "fix: resolve any deployment issues found after Vercel deploy"
```

---

## Phase 11: Apple Aggregator Submission

### Task 14: Submit MRSS feed to Apple aggregators

**Feed URL:** `https://tony-top-of-new-york.vercel.app/api/feed.xml`

This is a manual submission process. Work through each aggregator's portal. Use `press@tonyseries.com` for all accounts.

**Pre-submission checklist:**
- [ ] Feed URL returns valid MRSS (W3C validator passes)
- [ ] Episode 1 has `mux_public_playback_id` set and `is_fast_available = true` in Supabase
- [ ] VAST tag URL is configured and returning valid VAST XML
- [ ] Show artwork ready: 1400×1400px (square), 1920×1080px (16:9 hero), both PNG or JPG
- [ ] Content rights confirmed (owned content, no unlicensed music)

**Submission priority order:**
1. **Wurl** — wurl.com/become-a-partner (largest Apple TV distributor)
2. **Zype/Brightcove** — app.zype.com → Distribution → Apple TV
3. **Applicaster** — applicaster.com/contact
4. Remaining 13 partners — confirm current list at tvpartners.apple.com

For each: create account → submit feed URL → upload artwork → await review (typically 5–15 business days per partner).

---

## Summary of New Files

| File | Purpose |
|------|---------|
| `lib/mux-jwt.ts` | Shared JWT signing (video/thumbnail/storyboard) |
| `lib/mux-jwt.test.ts` | Unit tests for JWT utility |
| `lib/mrss.ts` | MRSS XML builder |
| `lib/mrss.test.ts` | Unit tests for MRSS builder |
| `api/feed.xml.ts` | Public MRSS endpoint |
| `api/roku-feed.ts` | JSON content API for Roku |
| `api/roku-token.ts` | JWT endpoint for Roku devices |
| `api/mux-token.ts` | Updated — uses shared lib |
| `roku/manifest` | Roku app manifest |
| `roku/source/main.brs` | Roku entry point |
| `roku/components/HomeScene.xml` | Episode grid UI |
| `roku/components/HomeScene.brs` | Episode grid logic |
| `roku/components/PlayerScene.xml` | Video player UI |
| `roku/components/PlayerScene.brs` | Mux HLS + JWT + VAST |
| `.env.example` | Required env vars |
| `scripts/migrate-dual-playback-ids.sql` | DB migration |
