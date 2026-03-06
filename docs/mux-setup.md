# Mux One-Time Setup

Run these commands once to provision the Mux resources required by the API.
Set `MUX_TOKEN_ID` and `MUX_TOKEN_SECRET` in your shell before running them.

---

## 1. Create a JWT signing key

```bash
curl -X POST https://api.mux.com/system/v1/signing-keys \
  -H "Content-Type: application/json" \
  -u "$MUX_TOKEN_ID:$MUX_TOKEN_SECRET"
```

From the response:
- `data.id` → `MUX_SIGNING_KEY_ID`
- `data.private_key` (already base64-encoded) → `MUX_SIGNING_PRIVATE_KEY`

---

## 2. Create the website playback restriction

Domain-locked; direct access without a Referer header is blocked.

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

From the response:
- `data.id` → `MUX_PLAYBACK_RESTRICTION_ID`

---

## 3. Create the Roku playback restriction

Allows any domain and requests without a Referer header (required for FAST/Roku streaming),
but blocks blank or high-risk user agents.

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

From the response:
- `data.id` → `MUX_PLAYBACK_RESTRICTION_ROKU_ID`

---

## 4. Add vars to Vercel

```bash
vercel env add MUX_SIGNING_KEY_ID production
vercel env add MUX_SIGNING_PRIVATE_KEY production
vercel env add MUX_PLAYBACK_RESTRICTION_ID production
vercel env add MUX_PLAYBACK_RESTRICTION_ROKU_ID production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add VAST_TAG_URL production
```
