# Project Architecture Guide

## Overview

This document describes the current Job Finder architecture. The active baseline, validation results, and planned performance work are maintained in `MODERNIZATION_PLAN.md`.

## Project Structure

```
.
├── api/                         # Vercel serverless functions
│   ├── admin/redis-data.js       # Authorized Redis administration
│   ├── auth/                     # Email code send/verify endpoints
│   ├── favorites/sync.js         # Redis-backed favorites synchronization
│   └── preferences/sync.js       # User preference synchronization
├── e2e/                          # Playwright browser tests
├── scripts/generate-entry-points.js
├── src/
│   ├── App.svelte                # Entry-point-driven page router
│   ├── app.css                   # Global theme variables and styles
│   ├── components/
│   │   ├── JobBoard.svelte       # Shared jobs, companies, and favorites UI
│   │   ├── JobHistoryChart.svelte # Modal Chart.js history visualization
│   │   ├── SearchBar.svelte
│   │   ├── QuickFilters.svelte
│   │   └── TopMenu.svelte
│   ├── pages/                    # Home, jobs, companies, account, admin, and auth pages
│   ├── services/
│   │   ├── api.ts                # Timeout, cache, and in-flight request deduplication
│   │   ├── dataValidation.ts     # Runtime job, company, and count validation
│   │   ├── jobService.ts
│   │   ├── companyService.ts
│   │   └── historyService.ts
│   ├── stores/                   # Auth, favorites, filters, jobs, preferences, and theme
│   ├── types/                    # Shared TypeScript data contracts
│   └── utils/                    # Search helpers and generated constants/categories
├── .github/
│   ├── instructions/             # Scoped Copilot instructions
│   └── workflows/ci.yml          # Quality, unit, and E2E jobs
├── categories.config.js          # Source of truth for configured categories/endpoints
├── playwright.config.ts
└── vitest.config.js
```

### Theme System

The application supports Light and Dark modes using a CSS variable-based system:

- **Store**: `src/stores/theme.ts` manages the `'light' | 'dark'` state with `localStorage` persistence.
- **Variables**: `src/app.css` defines semantic CSS variables (e.g., `--bg-color`, `--text-color`, `--card-bg`) for both themes.
- **Application**: `App.svelte` reactively applies the `data-theme` attribute to the `<html>` element.
- **Toggle**: `TopMenu.svelte` provides a theme switcher button with dynamic icons.

## Data Flow

### Multi-Page Entry Point System

The application uses 14 generated HTML and JavaScript entry points: the home page, three page types for each of Crypto, AI, and FinTech, plus favorites, login, account, and admin pages.

1. **Configuration**: `categories.config.js` defines every category and its jobs, companies, current-count, new-jobs, and history endpoints.
2. **Generation**: `npm run generate` creates category entry points, derived constants/categories, Vite inputs, `robots.txt`, and the sitemap.
3. **Configuration injection**: Each generated entry point sets `window.__PAGE_CONFIG__` before mounting `App.svelte` with Svelte 5's `mount()` API.
4. **Routing**: `App.svelte` conditionally renders the home, jobs/new-jobs, companies, favorites, login, account, or admin page from that configuration.

Generated outputs must not be edited by hand. Regenerate them after changing `categories.config.js` and commit the resulting files together.

### Job and Company Data Flow

1. A page asks `jobs.ts` for its category's jobs and/or companies.
2. The store calls `jobService.ts` and `companyService.ts`; stores do not fetch external job or company endpoints directly.
3. The services call `fetchJSON()` in `api.ts`, which enforces a 15-second timeout, validates successful HTTP responses, deduplicates concurrent requests, and caches successful data for five minutes.
4. `dataValidation.ts` validates job, company, and current-count shapes before data enters state.
5. `jobs.ts` stores data and independent `loading`, `error`, and `loadedAt` status for each jobs and companies resource. Aggregate `loading` and `error` fields remain for compatibility.

`historyService.ts` loads and caches history by category for company pages. History is non-blocking: a failed history request leaves company listings available without chart controls.

### Authentication Flow

The application uses email-based authentication with verification codes:

1. **Login Request**: User enters email on `/login.html`
2. **Code Generation**: `/api/auth/send-code` generates 4-digit code, stores in Redis (10min TTL), sends via Resend
3. **Code Verification**: User enters code, `/api/auth/verify-code` validates against Redis
4. **Session Management**: `auth` store persists user state in localStorage with 7-day (default) or 30-day (remember me) expiration
5. **Protected routes**: Account and admin pages require a valid session. The favorites page shows an in-page login-required state when unauthenticated.

### Stores (Svelte Stores)

- **auth.ts**: Manages authentication state with localStorage persistence
  - `login(email, rememberMe)`: Store user session
  - `logout()`: Clear auth state
  - `checkAuth()`: Validate session expiration
  - `getSessionExpiration()`: Get session end date
  - Session durations: 7 days (default) or 30 days (remember me)
- **favorites.ts**: Manages favorite jobs with localStorage and Redis persistence
  - Uses a `Map<string, FavoriteJob>` for $O(1)$ lookups.
  - **Cloud Sync**: Synchronizes favorites with Redis when the user is logged in.
  - `toggle(job)`: Add/remove favorite and sync to backend.
  - `clear()`: Removes all favorites locally and in the cloud.
  - `isFavorite(jobId)`: Check if favorited
  - `getAll()`: Get all favorites as an array
  - `requiresAuth()`: Check if user needs to login
- **filters.ts**: Manages search and filter state
  - `setCompanySearch()`
  - `setLocationSearch()`
  - `setTitleSearch()`
  - `setCategoryFilter()`
- **jobs.ts**: Manages job, company, and per-resource request state
  - `fetchCryptoJobs()`, `fetchAIJobs()`, `fetchFinJobs()`
  - `fetchCryptoNewJobs()`, `fetchAINewJobs()`, `fetchFinNewJobs()`
  - `fetchCompanies(category)` and `invalidateCache()`
  - `resources[resource]` exposes `loading`, `error`, and `loadedAt`

### Services

- **authService.ts**: Authentication API client
  - `sendVerificationCode(email)`: Request 4-digit code via email
  - `verifyCode(email, code)`: Validate verification code
  - `isValidEmail(email)`: Email format validation
  - Uses Resend for email delivery and Upstash Redis for code storage
- **jobService.ts**: Fetches job data from GitHub API
  - `fetchCryptoJobs()`, `fetchAIJobs()`, `fetchFinJobs()`
  - `fetchCryptoNewJobs()`, `fetchAINewJobs()`, `fetchFinNewJobs()`
- **companyService.ts**: Fetches company data and utilities
  - `fetchCryptoCompanies()`, `fetchAICompanies()`, `fetchFinTechCompanies()`
  - `getCompanyLogoUrl()`
  - `getCompanyUrl()`
- **historyService.ts**: Fetches and normalizes total and per-company history series.
- **api.ts**: Validated HTTP utilities with timeout, TTL cache, cache invalidation, and in-flight request deduplication.
- **dataValidation.ts**: Runtime validation for job, company, and current-count responses.

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
- **JobHistoryChart.svelte**: Modal Chart.js line chart for total and per-company job history. It sorts date data, renders the most recent 180 points, supports Escape/overlay/button closing, and destroys the chart on unmount.

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

### Job Data (GitHub CDN)

All endpoints use the GitHub raw content CDN:

- Base: `https://raw.githubusercontent.com/crypto-jobs-fyi/crawler/refs/heads/main`

#### Crypto Jobs

- `/crypto_jobs.json` - All crypto jobs
- `/crypto_jobs_new.json` - New crypto jobs (last 24-48h)
- `/crypto_companies.json` - Crypto companies
- `/crypto_current.json` - Total job count
- `/crypto_history.json` - Total and per-company job history

#### AI Jobs

- `/ai_jobs.json` - All AI jobs
- `/ai_jobs_new.json` - New AI jobs (last 24-48h)
- `/ai_companies.json` - AI companies
- `/ai_current.json` - Total job count
- `/ai_history.json` - Total and per-company job history

#### FinTech Jobs

- `/fin_jobs.json` - All FinTech jobs
- `/fin_jobs_new.json` - New FinTech jobs (last 24-48h)
- `/fin_companies.json` - FinTech companies
- `/fin_current.json` - Total job count
- `/fin_history.json` - Total and per-company job history

### Authentication (Vercel Serverless Functions)

- `/api/auth/send-code` - Generate and email 4-digit verification code
- `/api/auth/verify-code` - Validate verification code

### Favorites Sync (Vercel Serverless Functions)

- `/api/favorites/sync` - Synchronize favorites between local storage and the Redis backend.

**Rate Limiting**: 3 code requests per 10 minutes per email
**Code Expiration**: 10 minutes
**Security**: Centralized CORS handling in `api/config.js`.
**Services**: Resend (email), Upstash Redis (storage)

## Constants

All hardcoded values are centralized in `src/utils/constants.ts`:

- API endpoints (jobs, companies, history, and authentication)
- Storage keys (favorites, filters, auth state)
- UI configuration
- Job categories (crypto, ai, fin, all)
- Page routes (including login and account)
- Authentication config (session durations, code settings, rate limits)

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

### Service and Store Tests

- `api.ts` tests cache hits, concurrent request deduplication, invalidation, and invalid-response handling.
- `dataValidation.ts` tests accepted and rejected jobs, companies, and count payloads.
- `jobs.ts` tests service delegation and independent resource failures.

### End-to-End (E2E) Tests

Playwright runs six specs against Desktop Chrome and Mobile Chrome (Pixel 5 emulation). `fullyParallel` is enabled and CI uses two workers.

- Navigation, authentication, favorites, quick-filter, security, and job-history chart flows are covered in `e2e/`.
- `job-charts.spec.ts` mocks jobs, companies, counts, and history responses; it validates total and per-company chart modals, rendered canvases, and keyboard/button dismissal without relying on the live CDN.
- Run `npm run test:e2e` normally, or `CI=1 npx playwright test --workers=2` to reproduce the CI worker limit locally.

## CI/CD Pipeline

`.github/workflows/ci.yml` runs on pushes and pull requests to `main` with Node.js 24.

1. **quality** regenerates derived files, rejects generation drift, lints, checks formatting, and builds production assets.
2. **unit-tests** runs Vitest after the quality gate.
3. **e2e-tests** installs Playwright browsers, runs the browser suite, and uploads the HTML report even when tests fail.

Official actions use Node.js 24-compatible releases: `actions/checkout@v5`, `actions/setup-node@v5`, and `actions/upload-artifact@v6`. `.github/instructions/github-actions.instructions.md` governs new and modified workflows.

## SEO Automation

- **Sitemap & Robots**: `scripts/generate-entry-points.js` automatically generates `sitemap.xml` and `robots.txt` from the configured pages. Public generated pages are indexable; login, account, and admin pages are noindex.

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
3. **Caching**: The API service caches successful job and company responses for five minutes and coalesces concurrent requests; history data is cached by category.
4. **Timeouts**: API requests timeout after 15 seconds.
5. **Error Handling**: Per-resource loading and error state keeps independent data available when another resource fails. Company history failures do not block company listings.

## Development Workflow

1. **Define types** in `src/types/`.
2. **Implement services** in `src/services/` for API logic.
3. **Create/Update stores** in `src/stores/` for state management.
4. **Develop components** in `src/components/` or `src/pages/`.
5. **Generate entry points** after category configuration changes: `npm run generate`.
6. **Verify** with `npm run lint`, `npm run format:check`, `npm run test`, and `npm run build`.
7. **Test locally** with `npm run dev` for the Vite frontend or `npm run dev:vercel` when serverless functions are required.

### Environment Variables

Create a `.env` file in the project root with:

```
KV_REST_API_URL="your-upstash-redis-url"
KV_REST_API_TOKEN="your-upstash-redis-token"
RESEND_API_KEY="your-resend-api-key"
```

## Code Quality

- **TypeScript**: Strict mode is enabled across `.ts` and `.svelte` files.
- **Formatting and linting**: ESLint runs with zero warnings; Prettier checks source files in CI.
- **Svelte 5**: Generated entry points use `mount()` for application initialization.
- **Generated files**: CI runs `npm run generate` and fails when the result is not committed.

## Migration Status

The migration from the legacy duplicated architecture to the modernized generic architecture is **complete**.

- **Generic Components**: `JobBoard.svelte` handles all job listing variations.
- **Centralized Logic**: All API calls and state management are moved to services and stores.
- **Type Safety**: Full TypeScript coverage for all data structures.

## Future Improvements

1. **Performance measurement** - Add Web Vitals and API request instrumentation, baseline Lighthouse, and enforce per-entry-point JS/CSS budgets.
2. **Loading experience** - Extend the existing loading states with proven, accessible skeleton treatments where they improve perceived performance.
3. **Progressive web app support** - Evaluate service workers and offline behavior against real user needs.
4. **Accessibility audit** - Add automated accessibility checks and expand keyboard-flow E2E coverage.
