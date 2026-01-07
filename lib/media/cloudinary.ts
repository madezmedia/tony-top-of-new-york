// Cloudinary Integration for T.O.N.Y. Media Asset Management
// Handles image transformations, optimization, and CDN delivery
//
// NOTE: This module is split into browser-safe and server-side functions.
// Browser-safe functions (URL builders) work without the full cloudinary SDK.
// Server-side functions (uploads) require the cloudinary SDK and Node.js.

import { IMAGE_PRESETS, MEDIA_CONFIG } from './config';
import type { ImagePreset } from './types';

// Lazy-load cloudinary SDK only when needed (server-side operations)
let cloudinaryInstance: any = null;

async function getCloudinarySdk() {
  if (!cloudinaryInstance) {
    // Dynamic import to avoid bundling in browser
    const { v2 } = await import('cloudinary');
    cloudinaryInstance = v2;
  }
  return cloudinaryInstance;
}

/**
 * Check if Cloudinary is configured (browser-safe)
 * Only checks if cloud name is set (sufficient for URL building)
 */
export function isCloudinaryConfigured(): boolean {
  return !!process.env.VITE_CLOUDINARY_CLOUD_NAME;
}

/**
 * Check if Cloudinary API is configured (for uploads, requires secrets)
 */
export function isCloudinaryApiConfigured(): boolean {
  return !!(
    process.env.VITE_CLOUDINARY_CLOUD_NAME &&
    process.env.VITE_CLOUDINARY_API_KEY &&
    process.env.VITE_CLOUDINARY_API_SECRET
  );
}

/**
 * Initialize Cloudinary configuration (server-side only)
 */
export async function initCloudinary(): Promise<boolean> {
  const cloudName = process.env.VITE_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.VITE_CLOUDINARY_API_KEY;
  const apiSecret = process.env.VITE_CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    console.warn('Cloudinary not configured. Set VITE_CLOUDINARY_* environment variables.');
    return false;
  }

  const cloudinary = await getCloudinarySdk();
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  return true;
}

/**
 * Get Cloudinary cloud name
 */
export function getCloudName(): string {
  return process.env.VITE_CLOUDINARY_CLOUD_NAME || '';
}

// Transformation types
export interface CloudinaryTransform {
  width?: number;
  height?: number;
  crop?: 'fill' | 'fit' | 'limit' | 'scale' | 'thumb' | 'pad';
  gravity?: 'auto' | 'face' | 'faces' | 'center' | 'north' | 'south' | 'east' | 'west';
  quality?: number | 'auto' | 'auto:best' | 'auto:good' | 'auto:eco' | 'auto:low';
  format?: 'auto' | 'webp' | 'jpg' | 'png' | 'avif';
  effect?: string;
  background?: string;
  dpr?: number | 'auto';
  aspectRatio?: string;
}

/**
 * Build Cloudinary URL with transformations
 */
export function buildCloudinaryUrl(
  publicId: string,
  transforms: CloudinaryTransform = {}
): string {
  const cloudName = getCloudName();

  if (!cloudName) {
    // Fall back to placeholder if Cloudinary not configured
    const width = transforms.width || 600;
    const height = transforms.height || 400;
    return `${MEDIA_CONFIG.placeholder.baseUrl}/seed/${publicId}/${width}/${height}`;
  }

  // Build transformation string
  const parts: string[] = [];

  if (transforms.width) parts.push(`w_${transforms.width}`);
  if (transforms.height) parts.push(`h_${transforms.height}`);
  if (transforms.crop) parts.push(`c_${transforms.crop}`);
  if (transforms.gravity) parts.push(`g_${transforms.gravity}`);
  if (transforms.quality) parts.push(`q_${transforms.quality}`);
  if (transforms.format) parts.push(`f_${transforms.format}`);
  if (transforms.effect) parts.push(`e_${transforms.effect}`);
  if (transforms.background) parts.push(`b_${transforms.background}`);
  if (transforms.dpr) parts.push(`dpr_${transforms.dpr}`);
  if (transforms.aspectRatio) parts.push(`ar_${transforms.aspectRatio}`);

  const transformString = parts.length > 0 ? parts.join(',') + '/' : '';

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformString}${publicId}`;
}

/**
 * Build Cloudinary URL using preset configuration
 */
export function buildCloudinaryPresetUrl(
  publicId: string,
  preset: ImagePreset
): string {
  const config = IMAGE_PRESETS[preset];

  return buildCloudinaryUrl(publicId, {
    width: config.dimensions.width,
    height: config.dimensions.height,
    crop: 'fill',
    gravity: preset === 'cast' ? 'face' : 'auto',
    quality: config.quality,
    format: config.format === 'webp' ? 'webp' : 'jpg',
  });
}

/**
 * Build responsive srcset for images
 */
export function buildCloudinarySrcSet(
  publicId: string,
  widths: number[] = [400, 600, 800, 1200, 1600]
): string {
  return widths
    .map((w) => {
      const url = buildCloudinaryUrl(publicId, {
        width: w,
        crop: 'limit',
        quality: 'auto',
        format: 'auto',
      });
      return `${url} ${w}w`;
    })
    .join(', ');
}

/**
 * Generate placeholder blur hash URL (low quality preview)
 */
export function buildBlurPlaceholder(publicId: string): string {
  return buildCloudinaryUrl(publicId, {
    width: 30,
    height: 30,
    crop: 'limit',
    quality: 20,
    effect: 'blur:1000',
    format: 'webp',
  });
}

// Upload functions (for server-side use)

export interface UploadOptions {
  folder: string;
  publicId?: string;
  tags?: string[];
  context?: Record<string, string>;
  transformation?: CloudinaryTransform;
  overwrite?: boolean;
}

// Upload response type (matches Cloudinary's UploadApiResponse)
export interface UploadResponse {
  public_id: string;
  version: number;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  bytes: number;
  type: string;
  url: string;
  secure_url: string;
}

/**
 * Upload image to Cloudinary (server-side only)
 */
export async function uploadImage(
  file: string | Buffer,
  options: UploadOptions
): Promise<UploadResponse> {
  if (!isCloudinaryApiConfigured()) {
    throw new Error('Cloudinary API not configured. Set VITE_CLOUDINARY_* environment variables.');
  }

  const cloudinary = await getCloudinarySdk();
  await initCloudinary();

  const uploadOptions: Record<string, any> = {
    folder: options.folder,
    resource_type: 'image',
    overwrite: options.overwrite ?? false,
  };

  if (options.publicId) uploadOptions.public_id = options.publicId;
  if (options.tags) uploadOptions.tags = options.tags;
  if (options.context) uploadOptions.context = options.context;
  if (options.transformation) {
    uploadOptions.transformation = options.transformation;
  }

  return new Promise((resolve, reject) => {
    const callback = (error: any, result: any) => {
      if (error) reject(error);
      else if (result) resolve(result);
      else reject(new Error('Unknown upload error'));
    };

    if (typeof file === 'string') {
      // URL or file path
      cloudinary.uploader.upload(file, uploadOptions, callback);
    } else {
      // Buffer
      cloudinary.uploader.upload_stream(uploadOptions, callback).end(file);
    }
  });
}

/**
 * Upload video to Cloudinary (server-side only)
 */
export async function uploadVideo(
  file: string,
  options: UploadOptions
): Promise<UploadResponse> {
  if (!isCloudinaryApiConfigured()) {
    throw new Error('Cloudinary API not configured. Set VITE_CLOUDINARY_* environment variables.');
  }

  const cloudinary = await getCloudinarySdk();
  await initCloudinary();

  return cloudinary.uploader.upload(file, {
    folder: options.folder,
    resource_type: 'video',
    public_id: options.publicId,
    tags: options.tags,
    context: options.context,
    overwrite: options.overwrite ?? false,
  });
}

/**
 * Delete asset from Cloudinary (server-side only)
 */
export async function deleteAsset(
  publicId: string,
  resourceType: 'image' | 'video' | 'raw' = 'image'
): Promise<{ result: string }> {
  if (!isCloudinaryApiConfigured()) {
    throw new Error('Cloudinary API not configured. Set VITE_CLOUDINARY_* environment variables.');
  }

  const cloudinary = await getCloudinarySdk();
  await initCloudinary();

  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}

/**
 * Generate upload signature for client-side uploads (server-side only)
 */
export async function generateUploadSignature(options: {
  folder: string;
  publicId?: string;
  tags?: string[];
  timestamp?: number;
}): Promise<{ signature: string; timestamp: number; apiKey: string; cloudName: string }> {
  if (!isCloudinaryApiConfigured()) {
    throw new Error('Cloudinary API not configured. Set VITE_CLOUDINARY_* environment variables.');
  }

  const cloudinary = await getCloudinarySdk();
  await initCloudinary();

  const timestamp = options.timestamp || Math.round(Date.now() / 1000);
  const params: Record<string, any> = {
    timestamp,
    folder: options.folder,
  };

  if (options.publicId) params.public_id = options.publicId;
  if (options.tags) params.tags = options.tags.join(',');

  const signature = cloudinary.utils.api_sign_request(
    params,
    process.env.VITE_CLOUDINARY_API_SECRET!
  );

  return {
    signature,
    timestamp,
    apiKey: process.env.VITE_CLOUDINARY_API_KEY!,
    cloudName: getCloudName(),
  };
}

// Folder organization helpers

/**
 * Get Cloudinary folder path for asset type
 */
export function getCloudinaryFolder(options: {
  category: string;
  season?: number;
  episode?: number;
  isAI?: boolean;
}): string {
  const { category, season, episode, isAI } = options;
  const parts = ['tony'];

  if (isAI) {
    parts.push('ai_generated');
  }

  parts.push(category);

  if (season !== undefined) {
    parts.push(`s${String(season).padStart(2, '0')}`);
    if (episode !== undefined) {
      parts.push(`e${String(episode).padStart(2, '0')}`);
    }
  }

  return parts.join('/');
}

// Social media optimized transforms

export const SOCIAL_TRANSFORMS = {
  og: {
    width: 1200,
    height: 630,
    crop: 'fill' as const,
    gravity: 'auto' as const,
    quality: 85,
    format: 'jpg' as const,
  },
  twitter: {
    width: 1200,
    height: 600,
    crop: 'fill' as const,
    gravity: 'auto' as const,
    quality: 85,
    format: 'jpg' as const,
  },
  instagram: {
    width: 1080,
    height: 1080,
    crop: 'fill' as const,
    gravity: 'face' as const,
    quality: 90,
    format: 'jpg' as const,
  },
  instagramStory: {
    width: 1080,
    height: 1920,
    crop: 'fill' as const,
    gravity: 'auto' as const,
    quality: 90,
    format: 'jpg' as const,
  },
} as const;

/**
 * Build social media optimized image URL
 */
export function buildSocialImageUrl(
  publicId: string,
  platform: keyof typeof SOCIAL_TRANSFORMS
): string {
  return buildCloudinaryUrl(publicId, SOCIAL_TRANSFORMS[platform]);
}

// Video transformations

export interface VideoTransform {
  width?: number;
  height?: number;
  crop?: 'fill' | 'fit' | 'limit' | 'scale' | 'pad';
  quality?: number | 'auto';
  format?: 'mp4' | 'webm' | 'auto';
  startOffset?: number;
  endOffset?: number;
  duration?: number;
  audioCodec?: 'aac' | 'none';
  videoCodec?: 'h264' | 'h265' | 'vp9' | 'auto';
}

/**
 * Build Cloudinary video URL with transformations
 */
export function buildCloudinaryVideoUrl(
  publicId: string,
  transforms: VideoTransform = {}
): string {
  const cloudName = getCloudName();

  if (!cloudName) {
    return ''; // No placeholder for video
  }

  const parts: string[] = [];

  if (transforms.width) parts.push(`w_${transforms.width}`);
  if (transforms.height) parts.push(`h_${transforms.height}`);
  if (transforms.crop) parts.push(`c_${transforms.crop}`);
  if (transforms.quality) parts.push(`q_${transforms.quality}`);
  if (transforms.format) parts.push(`f_${transforms.format}`);
  if (transforms.startOffset !== undefined) parts.push(`so_${transforms.startOffset}`);
  if (transforms.endOffset !== undefined) parts.push(`eo_${transforms.endOffset}`);
  if (transforms.duration !== undefined) parts.push(`du_${transforms.duration}`);
  if (transforms.audioCodec) parts.push(`ac_${transforms.audioCodec}`);
  if (transforms.videoCodec) parts.push(`vc_${transforms.videoCodec}`);

  const transformString = parts.length > 0 ? parts.join(',') + '/' : '';

  return `https://res.cloudinary.com/${cloudName}/video/upload/${transformString}${publicId}`;
}

/**
 * Generate video thumbnail from Cloudinary video
 */
export function buildVideoThumbnail(
  publicId: string,
  options: {
    time?: number; // seconds
    preset?: ImagePreset;
  } = {}
): string {
  const cloudName = getCloudName();

  if (!cloudName) {
    return `${MEDIA_CONFIG.placeholder.baseUrl}/seed/${publicId}/600/340`;
  }

  const preset = options.preset || 'card';
  const config = IMAGE_PRESETS[preset];
  const time = options.time ?? 5;

  return `https://res.cloudinary.com/${cloudName}/video/upload/so_${time},w_${config.dimensions.width},h_${config.dimensions.height},c_fill,f_jpg,q_${config.quality}/${publicId}.jpg`;
}
