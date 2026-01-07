import { CastMember, Episode, NavLink, NewsItem, PressAsset, PressContact, QuickFact } from './types';
import { buildImageUrl } from './lib/media';

export const NAV_LINKS: NavLink[] = [
  { label: 'Overview', href: '#overview' },
  { label: 'Cast', href: '#cast' },
  { label: 'Episodes', href: '#episodes' },
  { label: 'News', href: '#news' },
  { label: 'Press Kit', href: '#presskit' },
  { label: 'Contact', href: '#contact' },
];

export const CAST_MEMBERS: CastMember[] = [
  {
    id: '1',
    name: 'Michael Steven-Paul',
    role: 'Det. Tony Rossi',
    bio: 'The creator and lead of the series. Tony Rossi is a hardened detective navigating the corrupt underbelly of NYC while trying to keep his family safe from the demons of his past.',
    imageUrl: buildImageUrl('cast', 'michael-steven-paul', 'cast'),
  },
  {
    id: '2',
    name: 'Fallon Shaya',
    role: 'Det. Sarah Barnes',
    bio: 'A sharp-witted investigator who refuses to play by the precinct\'s unwritten rules. She becomes Rossi\'s most trusted ally in a department full of moles.',
    imageUrl: buildImageUrl('cast', 'fallon-shaya', 'cast'),
  },
  {
    id: '3',
    name: 'Britton L. Carter',
    role: 'Billy Black',
    bio: 'A complex antagonist who rules the streets with a code of honor. His rivalry with Rossi is personal, deep-rooted in their shared history in the Bronx.',
    imageUrl: buildImageUrl('cast', 'britton-carter', 'cast'),
  },
  {
    id: '4',
    name: 'Julian Dorsey',
    role: 'Born',
    bio: 'The muscle and the strategist. Born moves in silence but his impact is loud. Loyalty is his currency, but inflation is hitting the streets.',
    imageUrl: buildImageUrl('cast', 'julian-dorsey', 'cast'),
  },
  {
    id: '5',
    name: 'Shana Bookman',
    role: 'Rena',
    bio: 'Caught in the crossfire, Rena holds the secrets that could bring the entire syndicate down. Her survival depends on who she trusts.',
    imageUrl: buildImageUrl('cast', 'shana-bookman', 'cast'),
  },
  {
    id: '6',
    name: 'Kim Salley',
    role: 'Lieutenant Baker',
    bio: 'The precinct commander trying to hold the line between politics and police work. Every decision she makes comes with a heavy price.',
    imageUrl: buildImageUrl('cast', 'kim-salley', 'cast'),
  },
];

export const EPISODES: Episode[] = [
  {
    id: 's1e1',
    number: 1,
    title: 'Concrete Jungle',
    description: 'Detective Rossi investigates a high-profile murder that leads him to the doorstep of the city\'s most powerful syndicate.',
    airDate: 'Oct 12, 2023',
    duration: '48m',
    thumbnailUrl: buildImageUrl('episodes', 's01e01-concrete-jungle', 'card'),
  },
  {
    id: 's1e2',
    number: 2,
    title: 'Shadows of the Empire',
    description: 'Elena faces pressure from the Mayor\'s office to drop the case. Viper makes his first move against the precinct.',
    airDate: 'Oct 19, 2023',
    duration: '52m',
    thumbnailUrl: buildImageUrl('episodes', 's01e02-shadows-of-the-empire', 'card'),
  },
  {
    id: 's1e3',
    number: 3,
    title: 'Bridge and Tunnel',
    description: 'A chase across the Verrazzano reveals a trafficking ring. Officer Lin has to make a difficult choice.',
    airDate: 'Oct 26, 2023',
    duration: '50m',
    thumbnailUrl: buildImageUrl('episodes', 's01e03-bridge-and-tunnel', 'card'),
  },
];

export const NEWS_ITEMS: NewsItem[] = [
  {
    id: 'n1',
    title: 'Season 2 Renewed!',
    summary: 'T.O.N.Y. will return for a second season. Filming begins in Brooklyn this Spring.',
    date: 'Dec 15, 2023',
    category: 'Production',
    imageUrl: buildImageUrl('press', 'season-2-renewed', 'card'),
  },
  {
    id: 'n2',
    title: 'Red Carpet Premiere',
    summary: 'See the photos from the star-studded event at the Tribeca Film Festival.',
    date: 'Nov 02, 2023',
    category: 'Event',
    imageUrl: buildImageUrl('press', 'red-carpet-premiere', 'card'),
  },
];

export const SOCIAL_LINKS = {
  youtube: 'https://www.youtube.com/@TONYSeries',
  tiktok: 'https://www.tiktok.com/@tonyseries',
  instagram: 'https://www.instagram.com/tonyseries/',
  twitter: 'https://twitter.com/tonyseries',
  facebook: 'https://www.facebook.com/tonyseries',
  discord: 'https://discord.gg/tonyseries',
};

// Press Kit Data
export const QUICK_FACTS: QuickFact[] = [
  { label: 'Genre', value: 'Crime Drama' },
  { label: 'Creator', value: 'Michael Steven-Paul' },
  { label: 'Episodes', value: '10 per season' },
  { label: 'Runtime', value: '48-52 min' },
  { label: 'Network', value: 'Streaming' },
  { label: 'Premiere', value: 'Oct 2023' },
];

export const PRESS_CONTACTS: PressContact[] = [
  { name: 'Press Inquiries', role: 'Media Relations', email: 'press@tonyseries.com' },
  { name: 'Partnerships', role: 'Business Development', email: 'partners@tonyseries.com' },
];

export const PRESS_ASSETS: PressAsset[] = [
  // Photos
  {
    id: 'cast-headshots',
    title: 'Cast Headshots Pack',
    category: 'photo',
    description: 'High-resolution headshots of all main cast members',
    thumbnailUrl: buildImageUrl('press', 'cast-headshots-thumb', 'card'),
    downloadUrl: '/assets/press/TONY_cast_headshots.zip',
    fileSize: '45 MB',
    format: 'ZIP (JPEG)',
    resolution: '3000x4500 @ 300dpi',
  },
  {
    id: 'key-art',
    title: 'Key Art & Posters',
    category: 'photo',
    description: 'Official poster artwork and key promotional images',
    thumbnailUrl: buildImageUrl('press', 'key-art-thumb', 'card'),
    downloadUrl: '/assets/press/TONY_key_art.zip',
    fileSize: '32 MB',
    format: 'ZIP (PNG/JPEG)',
    resolution: '4000x6000 @ 300dpi',
  },
  {
    id: 'bts-gallery',
    title: 'Behind-the-Scenes Gallery',
    category: 'photo',
    description: 'Exclusive on-set photos from production',
    thumbnailUrl: buildImageUrl('press', 'bts-gallery-thumb', 'card'),
    downloadUrl: '/assets/press/TONY_bts_gallery.zip',
    fileSize: '78 MB',
    format: 'ZIP (JPEG)',
    resolution: '4000x2667 @ 300dpi',
  },
  {
    id: 'episode-stills',
    title: 'Episode Stills',
    category: 'photo',
    description: 'Selected high-quality stills from Season 1 episodes',
    thumbnailUrl: buildImageUrl('press', 'episode-stills-thumb', 'card'),
    downloadUrl: '/assets/press/TONY_episode_stills.zip',
    fileSize: '56 MB',
    format: 'ZIP (JPEG)',
    resolution: '3840x2160',
  },
  // Videos
  {
    id: 'official-trailer',
    title: 'Official Trailer',
    category: 'video',
    description: 'Season 1 official theatrical trailer',
    thumbnailUrl: buildImageUrl('press', 'trailer-thumb', 'card'),
    downloadUrl: '/assets/press/TONY_S01_trailer_1080p.mp4',
    fileSize: '125 MB',
    format: 'MP4 (H.264)',
    resolution: '1920x1080',
    duration: '2:15',
  },
  {
    id: 'teaser',
    title: 'Season Teaser',
    category: 'video',
    description: '30-second teaser for social media and broadcast',
    thumbnailUrl: buildImageUrl('press', 'teaser-thumb', 'card'),
    downloadUrl: '/assets/press/TONY_S01_teaser_1080p.mp4',
    fileSize: '28 MB',
    format: 'MP4 (H.264)',
    resolution: '1920x1080',
    duration: '0:30',
  },
  {
    id: 'bts-featurette',
    title: 'Making of T.O.N.Y.',
    category: 'video',
    description: 'Behind-the-scenes featurette with cast and crew interviews',
    thumbnailUrl: buildImageUrl('press', 'bts-featurette-thumb', 'card'),
    downloadUrl: '/assets/press/TONY_making_of_1080p.mp4',
    fileSize: '340 MB',
    format: 'MP4 (H.264)',
    resolution: '1920x1080',
    duration: '8:45',
  },
  // Logos
  {
    id: 'logo-primary',
    title: 'Primary Logo Pack',
    category: 'logo',
    description: 'Full logo in various formats (SVG, PNG, EPS)',
    thumbnailUrl: buildImageUrl('press', 'logo-primary-thumb', 'card'),
    downloadUrl: '/assets/press/TONY_logo_primary.zip',
    fileSize: '2.5 MB',
    format: 'ZIP (SVG/PNG/EPS)',
  },
  {
    id: 'logo-variations',
    title: 'Logo Variations',
    category: 'logo',
    description: 'Horizontal, vertical, and icon-only variations',
    thumbnailUrl: buildImageUrl('press', 'logo-variations-thumb', 'card'),
    downloadUrl: '/assets/press/TONY_logo_variations.zip',
    fileSize: '4.2 MB',
    format: 'ZIP (SVG/PNG)',
  },
  // Documents
  {
    id: 'press-release',
    title: 'Press Release',
    category: 'document',
    description: 'Official press release for Season 1 premiere',
    thumbnailUrl: buildImageUrl('press', 'press-release-thumb', 'card'),
    downloadUrl: '/assets/press/TONY_press_release.pdf',
    fileSize: '245 KB',
    format: 'PDF',
  },
  {
    id: 'fact-sheet',
    title: 'Series Fact Sheet',
    category: 'document',
    description: 'One-page overview with key facts and figures',
    thumbnailUrl: buildImageUrl('press', 'fact-sheet-thumb', 'card'),
    downloadUrl: '/assets/press/TONY_fact_sheet.pdf',
    fileSize: '180 KB',
    format: 'PDF',
  },
  {
    id: 'episode-guide',
    title: 'Episode Guide',
    category: 'document',
    description: 'Season 1 episode synopses and air dates',
    thumbnailUrl: buildImageUrl('press', 'episode-guide-thumb', 'card'),
    downloadUrl: '/assets/press/TONY_episode_guide.pdf',
    fileSize: '520 KB',
    format: 'PDF',
  },
  {
    id: 'cast-bios',
    title: 'Cast Bios',
    category: 'document',
    description: 'Detailed biographies of all main cast members',
    thumbnailUrl: buildImageUrl('press', 'cast-bios-thumb', 'card'),
    downloadUrl: '/assets/press/TONY_cast_bios.pdf',
    fileSize: '1.2 MB',
    format: 'PDF',
  },
];
