#!/usr/bin/env node

/**
 * Generate entry point files from pageConfig.ts
 * This script creates:
 * 1. HTML files (index.html, crypto-jobs.html, etc.)
 * 2. JS entry point files (src/index.js, src/crypto-jobs.js, etc.)
 * 3. Updates Vite config with all entry points
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the root directory (one level up from scripts)
const rootDir = path.resolve(__dirname, '..');
const srcDir = path.join(rootDir, 'src');

// Define pages configuration
const pagesConfig = [
  {
    path: '/index.html',
    title: 'Job Finder - AI & Crypto Jobs | Find Your Next Opportunity',
    description: 'Discover AI, ML, data science, blockchain, DeFi, and crypto job opportunities. Search thousands of positions from top companies.',
    type: 'home',
    category: 'all',
    entryPoint: 'index',
  },
  {
    path: '/crypto-jobs.html',
    title: 'Crypto Jobs - Find Web3 & Blockchain Opportunities',
    description: 'Browse all cryptocurrency and blockchain job opportunities. Find your next Web3 role at leading crypto companies.',
    type: 'jobs',
    category: 'crypto',
    entryPoint: 'crypto-jobs',
  },
  {
    path: '/crypto-new-jobs.html',
    title: 'New Crypto Jobs - Latest Web3 Opportunities',
    description: 'Discover the newest cryptocurrency and blockchain job listings. Updated daily with fresh Web3 opportunities.',
    type: 'new-jobs',
    category: 'crypto',
    entryPoint: 'crypto-new-jobs',
  },
  {
    path: '/crypto-companies.html',
    title: 'Crypto Companies - Find Top Web3 Organizations',
    description: 'Explore leading cryptocurrency and blockchain companies hiring. Browse by company size, location, and specialization.',
    type: 'companies',
    category: 'crypto',
    entryPoint: 'crypto-companies',
  },
  {
    path: '/ai-jobs.html',
    title: 'AI Jobs - Artificial Intelligence & ML Careers',
    description: 'Find artificial intelligence, machine learning, and data science job opportunities. Explore careers at AI-focused companies.',
    type: 'jobs',
    category: 'ai',
    entryPoint: 'ai-jobs',
  },
  {
    path: '/ai-new-jobs.html',
    title: 'New AI Jobs - Latest ML & AI Opportunities',
    description: 'Discover the newest AI, machine learning, and data science job listings. Updated daily with fresh opportunities.',
    type: 'new-jobs',
    category: 'ai',
    entryPoint: 'ai-new-jobs',
  },
  {
    path: '/ai-companies.html',
    title: 'AI Companies - Find Top AI Organizations',
    description: 'Explore leading AI and machine learning companies hiring. Browse by company size, location, and specialization.',
    type: 'companies',
    category: 'ai',
    entryPoint: 'ai-companies',
  },
  {
    path: '/favorites.html',
    title: 'Favorites - Your Saved Job Listings',
    description: 'View all your saved favorite job listings in one place. Organize your job search effectively.',
    type: 'favorites',
    category: 'all',
    entryPoint: 'favorites',
  },
];

/**
 * Generate HTML template for a page
 */
function generateHtmlTemplate(page) {
  const ogImage = 'https://www.job-finder.org/crypto-logo.svg';
  const jsPath = `src/${page.entryPoint}.js`;

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/crypto-logo.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${page.title}</title>
    <meta name="description" content="${page.description}" />
    <meta property="og:title" content="${page.title}" />
    <meta property="og:description" content="${page.description}" />
    <meta property="og:url" content="https://www.job-finder.org${page.path}" />
    <meta property="og:type" content="website" />
    <meta property="og:image" content="${ogImage}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${page.title}" />
    <meta name="twitter:description" content="${page.description}" />
    <meta name="twitter:image" content="${ogImage}" />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="https://www.job-finder.org${page.path}" />
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/${jsPath}"></script>
  </body>
</html>`;
}

/**
 * Generate JS entry point template
 */
function generateJsTemplate(page) {
  return `import { mount } from 'svelte';
import App from './App.svelte';
import './app.css';

// Import the page configuration
const pageConfig = {
  type: '${page.type}',
  category: '${page.category}',
  title: '${page.title}',
  description: '${page.description}',
};

// Store in window for App.svelte to access
window.__PAGE_CONFIG__ = pageConfig;

const app = mount(App, {
  target: document.getElementById('app'),
  props: {
    pageConfig,
  },
});

export default app;
`;
}

/**
 * Generate Sitemap XML
 */
function generateSitemap(pages) {
  const baseUrl = 'https://www.job-finder.org';
  const today = new Date().toISOString().split('T')[0];

  const urls = pages.map(page => {
    // Skip favorites page in sitemap
    if (page.type === 'favorites') return '';
    
    const priority = page.path === '/index.html' ? '1.0' : '0.8';
    const changefreq = page.type === 'new-jobs' ? 'daily' : 'weekly';
    const urlPath = page.path === '/index.html' ? '/' : page.path;

    return `  <url>
    <loc>${baseUrl}${urlPath}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  }).filter(Boolean).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

/**
 * Generate robots.txt
 */
function generateRobotsTxt(pages) {
  const baseUrl = 'https://www.job-finder.org';
  
  const allowRules = pages
    .filter(page => page.type !== 'favorites')
    .map(page => {
      const urlPath = page.path === '/index.html' ? '/' : page.path;
      return `Allow: ${urlPath}`;
    })
    .join('\n');

  return `User-agent: *
${allowRules}
Disallow: /favorites.html

Sitemap: ${baseUrl}/sitemap.xml

# Crawl delay in seconds
Crawl-delay: 1
`;
}

/**
 * Main function
 */
async function generateEntryPoints() {
  console.log('🔧 Generating entry point files...');

  // Generate HTML files
  for (const page of pagesConfig) {
    const filePath = path.join(rootDir, page.path);
    const htmlContent = generateHtmlTemplate(page);
    fs.writeFileSync(filePath, htmlContent, 'utf-8');
    console.log(`✓ Generated ${page.path}`);
  }

  // Generate JS entry point files
  for (const page of pagesConfig) {
    const filePath = path.join(srcDir, `${page.entryPoint}.js`);
    const jsContent = generateJsTemplate(page);
    fs.writeFileSync(filePath, jsContent, 'utf-8');
    console.log(`✓ Generated src/${page.entryPoint}.js`);
  }

  // Generate sitemap.xml
  const publicDir = path.join(rootDir, 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
  }
  
  const sitemapContent = generateSitemap(pagesConfig);
  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapContent, 'utf-8');
  console.log('✓ Generated public/sitemap.xml');

  // Generate robots.txt
  const robotsContent = generateRobotsTxt(pagesConfig);
  fs.writeFileSync(path.join(publicDir, 'robots.txt'), robotsContent, 'utf-8');
  console.log('✓ Generated public/robots.txt');

  // Update Vite config with all entry points
  const viteConfigPath = path.join(rootDir, 'vite.config.js');
  const inputFiles = pagesConfig.map((page) => `./${page.path}`);

  const viteConfigContent = `import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte()],
  base: '', // Use relative paths for assets
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: [
        ${inputFiles.map((f) => `'${f}'`).join(',\n        ')},
      ],
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
})
`;

  fs.writeFileSync(viteConfigPath, viteConfigContent, 'utf-8');
  console.log('✓ Updated vite.config.js');

  console.log('\n✅ Entry point generation complete!');
  console.log(`Generated ${pagesConfig.length} HTML files and ${pagesConfig.length} JS entry points.`);
}

// Run
generateEntryPoints().catch(console.error);
