// Media Utility Functions for T.O.N.Y. Series
// URL builders, variant generators, and helper functions

import { MEDIA_CONFIG, IMAGE_PRESETS, VIDEO_PRESETS, ASSET_CATEGORIES } from './config';
import type { ImagePreset, VideoPreset, AssetCategory, SocialPlatform, Resolution } from './types';
import {
  buildCloudinaryUrl,
  buildCloudinaryPresetUrl,
  buildCloudinarySrcSet,
  isCloudinaryConfigured,
  getCloudName,
} from './cloudinary';
import { getLocalImagePath } from './local-images';

/**
 * Build a CDN URL for an image asset
 * Supports four modes (in priority order):
 * 1. Local images (public folder)
 * 2. Development placeholder (picsum.photos)
 * 3. Cloudinary (on-the-fly transforms)
 * 4. Static CDN (pre-generated derivatives)
 */
export function buildImageUrl(
  category: AssetCategory | string,
  id: string,
  preset: ImagePreset = 'card',
  options?: {
    useCloudinary?: boolean;
    transforms?: {
      width?: number;
      height?: number;
      crop?: 'fill' | 'fit' | 'limit' | 'scale' | 'thumb' | 'pad';
      gravity?: 'auto' | 'face' | 'faces' | 'center';
      quality?: number | 'auto';
      format?: 'auto' | 'webp' | 'jpg' | 'png';
    };
  }
): string {
  const { cdn, placeholder, local } = MEDIA_CONFIG;

  // Priority 1: Check for local image
  if (local?.enabled) {
    const localPath = getLocalImagePath(category, id);
    if (localPath) {
      return localPath;
    }
  }

  // Priority 2: Use placeholder in development if enabled
  if (placeholder.enabled) {
    const { dimensions } = IMAGE_PRESETS[preset];
    return `${placeholder.baseUrl}/seed/${id}/${dimensions.width}/${dimensions.height}`;
  }

  // Use Cloudinary if configured and requested (or if no static CDN)
  const useCloudinary = options?.useCloudinary ?? isCloudinaryConfigured();
  if (useCloudinary && getCloudName()) {
    const publicId = `tony/${category}/${id}`;

    // Use custom transforms if provided
    if (options?.transforms) {
      return buildCloudinaryUrl(publicId, options.transforms);
    }

    // Use preset transforms
    return buildCloudinaryPresetUrl(publicId, preset);
  }

  // Fall back to static CDN
  const format = IMAGE_PRESETS[preset].format;
  return `${cdn.baseUrl}/${cdn.version}/${cdn.images}/${category}/${id}_${preset}.${format}`;
}

/**
 * Build a CDN URL for a video asset
 */
export function buildVideoUrl(
  id: string,
  preset: VideoPreset = '1080p'
): string {
  const { cdn } = MEDIA_CONFIG;
  return `${cdn.baseUrl}/${cdn.version}/${cdn.video}/${id}_${preset}.mp4`;
}

/**
 * Build a CDN URL for a social platform video variant
 */
export function buildSocialVideoUrl(
  id: string,
  platform: SocialPlatform
): string {
  const { cdn } = MEDIA_CONFIG;
  return `${cdn.baseUrl}/${cdn.version}/${cdn.video}/social/${platform}/${id}.mp4`;
}

/**
 * Build a review URL with signed token (placeholder - real implementation needs backend)
 */
export function buildReviewUrl(assetId: string, token: string): string {
  const { review } = MEDIA_CONFIG;
  return `${review.baseUrl}/${MEDIA_CONFIG.cdn.version}/wip/${assetId}?token=${token}`;
}

/**
 * Build an S3 storage path for an asset
 */
export function buildStoragePath(
  bucket: 'raw' | 'wip' | 'masters' | 'derivatives' | 'stills' | 'brand' | 'aiGenerated' | 'archive',
  filename: string,
  subPath?: string
): string {
  const { storage } = MEDIA_CONFIG;
  const basePath = storage.paths[bucket];
  return subPath ? `${basePath}/${subPath}/${filename}` : `${basePath}/${filename}`;
}

/**
 * Generate a filename following the naming convention
 */
export function generateVideoFilename(options: {
  season: number;
  episode: number;
  scene?: number;
  shot?: number;
  version: number;
  status: 'wip' | 'approved' | 'final';
  spec: string;
  ext?: string;
}): string {
  const { season, episode, scene, shot, version, status, spec, ext = 'mp4' } = options;

  let filename = `TONY_S${String(season).padStart(2, '0')}E${String(episode).padStart(2, '0')}`;

  if (scene !== undefined) {
    filename += `_SC${String(scene).padStart(2, '0')}`;
  }
  if (shot !== undefined) {
    filename += `_shot${String(shot).padStart(2, '0')}`;
  }

  filename += `_v${String(version).padStart(3, '0')}_${status}_${spec}.${ext}`;

  return filename;
}

/**
 * Generate an image filename following the naming convention
 */
export function generateImageFilename(options: {
  category: AssetCategory | string;
  subject: string;
  preset: ImagePreset;
  ext?: string;
}): string {
  const { category, subject, preset, ext = 'webp' } = options;
  // Sanitize subject to be URL-safe
  const safeSubject = subject.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return `TONY_${category}_${safeSubject}_${preset}.${ext}`;
}

/**
 * Generate an AI asset filename
 */
export function generateAIFilename(options: {
  type: string;
  version: number;
  status: 'exp' | 'approved';
  ext?: string;
}): string {
  const { type, version, status, ext = 'png' } = options;
  return `TONY_ai_${type}_v${String(version).padStart(3, '0')}_${status}.${ext}`;
}

/**
 * Parse a video filename to extract metadata
 */
export function parseVideoFilename(filename: string): {
  season: number;
  episode: number;
  scene?: number;
  shot?: number;
  version: number;
  status: string;
  spec: string;
  ext: string;
} | null {
  const match = filename.match(
    /^TONY_S(\d{2})E(\d{2})(?:_SC(\d{2}))?(?:_shot(\d{2}))?_v(\d{3})_(wip|approved|final)_(\w+)\.(\w+)$/
  );

  if (!match) return null;

  return {
    season: parseInt(match[1], 10),
    episode: parseInt(match[2], 10),
    scene: match[3] ? parseInt(match[3], 10) : undefined,
    shot: match[4] ? parseInt(match[4], 10) : undefined,
    version: parseInt(match[5], 10),
    status: match[6],
    spec: match[7],
    ext: match[8],
  };
}

/**
 * Get all derivative presets for an image
 */
export function getImageDerivatives(id: string, category: AssetCategory | string): Record<ImagePreset, string> {
  const presets: ImagePreset[] = ['thumb', 'card', 'hero', 'cast', 'og', 'mobile'];

  return presets.reduce((acc, preset) => {
    acc[preset] = buildImageUrl(category, id, preset);
    return acc;
  }, {} as Record<ImagePreset, string>);
}

/**
 * Get responsive image srcset for an asset
 * Uses Cloudinary for on-the-fly responsive images when available
 */
export function getResponsiveSrcSet(
  category: AssetCategory | string,
  id: string,
  options?: { useCloudinary?: boolean }
): string {
  const { placeholder } = MEDIA_CONFIG;

  if (placeholder.enabled) {
    // Return placeholder srcset
    return [
      `${placeholder.baseUrl}/seed/${id}/400/227 400w`,
      `${placeholder.baseUrl}/seed/${id}/600/340 600w`,
      `${placeholder.baseUrl}/seed/${id}/1200/680 1200w`,
      `${placeholder.baseUrl}/seed/${id}/1920/1080 1920w`,
    ].join(', ');
  }

  // Use Cloudinary for responsive srcset if configured
  const useCloudinary = options?.useCloudinary ?? isCloudinaryConfigured();
  if (useCloudinary && getCloudName()) {
    const publicId = `tony/${category}/${id}`;
    return buildCloudinarySrcSet(publicId, [400, 600, 800, 1200, 1600, 1920]);
  }

  return [
    `${buildImageUrl(category, id, 'mobile')} 400w`,
    `${buildImageUrl(category, id, 'card')} 600w`,
    `${buildImageUrl(category, id, 'hero')} 1920w`,
  ].join(', ');
}

/**
 * Calculate aspect ratio from resolution
 */
export function calculateAspectRatio(resolution: Resolution): string {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(resolution.width, resolution.height);
  return `${resolution.width / divisor}:${resolution.height / divisor}`;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format duration for display
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${minutes}:${String(secs).padStart(2, '0')}`;
}

/**
 * Check if asset is AI-generated based on provenance
 */
export function isAIGenerated(provenance: { origin: string }): boolean {
  return provenance.origin === 'ai-generated' || provenance.origin === 'ai-assisted';
}

/**
 * Get category from asset path or filename
 */
export function inferCategory(path: string): AssetCategory | null {
  for (const [key, value] of Object.entries(ASSET_CATEGORIES)) {
    if (path.includes(`/${value}/`) || path.includes(`_${value}_`)) {
      return value as AssetCategory;
    }
  }
  return null;
}

// Re-export types and config for convenience
export { MEDIA_CONFIG, IMAGE_PRESETS, VIDEO_PRESETS, ASSET_CATEGORIES };
export type { ImagePreset, VideoPreset, AssetCategory };
