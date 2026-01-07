// Media Library - Main Export
// T.O.N.Y. Series Media Asset Management

// Types
export type {
  AssetType,
  AssetStatus,
  AssetOrigin,
  Resolution,
  AspectRatio,
  SocialPlatform,
  ImagePreset,
  VideoPreset,
  VideoTechnical,
  ImageTechnical,
  AssetContent,
  AssetRights,
  HumanProvenance,
  AIProvenance,
  AssetProvenance,
  AssetWorkflow,
  BaseAsset,
  VideoAsset,
  ImageAsset,
  AudioAsset,
  MediaAsset,
  AssetListResponse,
  AssetResponse,
  AssetFilters,
} from './types';

// Config
export {
  MEDIA_CONFIG,
  IMAGE_PRESETS,
  VIDEO_PRESETS,
  SOCIAL_VIDEO_SPECS,
  ASSET_CATEGORIES,
  CACHE_HEADERS,
  NAMING_PATTERNS,
} from './config';

export type { AssetCategory } from './config';

// Utilities
export {
  buildImageUrl,
  buildVideoUrl,
  buildSocialVideoUrl,
  buildReviewUrl,
  buildStoragePath,
  generateVideoFilename,
  generateImageFilename,
  generateAIFilename,
  parseVideoFilename,
  getImageDerivatives,
  getResponsiveSrcSet,
  calculateAspectRatio,
  formatFileSize,
  formatDuration,
  isAIGenerated,
  inferCategory,
} from './utils';

// S3 Storage
export {
  getS3Client,
  isS3Configured,
  buildS3Key,
  uploadToS3,
  getUploadUrl,
  getDownloadUrl,
  getObjectMetadata,
  deleteFromS3,
  copyInS3,
  moveInS3,
  listObjects,
  listAllObjects,
  promoteAsset,
  archiveAsset,
  getBucketFolderStructure,
} from './s3';

export type { StoragePath } from './s3';

// Cloudinary
export {
  initCloudinary,
  isCloudinaryConfigured,
  isCloudinaryApiConfigured,
  getCloudName,
  buildCloudinaryUrl,
  buildCloudinaryPresetUrl,
  buildCloudinarySrcSet,
  buildBlurPlaceholder,
  uploadImage,
  uploadVideo,
  deleteAsset,
  generateUploadSignature,
  getCloudinaryFolder,
  buildSocialImageUrl,
  buildCloudinaryVideoUrl,
  buildVideoThumbnail,
  SOCIAL_TRANSFORMS,
} from './cloudinary';

export type { CloudinaryTransform, UploadOptions, UploadResponse, VideoTransform } from './cloudinary';

// Local Images
export {
  LOCAL_IMAGES,
  hasLocalImage,
  getLocalImagePath,
} from './local-images';
