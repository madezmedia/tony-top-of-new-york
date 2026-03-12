// Local Image Manifest
// Maps category/id to local filenames in public/images/
// Local images take priority over placeholder/CDN images

export const LOCAL_IMAGES: Record<string, string> = {
  'promotional/hero-background': 'hero-background.jpeg',
  'promotional/story-scene': 'story-scene.jpeg',
  'cast/michael-steven-paul': 'michael-steven-paul.jpeg',
  'cast/shana-bookman': 'shana-bookman.jpeg',
  'cast/raymond-broadwater': 'raymond-broadwater.jpeg',
  'cast/michele-white': 'michele-white.jpeg',
  'cast/britton-carter': 'btton-l-carter.jpeg',
  'brand/tony-logo': 'tony-logo.png',
  'news/casting-call-nc': 'casting-call-nc.png',
  'news/episodes-in-production': 'episodes-in-production.png',
  'news/dual-launch': 'dual-launch.png',
  'news/casting-call-winston-salem-nc': 'casting-call-nc.png',
  'news/new-episodes-in-production': 'episodes-in-production.png',
  'news/roku-app-and-website-launch': 'dual-launch.png',
  // Add more local images as they are added to public/images/
};

/**
 * Check if a local image exists for the given category and id
 */
export function hasLocalImage(category: string, id: string): boolean {
  return `${category}/${id}` in LOCAL_IMAGES;
}

/**
 * Get the local image path for serving from public folder
 * Returns null if no local image exists
 */
export function getLocalImagePath(category: string, id: string): string | null {
  const key = `${category}/${id}`;
  if (key in LOCAL_IMAGES) {
    return `/images/${category}/${LOCAL_IMAGES[key]}`;
  }
  return null;
}
