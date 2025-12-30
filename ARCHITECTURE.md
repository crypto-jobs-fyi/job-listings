# Project Architecture Guide

## Overview
This document describes the modernized architecture of the Job Finder application, implemented as part of the Phase 1-3 modernization plan.

## Project Structure

```
src/
├── components/           # Reusable Svelte components
│   ├── JobBoard.svelte    # Generic job listing component
│   ├── SearchBar.svelte   # Search input component
│   ├── QuickFilters.svelte # Quick filter buttons
│   ├── TopMenu.svelte     # Navigation menu
│   └── ...                # Other shared components
├── pages/                # Page-level components
│   ├── HomePage.svelte    # Landing page
│   ├── JobsPage.svelte    # Generic jobs listing page
│   ├── CompaniesPage.svelte # Generic companies listing page
│   └── FavoritesPage.svelte # Favorites management page
├── stores/              # Svelte stores for state management
│   ├── favorites.ts     # Favorites store (Map-based)
│   ├── filters.ts       # Search filters store
│   ├── jobs.ts          # Job data store with caching
│   ├── theme.ts         # Dark mode theme store
│   └── ...              # Other shared stores
├── services/            # API and business logic services
│   ├── api.ts           # Generic HTTP utilities
│   ├── jobService.ts    # Job fetching logic
│   ├── companyService.ts # Company fetching logic
│   └── ...              # Other services
├── types/              # TypeScript type definitions
│   ├── job.ts          # Job-related types
│   ├── company.ts      # Company-related types
│   ├── favorites.ts    # Favorites-related types
│   └── ...             # Other type definitions
├── utils/              # Utility functions
│   ├── search.ts       # Search and filter utilities
│   ├── constants.ts    # Application constants
│   ├── pageConfig.ts   # Page configuration
│   └── ...             # Other utilities
├── scripts/            # Build and maintenance scripts
│   └── generate-entry-points.js # Auto-generates HTML/JS entry points
├── App.svelte          # Root component (acts as a router)
└── app.css             # Global styles
```

### Theme System
The application supports Light and Dark modes using a CSS variable-based system:
- **Store**: `src/stores/theme.ts` manages the `'light' | 'dark'` state with `localStorage` persistence.
- **Variables**: `src/app.css` defines semantic CSS variables (e.g., `--bg-color`, `--text-color`, `--card-bg`) for both themes.
- **Application**: `App.svelte` reactively applies the `data-theme` attribute to the `<html>` element.
- **Toggle**: `TopMenu.svelte` provides a theme switcher button with dynamic icons.

## Data Flow

### Multi-Page Entry Point System
The application uses a multi-page architecture where each page (e.g., `crypto-jobs.html`, `ai-jobs.html`) is auto-generated:
1. **Generation**: `scripts/generate-entry-points.js` creates HTML files and corresponding JS entry points.
2. **Configuration**: Each entry point sets `window.__PAGE_CONFIG__` with page-specific metadata.
3. **Routing**: `App.svelte` reads this configuration and conditionally renders the appropriate page component (`HomePage`, `JobsPage`, or `CompaniesPage`).

### Stores (Svelte Stores)
- **favorites.ts**: Manages favorite jobs with localStorage persistence
  - Uses a `Map<string, FavoriteJob>` for $O(1)$ lookups.
  - `toggle(job)`: Add/remove favorite
  - `isFavorite(jobId)`: Check if favorited
  - `getAll()`: Get all favorites as an array
- **filters.ts**: Manages search and filter state
  - `setCompanySearch()`
  - `setLocationSearch()`
  - `setTitleSearch()`
  - `setCategoryFilter()`
- **jobs.ts**: Manages job data with caching
  - `fetchCryptoJobs()`
  - `fetchAIJobs()`
  - `fetchCryptoNewJobs()`
  - `fetchAINewJobs()`

### Services
- **jobService.ts**: Fetches job data from GitHub API
  - `fetchCryptoJobs()`
  - `fetchAIJobs()`
  - `fetchCryptoNewJobs()`
  - `fetchAINewJobs()`
- **companyService.ts**: Fetches company data and utilities
  - `fetchCryptoCompanies()`
  - `fetchAICompanies()`
  - `getCompanyLogoUrl()`
  - `getCompanyUrl()`
- **api.ts**: Generic HTTP utilities
  - `fetchWithTimeout()`: Fetch with timeout handling
  - `fetchJSON<T>()`: Type-safe JSON fetching

### Components
- **JobBoard.svelte**: Generic, reusable job listing component
  - Accepts jobs array and configuration props
  - Handles search, filtering, grouping
  - Supports conditional search filters (company, title, location)
  - Integrates Quick Filters for common job roles
  - Manages favorite toggling
  - Provides LinkedIn sharing
  - **Context-Aware**: Adapts UI for Jobs, Companies, and Favorites views (e.g., hides Share button on Companies page, shows Clear All on Favorites page).
- **SearchBar.svelte**: Search input component with multi-term support
- **QuickFilters.svelte**: Quick filter buttons for common searches
  - Provides one-click filtering for roles like QA and DevOps
  - Populates the title search with relevant keywords
- **TopMenu.svelte**: Navigation menu

## Type Safety

All types are defined in `src/types/`:
- `Job`: Single job listing
- `JobsResponse`: API response for jobs
- `CurrentResponse`: API response for job counts
- `Company`: Company information
- `FavoriteJob`: Favorite job with metadata
- `FilterState`: Search and filter state

## State Management Pattern

1. **Components** render UI and collect user input
2. **Stores** manage application state reactively
3. **Services** handle API communication and data transformation
4. **Utilities** provide helper functions

Example:
```svelte
// Component subscribes to store
import { favorites } from '../stores/favorites';
let favoriteIds = new Set();
onMount(() => {
  favorites.subscribe(favs => {
    favoriteIds = new Set(favs.keys());
  });
});

// Component triggers store updates
function toggleFavorite(job) {
  favorites.toggle({ id: makeJobId(job), ...job });
}
```

## API Endpoints

All endpoints use the GitHub raw content CDN:
- Base: `https://raw.githubusercontent.com/crypto-jobs-fyi/crawler/refs/heads/main`

### Crypto Jobs
- `/jobs.json` - All crypto jobs
- `/jobs_new.json` - New crypto jobs (last 24-48h)
- `/companies.json` - Crypto companies
- `/current.json` - Total job count

### AI Jobs
- `/ai_jobs.json` - All AI jobs
- `/ai_jobs_new.json` - New AI jobs (last 24-48h)
- `/ai_companies.json` - AI companies
- `/ai_current.json` - Total job count

## Constants

All hardcoded values are centralized in `src/utils/constants.ts`:
- API endpoints
- Storage keys
- UI configuration
- Job categories
- Page routes

## Testing Strategy

The project uses **Vitest** for unit and component testing.

### Configuration
- **Browser Mode**: `vitest.config.js` is configured with `resolve: { conditions: ['browser'] }` to support Svelte 5 client-side component testing.
- **Environment**: `jsdom` is used to simulate the browser environment.

### Unit Tests
Utility functions in `src/utils/` and stores in `src/stores/` are unit tested:
- `matchesAnyTerm()` - Search matching logic
- `filterJobs()` - Job filtering logic
- `groupJobsByCompany()` - Job grouping logic
- `favorites` store - Adding/removing favorites and persistence
- `jobs` store - Data fetching and caching

### Component Tests
Key components and pages are tested using `@testing-library/svelte`:
- `HomePage.svelte`
- `FavoritesPage.svelte`
- `JobBoard.svelte`

## SEO Automation

- **Sitemap & Robots**: `scripts/generate-entry-points.js` automatically generates `sitemap.xml` and `robots.txt` based on the configured pages, ensuring all 8 entry points are indexable.

## UI/UX Design System

- **Notion-Like Aesthetic**: The UI follows a minimalist, content-first design inspired by Notion.
  - **Typography**: Inter font family.
  - **Components**: Pill-shaped buttons, transparent backgrounds, subtle borders.
  - **Interactions**: Hover states for interactivity without visual clutter.
- **Mobile Optimization**:
  - **Responsive Layouts**: Tables transform into card-based views on mobile devices (< 768px).
  - **Touch Targets**: Buttons and links are sized for touch interaction.
  - **Adaptive Navigation**: Layouts stack vertically on smaller screens.

## Performance Optimizations

1. **Multi-Page Generation**: Each page is a separate HTML file, reducing initial JS payload.
2. **Job Deduplication**: Uses `makeJobId(job)` to ensure unique entries across different API sources.
3. **Caching**: Jobs store caches fetched data to prevent redundant API calls.
4. **Timeouts**: API requests timeout after 15 seconds.
5. **Error Handling**: Graceful degradation on API failures with user-friendly error messages.

## Development Workflow

1. **Define types** in `src/types/`.
2. **Implement services** in `src/services/` for API logic.
3. **Create/Update stores** in `src/stores/` for state management.
4. **Develop components** in `src/components/` or `src/pages/`.
5. **Generate entry points** if adding new pages: `node scripts/generate-entry-points.js`.
6. **Verify** with `npm run lint` and `npm run test`.

## Code Quality

- **TypeScript**: Strict mode enabled across all `.ts` and `.svelte` files.
- **ESLint**: Enforced with `--max-warnings 0`.
- **Prettier**: Auto-formatting via husky pre-commit hooks.
- **Svelte 5**: Modern Svelte features used, including `mount` for application initialization.

## Migration Status

The migration from the legacy duplicated architecture to the modernized generic architecture is **complete**.
- **Generic Components**: `JobBoard.svelte` handles all job listing variations.
- **Centralized Logic**: All API calls and state management are moved to services and stores.
- **Type Safety**: Full TypeScript coverage for all data structures.

## Future Improvements

1. **SvelteKit Migration** - Transition to SvelteKit for better routing and SSR.
2. **E2E Testing** - Implement Playwright for end-to-end testing.
3. **PWA Support** - Add service workers for offline functionality.
4. **Enhanced Analytics** - Deeper integration with Vercel Analytics.
