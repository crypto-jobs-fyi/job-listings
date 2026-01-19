/**
 * Categories Configuration
 * 
 * This file defines all job categories displayed on the site.
 * To add a new category:
 * 1. Add a new category object to the CATEGORIES array
 * 2. Run: node scripts/generate-entry-points.js
 * 3. Restart dev server if running
 * 
 * Each category requires:
 * - id: Unique identifier (lowercase, no spaces)
 * - name: Display name
 * - color: CSS color for buttons/badges
 * - hoverColor: CSS color for button hover state
 * - endpoints: URLs to JSON data files
 */

export const CATEGORIES = [
  {
    id: 'crypto',
    name: 'Crypto',
    color: '#059669',
    hoverColor: '#047857',
    endpoints: {
      jobs: 'https://raw.githubusercontent.com/crypto-jobs-fyi/crawler/refs/heads/main/crypto_jobs.json',
      companies: 'https://raw.githubusercontent.com/crypto-jobs-fyi/crawler/refs/heads/main/crypto_companies.json',
      current: 'https://raw.githubusercontent.com/crypto-jobs-fyi/crawler/refs/heads/main/crypto_current.json',
      newJobs: 'https://raw.githubusercontent.com/crypto-jobs-fyi/crawler/refs/heads/main/crypto_jobs_new.json',
    },
  },
  {
    id: 'ai',
    name: 'AI',
    color: '#8b5cf6',
    hoverColor: '#7c3aed',
    endpoints: {
      jobs: 'https://raw.githubusercontent.com/crypto-jobs-fyi/crawler/refs/heads/main/ai_jobs.json',
      companies: 'https://raw.githubusercontent.com/crypto-jobs-fyi/crawler/refs/heads/main/ai_companies.json',
      current: 'https://raw.githubusercontent.com/crypto-jobs-fyi/crawler/refs/heads/main/ai_current.json',
      newJobs: 'https://raw.githubusercontent.com/crypto-jobs-fyi/crawler/refs/heads/main/ai_jobs_new.json',
    },
  },
  {
    id: 'fin',
    name: 'FinTech',
    color: '#dacc0b',
    hoverColor: '#d9c706',
    endpoints: {
      jobs: 'https://raw.githubusercontent.com/crypto-jobs-fyi/crawler/refs/heads/main/fin_jobs.json',
      companies: 'https://raw.githubusercontent.com/crypto-jobs-fyi/crawler/refs/heads/main/fin_companies.json',
      current: 'https://raw.githubusercontent.com/crypto-jobs-fyi/crawler/refs/heads/main/fin_current.json',
      newJobs: 'https://raw.githubusercontent.com/crypto-jobs-fyi/crawler/refs/heads/main/fin_jobs_new.json',
    },
  },
  // Add new categories here following the same structure
  // Example:
  // {
  //   id: 'defi',
  //   name: 'DeFi',
  //   color: '#dacc0b',
  //   hoverColor: '#d9c706',
  //   endpoints: {
  //     jobs: 'https://example.com/defi_jobs.json',
  //     companies: 'https://example.com/defi_companies.json',
  //     current: 'https://example.com/defi_current.json',
  //     newJobs: 'https://example.com/defi_jobs_new.json',
  //   },
  // },
];

/**
 * Get category by ID
 */
export function getCategoryById(id) {
  return CATEGORIES.find((cat) => cat.id === id);
}

/**
 * Get all category IDs
 */
export function getCategoryIds() {
  return CATEGORIES.map((cat) => cat.id);
}

/**
 * Validate category endpoints
 */
export function validateCategory(category) {
  const required = ['id', 'name', 'color', 'hoverColor', 'endpoints'];
  const endpointKeys = ['jobs', 'companies', 'current', 'newJobs'];

  for (const field of required) {
    if (!category[field]) {
      throw new Error(`Category missing required field: ${field}`);
    }
  }

  for (const key of endpointKeys) {
    if (!category.endpoints[key]) {
      throw new Error(`Category ${category.id} missing endpoint: ${key}`);
    }
    if (!category.endpoints[key].startsWith('http')) {
      throw new Error(`Category ${category.id} endpoint ${key} must be a valid URL`);
    }
  }

  return true;
}

/**
 * Validate all categories
 */
export function validateAllCategories() {
  const ids = new Set();
  
  for (const category of CATEGORIES) {
    // Check for duplicate IDs
    if (ids.has(category.id)) {
      throw new Error(`Duplicate category ID: ${category.id}`);
    }
    ids.add(category.id);
    
    // Validate category structure
    validateCategory(category);
  }
  
  return true;
}

// Validate on import
validateAllCategories();
