// Media Configuration for T.O.N.Y. Series
// CDN URLs, bucket names, and preset configurations

import type { ImagePreset, VideoPreset, AspectRatio, Resolution } from './types';

// Environment-based CDN configuration
export const MEDIA_CONFIG = {
  // CDN Base URLs
  cdn: {
    baseUrl: process.env.VITE_CDN_URL || 'https://cdn.tonyseries.com',
    version: 'v1',
    images: 'images',
    video: 'video',
    audio: 'audio',
  },

  // S3 Bucket Configuration
  storage: {
    bucket: process.env.VITE_S3_BUCKET || 'tony-media-assets',
    region: process.env.VITE_S3_REGION || 'us-east-1',
    paths: {
      raw: 'raw',
      wip: 'wip',
      masters: 'masters',
      derivatives: 'derivatives',
      stills: 'stills',
      brand: 'brand',
      aiGenerated: 'ai_generated',
      archive: 'archive',
    },
  },

  // Review URLs (for internal review, signed URLs)
  review: {
    baseUrl: process.env.VITE_REVIEW_URL || 'https://review.tonyseries.com',
    tokenExpiry: 24 * 60 * 60, // 24 hours in seconds
  },

  // Fallback to placeholder service during development
  placeholder: {
    enabled: process.env.NODE_ENV === 'development',
    baseUrl: 'https://picsum.photos',
  },

  // Local images served from public folder
  local: {
    enabled: true,
    basePath: '/images',
  },
} as const;

// Image preset configurations
export const IMAGE_PRESETS: Record<ImagePreset, {
  dimensions: Resolution;
  format: 'webp' | 'jpg';
  quality: number;
  description: string;
}> = {
  thumb: {
    dimensions: { width: 300, height: 170 },
    format: 'webp',
    quality: 80,
    description: 'Grid thumbnails',
  },
  card: {
    dimensions: { width: 600, height: 340 },
    format: 'webp',
    quality: 85,
    description: 'Episode cards',
  },
  hero: {
    dimensions: { width: 1920, height: 1080 },
    format: 'webp',
    quality: 90,
    description: 'Hero backgrounds',
  },
  cast: {
    dimensions: { width: 600, height: 900 },
    format: 'webp',
    quality: 85,
    description: 'Cast portraits (2:3)',
  },
  og: {
    dimensions: { width: 1200, height: 630 },
    format: 'jpg',
    quality: 85,
    description: 'Open Graph / social sharing',
  },
  mobile: {
    dimensions: { width: 400, height: 227 },
    format: 'webp',
    quality: 80,
    description: 'Mobile optimized cards',
  },
};

// Video preset configurations
export const VIDEO_PRESETS: Record<VideoPreset, {
  resolution: Resolution;
  bitrate: number; // Mbps
  codec: string;
  description: string;
}> = {
  '4k': {
    resolution: { width: 3840, height: 2160 },
    bitrate: 20,
    codec: 'H.265',
    description: 'Master quality 4K',
  },
  '1080p': {
    resolution: { width: 1920, height: 1080 },
    bitrate: 8,
    codec: 'H.264',
    description: 'Web HD quality',
  },
  '720p': {
    resolution: { width: 1280, height: 720 },
    bitrate: 4,
    codec: 'H.264',
    description: 'Web SD quality',
  },
  '480p': {
    resolution: { width: 854, height: 480 },
    bitrate: 2,
    codec: 'H.264',
    description: 'Mobile quality',
  },
  vertical: {
    resolution: { width: 1080, height: 1920 },
    bitrate: 6,
    codec: 'H.264',
    description: 'Social vertical (9:16)',
  },
};

// Social platform video specifications
export const SOCIAL_VIDEO_SPECS: Record<string, {
  aspectRatio: AspectRatio;
  resolution: Resolution;
  maxDuration: number; // seconds
  maxFileSize: number; // MB
}> = {
  tiktok: {
    aspectRatio: '9:16',
    resolution: { width: 1080, height: 1920 },
    maxDuration: 180,
    maxFileSize: 287,
  },
  instagram_reels: {
    aspectRatio: '9:16',
    resolution: { width: 1080, height: 1920 },
    maxDuration: 90,
    maxFileSize: 250,
  },
  youtube_shorts: {
    aspectRatio: '9:16',
    resolution: { width: 1080, height: 1920 },
    maxDuration: 60,
    maxFileSize: 500,
  },
  youtube: {
    aspectRatio: '16:9',
    resolution: { width: 1920, height: 1080 },
    maxDuration: 43200, // 12 hours
    maxFileSize: 256000, // 256GB
  },
  twitter: {
    aspectRatio: '1:1',
    resolution: { width: 1080, height: 1080 },
    maxDuration: 140,
    maxFileSize: 512,
  },
  facebook: {
    aspectRatio: '16:9',
    resolution: { width: 1920, height: 1080 },
    maxDuration: 14400, // 4 hours
    maxFileSize: 10000,
  },
};

// Asset categories for organization
export const ASSET_CATEGORIES = {
  cast: 'cast',
  episodes: 'episodes',
  bts: 'bts',
  press: 'press',
  logos: 'logos',
  promotional: 'promotional',
  social: 'social',
} as const;

export type AssetCategory = typeof ASSET_CATEGORIES[keyof typeof ASSET_CATEGORIES];

// Cache control headers
export const CACHE_HEADERS = {
  immutable: 'public, max-age=31536000, immutable',
  dynamic: 'public, max-age=86400, stale-while-revalidate=3600',
  private: 'private, no-cache',
} as const;

// File naming patterns
export const NAMING_PATTERNS = {
  // {PROJECT}_{SEASON}{EPISODE}_{SCENE}_{SHOT}_{VERSION}_{STATUS}_{SPEC}.{EXT}
  video: /^TONY_S(\d{2})E(\d{2})(?:_SC(\d{2}))?(?:_shot(\d{2}))?_v(\d{3})_(wip|approved|final)_(\w+)\.(\w+)$/,
  // {PROJECT}_{CATEGORY}_{SUBJECT}_{PRESET}.{EXT}
  image: /^TONY_(\w+)_([a-z0-9-]+)_(\w+)\.(\w+)$/,
  // AI generated: {PROJECT}_ai_{TYPE}_v{VERSION}_{STATUS}.{EXT}
  aiGenerated: /^TONY_ai_(\w+)_v(\d{3})_(exp|approved)\.(\w+)$/,
} as const;
