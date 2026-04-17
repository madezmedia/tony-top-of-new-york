// Local Image Manifest
// Maps category/id to local filenames in public/images/
// Local images take priority over placeholder/CDN images

export const LOCAL_IMAGES: Record<string, string> = {
  // Brand
  'brand/tony-logo': 'tony-logo.jpg',

  // Promotional
  'promotional/hero-background': 'hero-background.jpeg',
  'promotional/story-scene': 'story-scene.jpeg',

  // Original Cast
  'cast/michael-steven-paul': 'michael-steven-paul.jpeg',
  'cast/shana-bookman': 'shana-bookman.jpeg',
  'cast/raymond-broadwater': 'raymond-broadwater.jpeg',
  'cast/michele-white': 'michele-white.jpeg',
  'cast/britton-carter': 'btton-l-carter.jpeg',
  'cast/jennifer-askew': 'jennifer-askew.jpeg',
  'cast/detective-barnes': 'detective-barnes.png',

  // Enhanced Cast (New Local Matches)
  'cast/jenesis-beaumont': 'jenesis-beaumont.jpeg',
  'cast/brandi-beaumont': 'brandi-beaumont.jpeg',
  'cast/maxx-beaumont': 'maxx-beaumont.jpeg',
  'cast/chelsea-alvarez': 'chelsea-alvarez.jpeg',
  'cast/ricardo-alvarez': 'ricardo-alvarez.jpeg',
  'cast/domingo': 'domingo.jpeg',
  'cast/captain-reigns': 'captain-reigns.jpeg',
  'cast/detective-chase': 'detective-chase.jpeg',
  'cast/detective-waters': 'detective-waters.jpeg',
  'cast/detective-kazaan': 'detective-kazaan.jpeg',
  'cast/levie-maxxi': 'levie-maxxi.jpeg',
  'cast/detective-cage': 'detective-cage.jpeg',
  'cast/detective-branson': 'detective-branson.jpeg',
  'cast/detective-jefferies': 'detective-jefferies.jpeg',
  'cast/detective-cordell': 'detective-cordell.jpeg',
  'cast/da-laurent': 'da-laurent.jpeg',
  'cast/da-crocket': 'da-crocket.jpeg',
  'cast/melonie-streetz': 'melonie-streetz.jpeg',
  'cast/marvin-bishop': 'marvin-bishop.jpeg',
  'cast/kat-calloway': 'kat-calloway.jpeg',
  'cast/shaborn': 'shaborn.jpeg',

  // Additional Cast Portraits (Photoroom)
  ...Object.fromEntries(Array.from({ length: 28 }, (_, i) => [
    `cast/tony-cast-${String(i + 1).padStart(2, '0')}`,
    `tony_cast_${String(i + 1).padStart(2, '0')}.png`
  ])),

  // Gallery Stills
  ...Object.fromEntries(Array.from({ length: 24 }, (_, i) => [
    `gallery/tony-gallery-${String(i + 1).padStart(2, '0')}`,
    `tony_gallery_${String(i + 1).padStart(2, '0')}.jpg`
  ])),

  // News
  'news/casting-call-nc': 'casting-call-nc.png',
  'news/episodes-in-production': 'episodes-in-production.png',
  'news/dual-launch': 'dual-launch.png',
  'news/casting-call-winston-salem-nc': 'casting-call-nc.png',
  'news/new-episodes-in-production': 'episodes-in-production.png',
  'news/roku-app-and-website-launch': 'dual-launch.png',
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
