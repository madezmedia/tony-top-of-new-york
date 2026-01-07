// S3 Client Utilities for T.O.N.Y. Media Asset Management
// Handles uploads, downloads, and presigned URLs

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  HeadObjectCommand,
  CopyObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { MEDIA_CONFIG } from './config';
import type { AssetCategory } from './config';
import type { AssetType, AssetStatus } from './types';

// S3 Client singleton
let s3Client: S3Client | null = null;

/**
 * Get or create S3 client instance
 */
export function getS3Client(): S3Client {
  if (!s3Client) {
    const accessKeyId = process.env.VITE_AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.VITE_AWS_SECRET_ACCESS_KEY;
    const region = process.env.VITE_AWS_REGION || MEDIA_CONFIG.storage.region;

    if (!accessKeyId || !secretAccessKey) {
      throw new Error('AWS credentials not configured. Set VITE_AWS_ACCESS_KEY_ID and VITE_AWS_SECRET_ACCESS_KEY.');
    }

    s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }
  return s3Client;
}

/**
 * Check if S3 is configured
 */
export function isS3Configured(): boolean {
  return !!(
    process.env.VITE_AWS_ACCESS_KEY_ID &&
    process.env.VITE_AWS_SECRET_ACCESS_KEY
  );
}

// Storage path types
export type StoragePath = keyof typeof MEDIA_CONFIG.storage.paths;

/**
 * Build S3 key (path) for an asset
 */
export function buildS3Key(options: {
  path: StoragePath;
  category?: AssetCategory;
  season?: number;
  episode?: number;
  filename: string;
}): string {
  const { path, category, season, episode, filename } = options;
  const basePath = MEDIA_CONFIG.storage.paths[path];

  const parts = [basePath];

  if (category) {
    parts.push(category);
  }

  if (season !== undefined && episode !== undefined) {
    parts.push(`TONY_S${String(season).padStart(2, '0')}_E${String(episode).padStart(2, '0')}`);
  } else if (season !== undefined) {
    parts.push(`TONY_S${String(season).padStart(2, '0')}`);
  }

  parts.push(filename);

  return parts.join('/');
}

/**
 * Upload a file to S3
 */
export async function uploadToS3(options: {
  key: string;
  body: Buffer | Blob | ReadableStream;
  contentType: string;
  metadata?: Record<string, string>;
  cacheControl?: string;
}): Promise<{ key: string; etag: string }> {
  const client = getS3Client();
  const bucket = process.env.VITE_S3_BUCKET || MEDIA_CONFIG.storage.bucket;

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: options.key,
    Body: options.body,
    ContentType: options.contentType,
    Metadata: options.metadata,
    CacheControl: options.cacheControl || 'public, max-age=31536000, immutable',
  });

  const response = await client.send(command);

  return {
    key: options.key,
    etag: response.ETag || '',
  };
}

/**
 * Get a presigned URL for uploading
 */
export async function getUploadUrl(options: {
  key: string;
  contentType: string;
  expiresIn?: number;
}): Promise<string> {
  const client = getS3Client();
  const bucket = process.env.VITE_S3_BUCKET || MEDIA_CONFIG.storage.bucket;

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: options.key,
    ContentType: options.contentType,
  });

  return getSignedUrl(client, command, {
    expiresIn: options.expiresIn || 3600, // 1 hour default
  });
}

/**
 * Get a presigned URL for downloading/viewing
 */
export async function getDownloadUrl(options: {
  key: string;
  expiresIn?: number;
  responseContentDisposition?: string;
}): Promise<string> {
  const client = getS3Client();
  const bucket = process.env.VITE_S3_BUCKET || MEDIA_CONFIG.storage.bucket;

  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: options.key,
    ResponseContentDisposition: options.responseContentDisposition,
  });

  return getSignedUrl(client, command, {
    expiresIn: options.expiresIn || MEDIA_CONFIG.review.tokenExpiry,
  });
}

/**
 * Get object metadata without downloading content
 */
export async function getObjectMetadata(key: string): Promise<{
  contentType: string;
  contentLength: number;
  lastModified: Date;
  metadata: Record<string, string>;
} | null> {
  const client = getS3Client();
  const bucket = process.env.VITE_S3_BUCKET || MEDIA_CONFIG.storage.bucket;

  try {
    const command = new HeadObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const response = await client.send(command);

    return {
      contentType: response.ContentType || 'application/octet-stream',
      contentLength: response.ContentLength || 0,
      lastModified: response.LastModified || new Date(),
      metadata: response.Metadata || {},
    };
  } catch (error) {
    if ((error as any).name === 'NotFound') {
      return null;
    }
    throw error;
  }
}

/**
 * Delete an object from S3
 */
export async function deleteFromS3(key: string): Promise<void> {
  const client = getS3Client();
  const bucket = process.env.VITE_S3_BUCKET || MEDIA_CONFIG.storage.bucket;

  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  await client.send(command);
}

/**
 * Copy an object within S3 (for moving between paths)
 */
export async function copyInS3(options: {
  sourceKey: string;
  destinationKey: string;
  metadata?: Record<string, string>;
}): Promise<void> {
  const client = getS3Client();
  const bucket = process.env.VITE_S3_BUCKET || MEDIA_CONFIG.storage.bucket;

  const command = new CopyObjectCommand({
    Bucket: bucket,
    CopySource: `${bucket}/${options.sourceKey}`,
    Key: options.destinationKey,
    Metadata: options.metadata,
    MetadataDirective: options.metadata ? 'REPLACE' : 'COPY',
  });

  await client.send(command);
}

/**
 * Move an object within S3 (copy + delete)
 */
export async function moveInS3(options: {
  sourceKey: string;
  destinationKey: string;
  metadata?: Record<string, string>;
}): Promise<void> {
  await copyInS3(options);
  await deleteFromS3(options.sourceKey);
}

/**
 * List objects in a path
 */
export async function listObjects(options: {
  prefix: string;
  maxKeys?: number;
  continuationToken?: string;
}): Promise<{
  objects: Array<{
    key: string;
    size: number;
    lastModified: Date;
  }>;
  nextToken?: string;
  isTruncated: boolean;
}> {
  const client = getS3Client();
  const bucket = process.env.VITE_S3_BUCKET || MEDIA_CONFIG.storage.bucket;

  const command = new ListObjectsV2Command({
    Bucket: bucket,
    Prefix: options.prefix,
    MaxKeys: options.maxKeys || 100,
    ContinuationToken: options.continuationToken,
  });

  const response = await client.send(command);

  return {
    objects: (response.Contents || []).map((obj) => ({
      key: obj.Key || '',
      size: obj.Size || 0,
      lastModified: obj.LastModified || new Date(),
    })),
    nextToken: response.NextContinuationToken,
    isTruncated: response.IsTruncated || false,
  };
}

/**
 * Get all objects in a path (handles pagination)
 */
export async function listAllObjects(prefix: string): Promise<Array<{
  key: string;
  size: number;
  lastModified: Date;
}>> {
  const allObjects: Array<{ key: string; size: number; lastModified: Date }> = [];
  let continuationToken: string | undefined;

  do {
    const result = await listObjects({
      prefix,
      maxKeys: 1000,
      continuationToken,
    });

    allObjects.push(...result.objects);
    continuationToken = result.nextToken;
  } while (continuationToken);

  return allObjects;
}

// Workflow operations

/**
 * Move asset through workflow stages
 */
export async function promoteAsset(options: {
  currentKey: string;
  fromPath: StoragePath;
  toPath: StoragePath;
  newStatus?: AssetStatus;
}): Promise<string> {
  const { currentKey, fromPath, toPath, newStatus } = options;

  // Replace path prefix
  const fromPrefix = MEDIA_CONFIG.storage.paths[fromPath];
  const toPrefix = MEDIA_CONFIG.storage.paths[toPath];

  let newKey = currentKey.replace(fromPrefix, toPrefix);

  // Update status in filename if provided
  if (newStatus) {
    newKey = newKey.replace(/_wip_/, `_${newStatus}_`);
  }

  await moveInS3({
    sourceKey: currentKey,
    destinationKey: newKey,
    metadata: {
      'x-amz-meta-promoted-from': currentKey,
      'x-amz-meta-promoted-at': new Date().toISOString(),
    },
  });

  return newKey;
}

/**
 * Archive an asset
 */
export async function archiveAsset(key: string): Promise<string> {
  const archivePath = MEDIA_CONFIG.storage.paths.archive;
  const date = new Date();
  const quarter = `Q${Math.ceil((date.getMonth() + 1) / 3)}`;
  const archiveKey = `${archivePath}/${date.getFullYear()}-${quarter}/${key.split('/').pop()}`;

  await moveInS3({
    sourceKey: key,
    destinationKey: archiveKey,
    metadata: {
      'x-amz-meta-archived-from': key,
      'x-amz-meta-archived-at': date.toISOString(),
    },
  });

  return archiveKey;
}

/**
 * Generate S3 bucket folder structure for initialization
 */
export function getBucketFolderStructure(): string[] {
  const { paths } = MEDIA_CONFIG.storage;
  const folders: string[] = [];

  // Root folders from config
  Object.values(paths).forEach((path) => {
    folders.push(`${path}/`);
  });

  // Subfolders based on plan
  const subfolders = [
    // Raw
    `${paths.raw}/video/`,
    `${paths.raw}/audio/`,
    `${paths.raw}/stills/`,
    // WIP
    `${paths.wip}/video/`,
    `${paths.wip}/graphics/`,
    // Masters
    `${paths.masters}/video/`,
    `${paths.masters}/audio/`,
    `${paths.masters}/stills/`,
    // Derivatives
    `${paths.derivatives}/web/video/`,
    `${paths.derivatives}/web/images/`,
    `${paths.derivatives}/social/tiktok/`,
    `${paths.derivatives}/social/reels/`,
    `${paths.derivatives}/social/youtube/`,
    `${paths.derivatives}/social/youtube_shorts/`,
    `${paths.derivatives}/social/twitter/`,
    `${paths.derivatives}/mobile/`,
    // Stills
    `${paths.stills}/cast/`,
    `${paths.stills}/episodes/`,
    `${paths.stills}/bts/`,
    `${paths.stills}/press/`,
    // Brand
    `${paths.brand}/logos/`,
    `${paths.brand}/fonts/`,
    `${paths.brand}/colors/`,
    // AI Generated
    `${paths.aiGenerated}/images/approved/`,
    `${paths.aiGenerated}/images/experimental/`,
    `${paths.aiGenerated}/video/approved/`,
    `${paths.aiGenerated}/video/experimental/`,
    `${paths.aiGenerated}/motion_graphics/`,
  ];

  return [...folders, ...subfolders];
}
