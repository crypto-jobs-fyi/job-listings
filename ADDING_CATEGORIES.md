# Adding New Job Categories

This guide explains how to add new job categories (like "DeFi", "Gaming", "Web3", etc.) to the Job Finder platform.

## Overview

The platform uses a dynamic category system configured in `categories.config.js`. Adding a new category automatically generates:
- Job listings page (`/{category}-jobs.html`)
- New jobs page (`/{category}-new-jobs.html`)
- Companies page (`/{category}-companies.html`)
- Entry point JavaScript files
- API endpoint configurations
- Homepage links with badges
- SEO metadata and sitemaps

## Step-by-Step Guide

### 1. Prepare Your JSON Data Files

You need to host 4 JSON files for your new category:

1. **Jobs List** (`{category}_jobs.json`): All job listings
2. **New Jobs** (`{category}_jobs_new.json`): Recently added jobs
3. **Companies** (`{category}_companies.json`): List of companies
4. **Current Stats** (`{category}_current.json`): Total job count (format: `{"Total Jobs": 123}`)

### 2. Edit `categories.config.js`

Add your new category to the `CATEGORIES` array in [`categories.config.js`](categories.config.js):

```javascript
export const CATEGORIES = [
  {
    id: 'crypto',
    name: 'Crypto',
    color: '#059669',
    hoverColor: '#047857',
    endpoints: { /* ... */ },
  },
  {
    id: 'ai',
    name: 'AI',
    color: '#8b5cf6',
    hoverColor: '#7c3aed',
    endpoints: { /* ... */ },
  },
  // Add your new category here:
  {
    id: 'defi',                    // Unique ID (lowercase, no spaces)
    name: 'DeFi',                  // Display name
    color: '#f59e0b',              // Button background color
    hoverColor: '#d97706',         // Button hover color
    endpoints: {
      jobs: 'https://example.com/path/to/defi_jobs.json',
      companies: 'https://example.com/path/to/defi_companies.json',
      current: 'https://example.com/path/to/defi_current.json',
      newJobs: 'https://example.com/path/to/defi_jobs_new.json',
    },
  },
];
```

#### Field Descriptions

- **id**: Unique identifier (lowercase, no spaces). Used in URLs and code.
- **name**: Display name shown to users (can have spaces, capitalization).
- **color**: CSS color for category buttons (hex or named color).
- **hoverColor**: CSS color for button hover state.
- **endpoints**: Object with 4 required URLs:
  - `jobs`: Main jobs list
  - `companies`: Companies list
  - `current`: Current stats (total jobs count)
  - `newJobs`: New/recent jobs

### 3. Generate Entry Points

Run the generation script:

```bash
node scripts/generate-entry-points.js
```

This will create:
- ✅ HTML files: `defi-jobs.html`, `defi-new-jobs.html`, `defi-companies.html`
- ✅ JS entry points: `src/defi-jobs.js`, `src/defi-new-jobs.js`, `src/defi-companies.js`
- ✅ Updated `src/utils/constants.ts` with new endpoints
- ✅ Updated `src/utils/categories.ts` with category metadata
- ✅ Updated `vite.config.js` with new entry points
- ✅ Updated `public/sitemap.xml` and `public/robots.txt`
- ✅ Updated homepage to show new category

### 4. Update the Jobs Store (If Needed)

The jobs store in [`src/stores/jobs.ts`](src/stores/jobs.ts) needs methods for each category. Add fetch methods for your new category:

```typescript
// In src/stores/jobs.ts

export interface JobsStoreState {
  // ... existing fields ...
  defiJobs: Job[];
  defiCompanies: Company[];
  defiNewJobs: Job[];
  defiTotal: number | null;
}

const defaultState: JobsStoreState = {
  // ... existing fields ...
  defiJobs: [],
  defiCompanies: [],
  defiNewJobs: [],
  defiTotal: null,
};

// Add fetch methods
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

  // Add similar methods for fetchDeFiNewJobs, etc.
};
```

### 5. Restart Development Server

If you're running the dev server:

```bash
npm run dev
```

Or restart it if already running.

### 6. Verify Changes

1. **Homepage**: Visit `http://localhost:5173` - you should see new category buttons
2. **Jobs Page**: Visit `http://localhost:5173/defi-jobs.html` - verify jobs load
3. **Companies Page**: Visit `http://localhost:5173/defi-companies.html` - verify companies load
4. **New Jobs**: Visit `http://localhost:5173/defi-new-jobs.html` - verify new jobs load
5. **Badges**: Check that job counts and company counts appear on homepage buttons

## Features Automatically Included

All new categories automatically get:

- ✅ **Search & Filters**: Full-text search, location filter, remote filter
- ✅ **Quick Filters**: Pre-defined filters (QA, DevOps, etc.)
- ✅ **Favorites**: Save/unsave jobs (localStorage)
- ✅ **Share Links**: Generate shareable links to specific jobs
- ✅ **Responsive Design**: Mobile-friendly layout
- ✅ **Dark/Light Mode**: Theme toggle
- ✅ **Job Deduplication**: Automatic removal of duplicate jobs
- ✅ **Caching**: Client-side caching of API responses
- ✅ **SEO**: Meta tags, Open Graph, Twitter Cards
- ✅ **Sitemap**: Automatic sitemap generation

## JSON Data Format

### Jobs JSON (`{category}_jobs.json`)

```json
{
  "data": [
    {
      "title": "Senior Smart Contract Engineer",
      "company": "Example DeFi Co",
      "location": "Remote",
      "description": "Build next-gen DeFi protocols...",
      "apply_url": "https://example.com/apply",
      "date_posted": "2026-01-15"
    }
  ]
}
```

### Companies JSON (`{category}_companies.json`)

```json
[
  {
    "name": "Example DeFi Co",
    "location": "San Francisco, CA",
    "description": "Leading DeFi protocol",
    "website": "https://example.com"
  }
]
```

### Current JSON (`{category}_current.json`)

```json
{
  "Total Jobs": 123
}
```

### New Jobs JSON (`{category}_jobs_new.json`)

Same format as main jobs JSON, but only recent listings.

## Example: Adding "Gaming" Category

```javascript
// categories.config.js
{
  id: 'gaming',
  name: 'Gaming',
  color: '#ef4444',
  hoverColor: '#dc2626',
  endpoints: {
    jobs: 'https://raw.githubusercontent.com/my-org/crawler/main/gaming_jobs.json',
    companies: 'https://raw.githubusercontent.com/my-org/crawler/main/gaming_companies.json',
    current: 'https://raw.githubusercontent.com/my-org/crawler/main/gaming_current.json',
    newJobs: 'https://raw.githubusercontent.com/my-org/crawler/main/gaming_jobs_new.json',
  },
}
```

Then run:
```bash
node scripts/generate-entry-points.js
```

Your gaming category will be live with all features!

## Troubleshooting

### Category not showing on homepage
- Ensure `node scripts/generate-entry-points.js` completed successfully
- Check that `src/utils/categories.ts` includes your category
- Verify the dev server was restarted

### Jobs not loading
- Check browser console for API errors
- Verify JSON URLs are publicly accessible
- Ensure JSON format matches expected structure
- Check that store methods were added for the new category

### Build errors
- Run `npm run lint` to check for TypeScript errors
- Ensure all required files were generated
- Check that `vite.config.js` includes new HTML files

## Removing a Category

To remove a category:

1. Delete the category object from `categories.config.js`
2. Run `node scripts/generate-entry-points.js`
3. Manually delete the HTML files and entry points (optional cleanup):
   ```bash
   rm {category}-jobs.html {category}-new-jobs.html {category}-companies.html
   rm src/{category}-jobs.js src/{category}-new-jobs.js src/{category}-companies.js
   ```
4. Remove store methods from `src/stores/jobs.ts`

## Advanced Customization

### Custom Colors

Use any CSS color format:
- Hex: `#059669`
- RGB: `rgb(5, 150, 105)`
- Named: `green`

### Category-Specific Features

To add features specific to one category, check the `category` prop in page components:

```svelte
<!-- In JobsPage.svelte -->
{#if category === 'defi'}
  <DeFiSpecialFeature />
{/if}
```

### Custom Endpoints

You can use different domain/paths for each category - they don't need to follow the same pattern.

## Need Help?

- Check [ARCHITECTURE.md](ARCHITECTURE.md) for system overview
- Review existing categories in `categories.config.js` as examples
- Look at `src/stores/jobs.ts` for fetch method patterns
