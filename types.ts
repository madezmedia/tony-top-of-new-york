export interface CastMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  imageUrl: string;
}

export interface Episode {
  id: string;
  number: number;
  title: string;
  description: string;
  airDate: string;
  duration: string;
  thumbnailUrl: string;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  date: string;
  category: 'Production' | 'Event' | 'Press';
  imageUrl: string;
}

export interface NavLink {
  label: string;
  href: string;
}

// Press Kit types
export type PressAssetCategory = 'photo' | 'video' | 'logo' | 'document';

export interface PressAsset {
  id: string;
  title: string;
  category: PressAssetCategory;
  description: string;
  thumbnailUrl: string;
  downloadUrl: string;
  fileSize: string;
  format: string;
  resolution?: string;
  duration?: string;
}

export interface PressContact {
  name: string;
  role: string;
  email: string;
  phone?: string;
}

export interface QuickFact {
  label: string;
  value: string;
}

// Re-export media types for convenience
export type {
  MediaAsset,
  VideoAsset,
  ImageAsset,
  AssetType,
  AssetStatus,
  ImagePreset,
  VideoPreset,
  SocialPlatform,
} from './lib/media';
