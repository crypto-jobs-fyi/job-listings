/**
 * Configuration constants used throughout the application
 */

// API Configuration
export const API_BASE_URL =
  'https://raw.githubusercontent.com/crypto-jobs-fyi/crawler/refs/heads/main';

// Job Data Endpoints
export const ENDPOINTS = {
  CRYPTO_JOBS: `${API_BASE_URL}/jobs.json`,
  CRYPTO_COMPANIES: `${API_BASE_URL}/companies.json`,
  CRYPTO_CURRENT: `${API_BASE_URL}/current.json`,
  CRYPTO_NEW_JOBS: `${API_BASE_URL}/jobs_new.json`,

  AI_JOBS: `${API_BASE_URL}/ai_jobs.json`,
  AI_COMPANIES: `${API_BASE_URL}/ai_companies.json`,
  AI_CURRENT: `${API_BASE_URL}/ai_current.json`,
  AI_NEW_JOBS: `${API_BASE_URL}/ai_jobs_new.json`,
};

// LocalStorage Keys
export const STORAGE_KEYS = {
  FAVORITES: 'favoriteJobs',
  FILTERS: 'jobFilters',
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
  CRYPTO: 'crypto',
  AI: 'ai',
} as const;

// Page Routes
export const ROUTES = {
  HOME: '/',
  CRYPTO_JOBS: '/crypto-jobs.html',
  AI_JOBS: '/ai-jobs.html',
  CRYPTO_COMPANIES: '/crypto-companies.html',
  AI_COMPANIES: '/ai-companies.html',
  CRYPTO_NEW_JOBS: '/crypto-new-jobs.html',
  AI_NEW_JOBS: '/ai-new-jobs.html',
  FAVORITES: '/favorites.html',
};
