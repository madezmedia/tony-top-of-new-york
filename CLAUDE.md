# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
npm run dev      # Start dev server on port 3000
npm run build    # Build for production
npm run preview  # Preview production build
```

## Architecture

React 19 + TypeScript + Vite promotional website for a TV series.

**Key Files:**
- `App.tsx` - Main app component that orchestrates all sections
- `constants.ts` - Static data (cast members, episodes, news items, navigation)
- `types.ts` - TypeScript interfaces (CastMember, Episode, NewsItem, NavLink)
- `utils/animations.ts` - Framer Motion animation presets
- `lib/media/` - Media asset management (types, config, URL builders)

**Components (`/components`):**
- Section components: Hero, Overview, Cast, Episodes, News, Contact, Footer, Navbar
- Reusable UI in `/components/ui`: Button, Section wrapper

## Key Patterns

**Animation System:**
- All animation variants defined in `utils/animations.ts` (fadeIn, slideUp, containerVariants, itemVariants, hoverScale, glowPulse)
- Use these presets rather than creating inline animation configs
- Framer Motion's `useScroll` and `useTransform` for parallax effects

**Styling:**
- Tailwind CSS loaded via CDN in `index.html`
- Custom theme colors: primary gold (#DAAB2D), neutral deep blacks (#020B13)
- Path alias: `@/*` resolves to project root

**Data Management:**
- All content data lives in `constants.ts`
- Type all data with interfaces from `types.ts`

## Media Asset System

**URL Builder** (`lib/media/utils.ts`):
```typescript
import { buildImageUrl } from './lib/media';

// Automatically uses placeholders in dev, CDN in production
buildImageUrl('cast', 'michael-steven-paul', 'cast')
// Dev: https://picsum.photos/seed/michael-steven-paul/600/900
// Prod: https://cdn.tonyseries.com/v1/images/cast/michael-steven-paul_cast.webp
```

**Image Presets:** `thumb` (300x170), `card` (600x340), `hero` (1920x1080), `cast` (600x900), `og` (1200x630), `mobile` (400x227)

**Video Presets:** `4k`, `1080p`, `720p`, `480p`, `vertical` (9:16)

**Configuration:** Set `VITE_CDN_URL` env var to switch from placeholders to production CDN.
