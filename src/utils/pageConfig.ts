/**
 * Page configuration - defines all pages and their metadata
 */

export interface PageConfig {
  name: string;
  path: string;
  entry: string;
  htmlFile: string;
  title: string;
  description: string;
  type: 'jobs' | 'companies' | 'favorites' | 'home';
  category: 'crypto' | 'ai' | null;
}

export const PAGES: PageConfig[] = [
  {
    name: 'Home',
    path: '/',
    entry: 'src/main.js',
    htmlFile: 'index.html',
    title: 'Job Finder | Crypto & AI Jobs',
    description: 'Find your next crypto or AI job opportunity',
    type: 'home',
    category: null,
  },
  {
    name: 'Crypto Jobs',
    path: '/crypto-jobs.html',
    entry: 'src/crypto-jobs.js',
    htmlFile: 'crypto-jobs.html',
    title: 'Crypto Jobs | Job Finder',
    description: 'Find the latest cryptocurrency and blockchain jobs',
    type: 'jobs',
    category: 'crypto',
  },
  {
    name: 'AI Jobs',
    path: '/ai-jobs.html',
    entry: 'src/ai-jobs.js',
    htmlFile: 'ai-jobs.html',
    title: 'AI Jobs | Job Finder',
    description: 'Find the latest artificial intelligence and machine learning jobs',
    type: 'jobs',
    category: 'ai',
  },
  {
    name: 'Crypto New Jobs',
    path: '/crypto-new-jobs.html',
    entry: 'src/crypto-new-jobs.js',
    htmlFile: 'crypto-new-jobs.html',
    title: 'New Crypto Jobs | Job Finder',
    description: 'Find newly posted cryptocurrency and blockchain jobs',
    type: 'jobs',
    category: 'crypto',
  },
  {
    name: 'AI New Jobs',
    path: '/ai-new-jobs.html',
    entry: 'src/ai-new-jobs.js',
    htmlFile: 'ai-new-jobs.html',
    title: 'New AI Jobs | Job Finder',
    description: 'Find newly posted artificial intelligence and machine learning jobs',
    type: 'jobs',
    category: 'ai',
  },
  {
    name: 'Crypto Companies',
    path: '/crypto-companies.html',
    entry: 'src/crypto-companies.js',
    htmlFile: 'crypto-companies.html',
    title: 'Crypto Companies | Job Finder',
    description: 'Browse cryptocurrency and blockchain companies hiring',
    type: 'companies',
    category: 'crypto',
  },
  {
    name: 'AI Companies',
    path: '/ai-companies.html',
    entry: 'src/ai-companies.js',
    htmlFile: 'ai-companies.html',
    title: 'AI Companies | Job Finder',
    description: 'Browse AI and machine learning companies hiring',
    type: 'companies',
    category: 'ai',
  },
  {
    name: 'Favorites',
    path: '/favorites.html',
    entry: 'src/favorites.js',
    htmlFile: 'favorites.html',
    title: 'My Favorites | Job Finder',
    description: 'View your favorite job listings',
    type: 'favorites',
    category: null,
  },
];

/**
 * Get page config by path
 */
export function getPageByPath(path: string): PageConfig | undefined {
  return PAGES.find((p) => p.path === path);
}

/**
 * Get page config by category and type
 */
export function getPageByType(
  type: 'jobs' | 'companies',
  category: 'crypto' | 'ai'
): PageConfig | undefined {
  return PAGES.find((p) => p.type === type && p.category === category);
}

/**
 * Get all pages of a specific type
 */
export function getPagesByType(type: PageConfig['type']): PageConfig[] {
  return PAGES.filter((p) => p.type === type);
}
