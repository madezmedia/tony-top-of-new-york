// Media Asset Type Definitions for T.O.N.Y. Series

// Asset Types
export type AssetType = 'video' | 'image' | 'audio';
export type AssetStatus = 'ingested' | 'cataloged' | 'wip' | 'in_review' | 'approved' | 'published' | 'archived';
export type AssetOrigin = 'human-created' | 'ai-generated' | 'ai-assisted';

// Resolution
export interface Resolution {
  width: number;
  height: number;
}

// Aspect Ratios
export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:3' | '2:3' | '3:2' | '21:9';

// Social Platforms
export type SocialPlatform = 'youtube' | 'tiktok' | 'instagram' | 'twitter' | 'facebook' | 'discord';

// Image Presets
export type ImagePreset = 'thumb' | 'card' | 'hero' | 'cast' | 'og' | 'mobile';

// Video Quality Presets
export type VideoPreset = '4k' | '1080p' | '720p' | '480p' | 'vertical';

// Technical metadata for video assets
export interface VideoTechnical {
  codec: string;
  container: string;
  resolution: Resolution;
  aspectRatio: AspectRatio;
  duration: number; // seconds
  fps: number;
  bitrate: number; // bps
  colorSpace: string;
  audioCodec?: string;
  audioChannels?: number;
  fileSize: number; // bytes
}

// Technical metadata for image assets
export interface ImageTechnical {
  format: 'webp' | 'jpg' | 'png' | 'avif' | 'svg' | 'tif';
  resolution: Resolution;
  aspectRatio: AspectRatio;
  colorSpace: string;
  fileSize: number;
  hasAlpha: boolean;
}

// Content metadata
export interface AssetContent {
  project: string;
  season?: number;
  episode?: number;
  scene?: number;
  shot?: number;
  title?: string;
  description?: string;
  characters?: string[];
  location?: string;
  mood?: string[];
  tags: string[];
  category?: string;
  subject?: string;
  role?: string;
}

// Rights and licensing
export interface AssetRights {
  license: 'proprietary' | 'cc-by' | 'cc-by-sa' | 'public-domain';
  usageWindow: {
    start: string; // ISO date
    end: string | null;
  };
  regions: string[];
  talentReleases?: string[];
  musicClearance?: boolean;
  restrictions: string[];
}

// Provenance for human-created assets
export interface HumanProvenance {
  origin: 'human-created';
  createdBy: string;
  createdAt: string; // ISO date
  sourceAsset?: string;
  tools?: string[];
  photographer?: string;
  postProcessing?: string[];
}

// Provenance for AI-generated assets
export interface AIProvenance {
  origin: 'ai-generated' | 'ai-assisted';
  model: {
    name: string;
    version: string;
    provider: string;
  };
  generation: {
    prompt: string;
    promptHash: string;
    negativePrompt?: string;
    seed?: number;
    steps?: number;
    cfg?: number;
    sampler?: string;
  };
  postProcessing?: Array<{
    tool: string;
    action: string;
  }>;
  humanReview?: {
    reviewedBy: string;
    reviewedAt: string;
    approved: boolean;
    notes?: string;
  };
  createdAt: string;
}

export type AssetProvenance = HumanProvenance | AIProvenance;

// Workflow status
export interface AssetWorkflow {
  status: AssetStatus;
  version: number;
  approvedBy?: string;
  approvedAt?: string;
  publishedTo?: SocialPlatform[];
  variants?: string[]; // asset IDs
}

// Base asset interface
export interface BaseAsset {
  id: string;
  filename: string;
  type: AssetType;
  content: AssetContent;
  rights?: AssetRights;
  provenance: AssetProvenance;
  workflow: AssetWorkflow;
  createdAt: string;
  updatedAt: string;
}

// Video asset
export interface VideoAsset extends BaseAsset {
  type: 'video';
  technical: VideoTechnical;
}

// Image asset
export interface ImageAsset extends BaseAsset {
  type: 'image';
  technical: ImageTechnical;
  derivatives?: Record<ImagePreset, string>; // preset -> asset ID
}

// Audio asset
export interface AudioAsset extends BaseAsset {
  type: 'audio';
  technical: {
    codec: string;
    sampleRate: number;
    bitDepth: number;
    channels: number;
    duration: number;
    fileSize: number;
  };
}

export type MediaAsset = VideoAsset | ImageAsset | AudioAsset;

// API Response types
export interface AssetListResponse {
  data: MediaAsset[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  links: {
    self: string;
    first: string;
    last: string;
    next?: string;
    prev?: string;
  };
}

export interface AssetResponse {
  data: MediaAsset;
  links: {
    self: string;
    cdn: string;
    download: string;
  };
}

// Query filters
export interface AssetFilters {
  type?: AssetType;
  status?: AssetStatus;
  origin?: AssetOrigin;
  season?: number;
  episode?: number;
  tags?: string[];
  characters?: string[];
  platform?: SocialPlatform;
  aspectRatio?: AspectRatio;
  category?: string;
}
