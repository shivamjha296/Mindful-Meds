import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name using ES modules approach
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base URL of your website - replace with your actual domain when deployed
const BASE_URL = 'https://medx-app.com';

// List of public routes (pages that don't require authentication)
const routes = [
  '/',                  // Home page
  '/auth',              // Authentication page
  '/dear-ones-portal',  // Dear Ones Portal landing page
  '/privacy-policy',    // Privacy Policy (if you have one)
  '/terms-of-service',  // Terms of Service (if you have one)
  '/about',             // About page (if you have one)
  '/contact',           // Contact page (if you have one)
];

// Generate sitemap content
const generateSitemap = () => {
  const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
  
  let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
  sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  routes.forEach(route => {
    sitemap += '  <url>\n';
    sitemap += `    <loc>${BASE_URL}${route}</loc>\n`;
    sitemap += `    <lastmod>${today}</lastmod>\n`;
    sitemap += '    <changefreq>monthly</changefreq>\n';
    // Home page gets highest priority
    sitemap += `    <priority>${route === '/' ? '1.0' : '0.8'}</priority>\n`;
    sitemap += '  </url>\n';
  });
  
  sitemap += '</urlset>';
  return sitemap;
};

// Write sitemap to file
const sitemap = generateSitemap();
const publicDir = path.resolve(__dirname, '../public');

// Ensure public directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap);
console.log('Sitemap generated successfully at public/sitemap.xml!'); 