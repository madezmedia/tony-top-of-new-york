import fs from 'fs';
import path from 'path';

const DOMAIN = 'https://topofnewyork.com';
const DATE = new Date().toISOString().split('T')[0];

const staticRoutes = [
  { path: '/', priority: '1.0', freq: 'daily' },
  { path: '/news', priority: '0.9', freq: 'daily' },
  { path: '/privacy', priority: '0.5', freq: 'monthly' },
  { path: '/terms', priority: '0.5', freq: 'monthly' },
  { path: '/#overview', priority: '0.8', freq: 'monthly' },
  { path: '/#cast', priority: '0.8', freq: 'monthly' },
  { path: '/#episodes', priority: '0.8', freq: 'monthly' },
  { path: '/#presskit', priority: '0.7', freq: 'monthly' },
  { path: '/#contact', priority: '0.6', freq: 'monthly' },
];

function generateSitemap() {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  staticRoutes.forEach(route => {
    xml += '  <url>\n';
    xml += `    <loc>${DOMAIN}${route.path}</loc>\n`;
    xml += `    <lastmod>${DATE}</lastmod>\n`;
    xml += `    <changefreq>${route.freq}</changefreq>\n`;
    xml += `    <priority>${route.priority}</priority>\n`;
    xml += '  </url>\n';
  });

  xml += '</urlset>';

  const outputPath = path.join(process.cwd(), 'public', 'sitemap.xml');
  fs.writeFileSync(outputPath, xml);
  console.log(`✅ Sitemap generated at ${outputPath}`);
}

generateSitemap();
