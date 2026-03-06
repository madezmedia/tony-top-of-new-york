# FAST Episode Setup Runbook

Add a public Mux playback ID to a Mux asset so the episode appears in the MRSS feed for Apple TV / Roku FAST distribution.

## Prerequisites

Set these environment variables before running any commands:

```bash
export MUX_TOKEN_ID="your-mux-token-id"
export MUX_TOKEN_SECRET="your-mux-token-secret"
```

---

## Step 1 — Find the Mux asset ID

Query Supabase for the episode's current data:

```sql
SELECT slug, mux_asset_id, mux_playback_id
FROM films
WHERE slug = 'YOUR-EPISODE-SLUG';
```

If `mux_asset_id` is NULL, look it up via the Mux API by matching against the known signed playback ID:

```bash
curl -s "https://api.mux.com/video/v1/assets?limit=100" \
  -u "$MUX_TOKEN_ID:$MUX_TOKEN_SECRET" \
  | python3 -c "import json,sys; data=json.load(sys.stdin)['data']; [print(a['id'], a['playback_ids']) for a in data]"
```

Find the row whose `playback_ids` contains the signed playback ID from Supabase. Copy that asset's `id`.

---

## Step 2 — Add a public playback ID to the asset

```bash
curl -X POST "https://api.mux.com/video/v1/assets/MUX_ASSET_ID_HERE/playback-ids" \
  -H "Content-Type: application/json" \
  -u "$MUX_TOKEN_ID:$MUX_TOKEN_SECRET" \
  -d '{"policy": "public"}'
```

Save the `data.id` from the response — this is the public playback ID.

---

## Step 3 — Update Supabase

Run in the Supabase SQL Editor or via CLI:

```sql
UPDATE films
SET
  mux_asset_id            = 'MUX_ASSET_ID_HERE',
  mux_public_playback_id  = 'PUBLIC_PLAYBACK_ID_HERE',
  mux_signed_playback_id  = mux_playback_id,          -- copies the existing signed ID
  is_fast_available       = true,
  duration_seconds        = DURATION_IN_SECONDS_HERE  -- e.g. 2880 for 48 min
WHERE slug = 'YOUR-EPISODE-SLUG';
```

---

## Step 4 — Verify the MRSS feed

```bash
# Local (requires dev server running on port 3000):
curl http://localhost:3000/api/feed.xml | grep "YOUR-EPISODE-TITLE"

# Production (after deploy):
curl https://tony-top-of-new-york.vercel.app/api/feed.xml | grep "YOUR-EPISODE-TITLE"
```

Expected: the episode title appears in the XML output.

---

## Duration reference

| Runtime | Seconds |
|---------|---------|
| 30 min  | 1800    |
| 45 min  | 2700    |
| 48 min  | 2880    |
| 60 min  | 3600    |

---

Repeat Steps 1–4 for each episode being added to FAST distribution.
