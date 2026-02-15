#!/usr/bin/env node

/**
 * Generate entry point files from categories configuration
 * This script creates:
 * 1. HTML files (index.html, crypto-jobs.html, etc.)
 * 2. JS entry point files (src/index.js, src/crypto-jobs.js, etc.)
 * 3. Updates Vite config with all entry points
 * 4. Updates constants.ts with category endpoints
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { CATEGORIES } from '../categories.config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the root directory (one level up from scripts)
const rootDir = path.resolve(__dirname, '..');
const srcDir = path.join(rootDir, 'src');

/**
 * Generate pages configuration from categories
 */
function generatePagesConfig() {
  const pages = [];

  // Home page
  const categoryNames = CATEGORIES.map(c => c.name).join(' & ');
  pages.push({
    path: '/index.html',
    title: `Job Finder - ${categoryNames} Jobs | Find Your Next Opportunity`,
    description: `Discover ${categoryNames.toLowerCase()} job opportunities. Search thousands of positions from top companies.`,
    type: 'home',
    category: 'all',
    entryPoint: 'index',
  });

  // Category pages
  for (const category of CATEGORIES) {
    const catName = category.name;
    const catId = category.id;

    // Jobs page
    pages.push({
      path: `/${catId}-jobs.html`,
      title: `${catName} Jobs - Find Great Opportunities`,
      description: `Browse all ${catName.toLowerCase()} job opportunities. Find your next role at leading companies.`,
      type: 'jobs',
      category: catId,
      entryPoint: `${catId}-jobs`,
    });

    // New Jobs page
    pages.push({
      path: `/${catId}-new-jobs.html`,
      title: `New ${catName} Jobs - Latest Opportunities`,
      description: `Discover the newest ${catName.toLowerCase()} job listings. Updated daily with fresh opportunities.`,
      type: 'new-jobs',
      category: catId,
      entryPoint: `${catId}-new-jobs`,
    });

    // Companies page
    pages.push({
      path: `/${catId}-companies.html`,
      title: `${catName} Companies - Find Top Organizations`,
      description: `Explore leading ${catName.toLowerCase()} companies hiring. Browse by company size, location, and specialization.`,
      type: 'companies',
      category: catId,
      entryPoint: `${catId}-companies`,
    });
  }

  // Favorites page
  pages.push({
    path: '/favorites.html',
    title: 'Favorites - Your Saved Job Listings',
    description: 'View all your saved favorite job listings in one place. Organize your job search effectively.',
    type: 'favorites',
    category: 'all',
    entryPoint: 'favorites',
  });

  // Login page
  pages.push({
    path: '/login.html',
    title: 'Log In - Job Finder',
    description: 'Log in to save your favorite job listings and access personalized features.',
    type: 'login',
    category: 'all',
    entryPoint: 'login',
  });

  // Account page
  pages.push({
    path: '/account.html',
    title: 'My Account - Job Finder',
    description: 'Manage your account settings and view your saved job preferences.',
    type: 'account',
    category: 'all',
    entryPoint: 'account',
  });
  // Admin page
  pages.push({
    path: '/admin.html',
    title: 'Admin Dashboard - Job Finder',
    description: 'Redis administration dashboard for authorized users only.',
    type: 'admin',
    category: 'all',
    entryPoint: 'admin',
  });
  return pages;
}

const pagesConfig = generatePagesConfig();

/**
 * Generate HTML template for a page
 */
function generateHtmlTemplate(page) {
  const ogImage = 'https://www.job-finder.org/crypto-logo.svg';
  const jsPath = `src/${page.entryPoint}.js`;
  
  // Private pages should not be indexed by search engines
  const robotsContent = (page.type === 'login' || page.type === 'account' || page.type === 'admin') 
    ? 'noindex, nofollow' 
    : 'index, follow';

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
    <meta name="robots" content="${robotsContent}" />
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
    // Skip pages with noindex robots meta tag
    if (page.type === 'favorites' || page.type === 'login' || page.type === 'account' || page.type === 'admin') {
      return '';
    }
    
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
    .filter(page => 
      page.type !== 'favorites' && 
      page.type !== 'login' && 
      page.type !== 'account' && 
      page.type !== 'admin'
    )
    .map(page => {
      const urlPath = page.path === '/index.html' ? '/' : page.path;
      return `Allow: ${urlPath}`;
    })
    .join('\n');
  
  const disallowRules = pages
    .filter(page => 
      page.type === 'favorites' || 
      page.type === 'login' || 
      page.type === 'account' || 
      page.type === 'admin'
    )
    .map(page => `Disallow: ${page.path}`)
    .join('\n');

  return `User-agent: *
${allowRules}
${disallowRules}

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

  // Generate constants.ts with dynamic endpoints
  generateConstantsFile();

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

  // Generate categories.ts for frontend
  generateCategoriesTypeScriptFile();

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
  console.log(`Configured ${CATEGORIES.length} categories: ${CATEGORIES.map(c => c.name).join(', ')}`);
}

/**
 * Generate constants.ts file with dynamic endpoints
 */
function generateConstantsFile() {
  const endpointsCode = CATEGORIES.map((category) => {
    const upperCaseId = category.id.toUpperCase();
    return `  ${upperCaseId}_JOBS: '${category.endpoints.jobs}',
  ${upperCaseId}_COMPANIES: '${category.endpoints.companies}',
  ${upperCaseId}_CURRENT: '${category.endpoints.current}',
  ${upperCaseId}_NEW_JOBS: '${category.endpoints.newJobs}',`;
  }).join('\n');

  const routesCode = CATEGORIES.map((category) => {
    const upperCaseId = category.id.toUpperCase();
    const id = category.id;
    return `  ${upperCaseId}_JOBS: '/${id}-jobs.html',
  ${upperCaseId}_COMPANIES: '/${id}-companies.html',
  ${upperCaseId}_NEW_JOBS: '/${id}-new-jobs.html',`;
  }).join('\n');

  const categoriesEnumCode = CATEGORIES.map((category) => {
    const upperCaseId = category.id.toUpperCase();
    return `  ${upperCaseId}: '${category.id}',`;
  }).join('\n');

  const constantsContent = `/**
 * Configuration constants used throughout the application
 * 
 * This file is auto-generated by scripts/generate-entry-points.js
 * DO NOT EDIT MANUALLY - Edit categories.config.js instead
 */

// Job Data Endpoints
export const ENDPOINTS = {
${endpointsCode}
} as const;

// LocalStorage Keys
export const STORAGE_KEYS = {
  FAVORITES: 'favoriteJobs',
  FILTERS: 'jobFilters',
  PREFERENCES: 'userPreferences',
  LAST_UPDATED: 'lastUpdated',
};

// UI Configuration
export const UI_CONFIG = {
  ITEMS_PER_PAGE: 50,
  TIMEOUT_MS: 15000,
  QUICK_FILTERS: {
    QA: ['QA', 'test', 'sdet', 'quality'],
    DEVOPS: ['DevOps', 'SRE', 'Reliability', 'Platform Engineering'],
  },
};

// Job Categories
export const JOB_CATEGORIES = {
${categoriesEnumCode}
} as const;

// Page Routes
export const ROUTES = {
  HOME: '/',
${routesCode}
  FAVORITES: '/favorites.html',
  LOGIN: '/login.html',
  ACCOUNT: '/account.html',
  ADMIN: '/admin.html',
};

// Authentication Configuration
export const AUTH_CONFIG = {
  ENDPOINTS: {
    SEND_CODE: '/api/auth/send-code',
    VERIFY_CODE: '/api/auth/verify-code',
  },
  CODE_LENGTH: 4,
  CODE_EXPIRATION: 600, // 10 minutes in seconds
  SESSION_DURATION: {
    DEFAULT: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    REMEMBER_ME: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
  },
  RATE_LIMIT: {
    MAX_ATTEMPTS: 3,
    WINDOW: 600, // 10 minutes in seconds
  },
} as const;
`;

  const constantsPath = path.join(srcDir, 'utils', 'constants.ts');
  fs.writeFileSync(constantsPath, constantsContent, 'utf-8');
  console.log('✓ Generated src/utils/constants.ts');
}

/**
 * Generate categories.ts file for frontend use
 */
function generateCategoriesTypeScriptFile() {
  const categoriesArray = CATEGORIES.map((cat) => {
    return `  {
    id: '${cat.id}',
    name: '${cat.name}',
    color: '${cat.color}',
    hoverColor: '${cat.hoverColor}',
  }`;
  }).join(',\n');

  const categoriesContent = `/**
 * Categories configuration for frontend use
 * 
 * This file is auto-generated by scripts/generate-entry-points.js
 * DO NOT EDIT MANUALLY - Edit categories.config.js instead
 */

export interface Category {
  id: string;
  name: string;
  color: string;
  hoverColor: string;
}

export const CATEGORIES: Category[] = [
${categoriesArray},
];

/**
 * Get category by ID
 */
export function getCategoryById(id: string): Category | undefined {
  return CATEGORIES.find((cat) => cat.id === id);
}

/**
 * Get all category IDs
 */
export function getCategoryIds(): string[] {
  return CATEGORIES.map((cat) => cat.id);
}
`;

  const categoriesPath = path.join(srcDir, 'utils', 'categories.ts');
  fs.writeFileSync(categoriesPath, categoriesContent, 'utf-8');
  console.log('✓ Generated src/utils/categories.ts');
}

// Run
generateEntryPoints().catch(console.error);
