# Apple TV Aggregator Submission Checklist

**Feed URL:** `https://tony-top-of-new-york.vercel.app/api/feed.xml`
**Contact Email:** `press@tonyseries.com`

---

## Pre-Submission Checklist

Complete all of the following before submitting to any partner.

- [ ] Feed URL returns valid MRSS XML
  ```
  curl https://tony-top-of-new-york.vercel.app/api/feed.xml
  ```
- [ ] W3C feed validator passes — https://validator.w3.org/feed/
- [ ] At least one episode has `is_fast_available = true` and `mux_public_playback_id` set in Supabase (see `docs/fast-episode-setup.md`)
- [ ] VAST ad tag URL configured in Vercel env (`VAST_TAG_URL`)
- [ ] Show artwork prepared:
  - [ ] Square logo: 1400×1400px minimum (PNG or JPG)
  - [ ] 16:9 hero image: 1920×1080px (PNG or JPG)
- [ ] Content rights confirmed (all content owned, no unlicensed music)
- [ ] Partner accounts created with `press@tonyseries.com`

---

## Priority Submission Order

Submit to these partners first.

| Priority | Partner | Portal | Notes |
|----------|---------|--------|-------|
| 1 | Wurl | wurl.com/become-a-partner | Largest Apple TV distributor |
| 2 | Zype (Brightcove) | app.zype.com → Distribution → Apple TV | Major FAST platform |
| 3 | Applicaster | applicaster.com/contact | Multi-platform publisher |
| 4–16 | Additional partners | tvpartners.apple.com | Confirm current list at Apple portal |

---

## Per-Partner Submission Steps

Repeat the following steps for each partner.

- [ ] Create account with `press@tonyseries.com`
- [ ] Navigate to content/channel submission form
- [ ] Enter feed URL: `https://tony-top-of-new-york.vercel.app/api/feed.xml`
- [ ] Upload show artwork (both square and 16:9 versions)
- [ ] Confirm content category: Drama / Crime
- [ ] Confirm content rating: TV-MA
- [ ] Confirm FAST monetization (ad-supported, free to viewers)
- [ ] Submit and note confirmation number/date
- [ ] Expected review time: 5–15 business days per partner

---

## Submission Tracking

| Partner | Submitted | Confirmation | Status | Live Date |
|---------|-----------|--------------|--------|-----------|
| Wurl | | | | |
| Zype | | | | |
| Applicaster | | | | |
| (13 more) | | | | |

---

## Notes

- Apple's partner roster evolves; verify the current list at tvpartners.apple.com before each submission wave.
- Some partners may charge onboarding fees — confirm before signing any agreements.
- Keep the MRSS feed URL stable — partners cache the URL permanently.
