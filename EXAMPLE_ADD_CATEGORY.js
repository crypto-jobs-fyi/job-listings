/**
 * EXAMPLE: Adding a "DeFi" Category
 * 
 * This file demonstrates how to add a new job category.
 * Copy the configuration below to categories.config.js
 */

// In categories.config.js, add this to the CATEGORIES array:

export const CATEGORIES = [
  // ... existing categories (crypto, ai) ...
  
  // NEW CATEGORY EXAMPLE
  {
    id: 'defi',                      // Used in URLs: /defi-jobs.html
    name: 'DeFi',                    // Displayed on buttons and titles
    color: '#f59e0b',                // Button color (amber)
    hoverColor: '#d97706',           // Button hover color (darker amber)
    endpoints: {
      // These URLs must be publicly accessible
      jobs: 'https://raw.githubusercontent.com/your-org/crawler/main/defi_jobs.json',
      companies: 'https://raw.githubusercontent.com/your-org/crawler/main/defi_companies.json',
      current: 'https://raw.githubusercontent.com/your-org/crawler/main/defi_current.json',
      newJobs: 'https://raw.githubusercontent.com/your-org/crawler/main/defi_jobs_new.json',
    },
  },
];

/**
 * After adding the category:
 * 
 * STEP 1: Generate entry points
 * Run: node scripts/generate-entry-points.js
 * 
 * This creates:
 * - defi-jobs.html
 * - defi-new-jobs.html  
 * - defi-companies.html
 * - src/defi-jobs.js
 * - src/defi-new-jobs.js
 * - src/defi-companies.js
 * - Updates constants.ts with DEFI_JOBS, DEFI_COMPANIES, etc.
 * - Updates categories.ts with DeFi metadata
 * - Updates vite.config.js, sitemap.xml, robots.txt
 * 
 * STEP 2: Update the jobs store
 * Add to src/stores/jobs.ts:
 */

// In JobsStoreState interface:
export interface JobsStoreState {
  // ... existing fields ...
  defiJobs: Job[];
  defiCompanies: Company[];
  defiNewJobs: Job[];
  defiTotal: number | null;
}

// In defaultState:
const defaultState: JobsStoreState = {
  // ... existing fields ...
  defiJobs: [],
  defiCompanies: [],
  defiNewJobs: [],
  defiTotal: null,
};

// Add fetch methods:
return {
  subscribe,
  // ... existing methods ...
  
  /**
   * Fetch DeFi jobs
   */
  fetchDeFiJobs: async () => {
    update((state) => ({ ...state, loading: true, error: null }));
    try {
      const [jobsRes, companiesRes, currentRes] = await Promise.all([
        fetch(ENDPOINTS.DEFI_JOBS),
        fetch(ENDPOINTS.DEFI_COMPANIES),
        fetch(ENDPOINTS.DEFI_CURRENT),
      ]);

      const jobsData = (await jobsRes.json()) as JobsResponse;
      const companiesData = await companiesRes.json();
      const currentData = (await currentRes.json()) as CurrentResponse;

      const jobs = jobsData.data.filter((job) => job.company && job.location);

      update((state) => ({
        ...state,
        defiJobs: jobs,
        defiCompanies: companiesData,
        defiTotal: currentData['Total Jobs'],
        loading: false,
      }));
    } catch (error) {
      update((state) => ({
        ...state,
        error: `Failed to fetch DeFi jobs: ${error}`,
        loading: false,
      }));
      console.error('Error fetching DeFi jobs:', error);
    }
  },

  /**
   * Fetch new DeFi jobs
   */
  fetchDeFiNewJobs: async () => {
    update((state) => ({ ...state, loading: true, error: null }));
    try {
      const [jobsRes, companiesRes] = await Promise.all([
        fetch(ENDPOINTS.DEFI_NEW_JOBS),
        fetch(ENDPOINTS.DEFI_COMPANIES),
      ]);

      const jobsData = (await jobsRes.json()) as JobsResponse;
      const companiesData = await companiesRes.json();

      const jobs = jobsData.data.filter((job) => job.company && job.location);

      update((state) => ({
        ...state,
        defiNewJobs: jobs,
        defiCompanies: companiesData,
        loading: false,
      }));
    } catch (error) {
      update((state) => ({
        ...state,
        error: `Failed to fetch DeFi new jobs: ${error}`,
        loading: false,
      }));
      console.error('Error fetching DeFi new jobs:', error);
    }
  },
};

/**
 * STEP 3: Update HomePage.svelte
 * 
 * The homepage already dynamically renders all categories from CATEGORIES array.
 * You need to update the type-safe mapping in the onMount hook:
 */

// In src/pages/HomePage.svelte, update the subscribe callback:
onMount(() => {
  const unsubscribe = jobs.subscribe((state) => {
    categoryData = CATEGORIES.map((cat) => {
      // Add DeFi to the mapping
      const jobsCount = cat.id === 'crypto' ? state.cryptoTotal : 
                        cat.id === 'ai' ? state.aiTotal :
                        cat.id === 'defi' ? state.defiTotal : 0;  // ADD THIS LINE
      
      const companies = cat.id === 'crypto' ? state.cryptoCompanies :
                        cat.id === 'ai' ? state.aiCompanies :
                        cat.id === 'defi' ? state.defiCompanies : [];  // ADD THIS LINE
      
      return {
        ...cat,
        jobsCount: jobsCount || 0,
        companiesCount: companies?.length || 0,
      };
    });

    // Add fetch call for DeFi
    if (state.cryptoTotal === null && !state.loading) {
      jobs.fetchCryptoJobs();
    }
    if (state.aiTotal === null && !state.loading) {
      jobs.fetchAIJobs();
    }
    if (state.defiTotal === null && !state.loading) {  // ADD THESE LINES
      jobs.fetchDeFiJobs();
    }
  });

  return unsubscribe;
});

/**
 * STEP 4: Restart dev server
 * 
 * npm run dev
 * 
 * STEP 5: Test your new category
 * 
 * Visit:
 * - http://localhost:5173 (homepage should show DeFi buttons)
 * - http://localhost:5173/defi-jobs.html (all DeFi jobs)
 * - http://localhost:5173/defi-new-jobs.html (new DeFi jobs)
 * - http://localhost:5173/defi-companies.html (DeFi companies)
 * 
 * All features work automatically:
 * ✅ Search and filters
 * ✅ Quick filters
 * ✅ Favorites
 * ✅ Share links
 * ✅ Job count badges
 * ✅ Responsive design
 * ✅ Dark/light mode
 * ✅ SEO metadata
 */

/**
 * More Examples
 */

// Gaming Category
{
  id: 'gaming',
  name: 'Gaming',
  color: '#ef4444',      // Red
  hoverColor: '#dc2626',
  endpoints: {
    jobs: 'https://example.com/gaming_jobs.json',
    companies: 'https://example.com/gaming_companies.json',
    current: 'https://example.com/gaming_current.json',
    newJobs: 'https://example.com/gaming_jobs_new.json',
  },
}

// Web3 Category
{
  id: 'web3',
  name: 'Web3',
  color: '#8b5cf6',      // Purple
  hoverColor: '#7c3aed',
  endpoints: {
    jobs: 'https://example.com/web3_jobs.json',
    companies: 'https://example.com/web3_companies.json',
    current: 'https://example.com/web3_current.json',
    newJobs: 'https://example.com/web3_jobs_new.json',
  },
}

// Data Science Category
{
  id: 'datascience',
  name: 'Data Science',
  color: '#06b6d4',      // Cyan
  hoverColor: '#0891b2',
  endpoints: {
    jobs: 'https://example.com/datascience_jobs.json',
    companies: 'https://example.com/datascience_companies.json',
    current: 'https://example.com/datascience_current.json',
    newJobs: 'https://example.com/datascience_jobs_new.json',
  },
}

// NFT Category
{
  id: 'nft',
  name: 'NFT',
  color: '#ec4899',      // Pink
  hoverColor: '#db2777',
  endpoints: {
    jobs: 'https://example.com/nft_jobs.json',
    companies: 'https://example.com/nft_companies.json',
    current: 'https://example.com/nft_current.json',
    newJobs: 'https://example.com/nft_jobs_new.json',
  },
}

/**
 * Color Palette Suggestions
 */
const suggestedColors = {
  // Green shades (like Crypto)
  emerald: { color: '#059669', hover: '#047857' },
  green: { color: '#16a34a', hover: '#15803d' },
  
  // Purple shades (like AI)
  purple: { color: '#8b5cf6', hover: '#7c3aed' },
  violet: { color: '#a855f7', hover: '#9333ea' },
  
  // Blue shades
  blue: { color: '#3b82f6', hover: '#2563eb' },
  sky: { color: '#0ea5e9', hover: '#0284c7' },
  cyan: { color: '#06b6d4', hover: '#0891b2' },
  
  // Orange/Yellow shades
  amber: { color: '#f59e0b', hover: '#d97706' },
  orange: { color: '#f97316', hover: '#ea580c' },
  yellow: { color: '#eab308', hover: '#ca8a04' },
  
  // Red/Pink shades
  red: { color: '#ef4444', hover: '#dc2626' },
  rose: { color: '#f43f5e', hover: '#e11d48' },
  pink: { color: '#ec4899', hover: '#db2777' },
  
  // Others
  indigo: { color: '#6366f1', hover: '#4f46e5' },
  teal: { color: '#14b8a6', hover: '#0d9488' },
};

/**
 * JSON Data Format Examples
 */

// jobs.json format
const jobsJsonExample = {
  "data": [
    {
      "title": "Senior Smart Contract Engineer",
      "company": "Example DeFi Protocol",
      "location": "Remote",
      "description": "Build secure DeFi protocols...",
      "apply_url": "https://example.com/apply",
      "date_posted": "2026-01-15",
      "tags": ["Solidity", "Ethereum", "DeFi"]
    }
  ]
};

// companies.json format
const companiesJsonExample = [
  {
    "name": "Example DeFi Protocol",
    "location": "San Francisco, CA",
    "description": "Leading decentralized finance platform",
    "website": "https://example.com",
    "size": "50-100"
  }
];

// current.json format
const currentJsonExample = {
  "Total Jobs": 156
};
