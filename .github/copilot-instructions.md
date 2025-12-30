# Copilot Instructions for Job Listings

## Project Overview
Job Finder is a Svelte 5 + Vite job search platform for AI and Crypto industries. The codebase emphasizes modern architecture with TypeScript, reusable components, Svelte stores for state management, and automated entry point generation.
**Node.js Version**: v22 (LTS)

## Architecture Overview

### Key Principle: Multi-Page, Single-Purpose Entry Points
- **8 HTML entry points** (`index.html`, `crypto-jobs.html`, `ai-jobs.html`, etc.) are **auto-generated** from config
- **Each page loads a unique JavaScript entry point** (`src/crypto-jobs.js`, etc.)
- Entry points set `window.__PAGE_CONFIG__` to tell `App.svelte` which page to render
- `App.svelte` acts as a router—it conditionally renders `HomePage`, `JobsPage`, or `CompaniesPage` based on `pageConfig`
- **Never manually edit HTML files**; regenerate with `node scripts/generate-entry-points.js`

### Data Flow Pattern
1. **Page loads** → Entry point sets `window.__PAGE_CONFIG__` → `App.svelte` mounts appropriate page component
2. **Page component subscribes** to Svelte stores (`jobs`, `filters`, `favorites`)
3. **Stores fetch data** from GitHub API using services (`jobService`, `companyService`)
4. **Components filter/deduplicate** jobs using utility functions (`filterJobs`, `makeJobId`)
5. **User interacts** → store state updates → reactive Svelte bindings re-render

### File Organization
- **`src/components/`**: Reusable UI components (`JobBoard.svelte`, `SearchBar.svelte`)
- **`src/pages/`**: Page-level components (`HomePage.svelte`, `JobsPage.svelte`, `CompaniesPage.svelte`)
- **`src/stores/`**: Svelte stores for state (`jobs.ts`, `filters.ts`, `favorites.ts`)
- **`src/services/`**: API client functions (`jobService.ts`, `companyService.ts`, `api.ts`)
- **`src/types/`**: TypeScript interfaces (`job.ts`, `company.ts`, `favorites.ts`)
- **`src/utils/`**: Helpers and configuration (`search.ts`, `constants.ts`, `pageConfig.ts`, `pageFactory.ts`)

## Critical Patterns & Gotchas

### 1. **Job Deduplication is Essential**
The GitHub API contains duplicate job entries. Always use **`makeJobId(job)`** to generate composite keys:
```typescript
const id = makeJobId(job);  // Generates: "${company}-${title}-${location}".toLowerCase()
```
When rendering lists, deduplicate:
```javascript
const dedupedJobs = (() => {
  const seen = new Set<string>();
  return jobs.filter((job) => {
    const id = makeJobId(job);
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
})();
```

### 2. **Store Subscriptions Require Proper Lifecycle**
- **Don't use** `subscribe(...)()`—this unsubscribes immediately
- **Use** `onMount()` hook with proper unsubscribe handling:
```javascript
import { onMount } from 'svelte';
onMount(() => {
  const unsubscribe = favorites.subscribe((favs) => {
    // favs is now a Map<string, FavoriteJob>
  });
  return unsubscribe;  // Cleanup on component destroy
});
```

### 3. **Conditional Loading States**
When data is cached, show it immediately instead of re-showing the spinner:
```javascript
{#if loading && jobs.length === 0}
  <LoadingSpinner />
{:else if jobs.length > 0}
  <JobBoard {jobs} />
{:else}
  <NoResults />
{/if}
```

### 4. **Favorites Store Returns a Map, Not Array**
```typescript
// favorites.ts exposes a Map<string, FavoriteJob>
favorites.subscribe((favs) => {
  const ids = new Set(Array.from(favs.keys()));  // Convert to Set for quick lookups
  const jobs = Array.from(favs.values());        // Convert to array for iteration
});
```

### 5. **Entry Point Configuration Injection**
Each generated entry point (e.g., `src/crypto-jobs.js`) sets window config:
```javascript
// Entry points inject page metadata before mounting App
window.__PAGE_CONFIG__ = {
  type: 'jobs',        // 'home' | 'jobs' | 'companies' | 'new-jobs'
  category: 'crypto',  // 'crypto' | 'ai' | 'all'
  title: '...',
  description: '...'
};
```
`App.svelte` reads this and conditionally renders the right page component.

## Essential Commands & Workflows

### Development
```bash
npm run dev        # Start dev server at http://localhost:5173
npm run build      # Build for production
npm run test       # Run Vitest suite
npm run test:watch # Watch test mode
npm run lint       # Check ESLint errors (max-warnings=0)
npm run lint:fix   # Auto-fix linting issues
npm run format     # Format code with Prettier
```

### Generating Entry Points (After Adding Pages)
```bash
node scripts/generate-entry-points.js
```
This regenerates:
- All HTML files (8 total)
- All JavaScript entry points in `src/`
- Based on config in `scripts/generate-entry-points.js`

### Testing
- Test framework: **Vitest** (not Jest)
- Test files: `src/__tests__/*.js`, `src/pages/__tests__/*.js`, `src/stores/__tests__/*.js`
- Run with: `npm run test` (single run) or `npm run test:watch`
- Test utilities: `@testing-library/svelte` for component testing

### Type Checking
- TypeScript enabled in strict mode
- All stores, services, and types use `.ts` files
- Components use `<script lang="ts">` with full type checking
- **Never add `@ts-nocheck`** to disable checking

## Configuration Files
- **`vite.config.js`**: Defines build config with glob patterns for all entry points
- **`src/utils/constants.ts`**: Centralized API endpoints, storage keys, routes
- **`src/utils/pageConfig.ts`**: Page metadata and helpers (`getPageByPath`, `getPagesByType`)
- **`eslint.config.js`**: Linting rules (TypeScript, Svelte, max-warnings=0)
- **`svelte.config.js`**: Svelte-specific config
- **`vitest.config.js`**: Test runner config

## API Endpoints
All endpoints are centralized in `src/utils/constants.ts`:
```
Base: https://raw.githubusercontent.com/crypto-jobs-fyi/crawler/refs/heads/main

Crypto:  /jobs.json, /jobs_new.json, /companies.json, /current.json
AI:      /ai_jobs.json, /ai_jobs_new.json, /ai_companies.json, /ai_current.json
```

## Code Quality Standards
- **ESLint**: Enforced with `--max-warnings 0`
- **Prettier**: Auto-format before commit (via husky + lint-staged)
- **Tests**: Vitest required for feature additions
- **TypeScript**: Strict mode, no `@ts-ignore` shortcuts
- **Pre-commit**: husky + lint-staged validates all changes

## When Adding Features
1. **New page type?** Update `scripts/generate-entry-points.js`, then run generation
2. **New store?** Create `src/stores/mystore.ts` with writable/readable patterns
3. **New service?** Create `src/services/myservice.ts` with typed functions
4. **New component?** Create `src/components/MyComponent.svelte` with props documented
5. **New test?** Create alongside component: `src/components/__tests__/MyComponent.test.js`
6. **New API endpoint?** Add to `src/utils/constants.ts` ENDPOINTS
7. **Type definitions?** Add to `src/types/*.ts`

## Svelte 5 Specifics
- **No `new Component()`** syntax; use `import { mount } from 'svelte'` in entry points
- **Stores**: Still use `writable`/`readable` from `'svelte/store'`
- **Reactive declarations**: `$: variable = expression` syntax unchanged
- **Props**: Still declare with `export let propName`
- **Lifecycle**: `onMount`, `onDestroy` unchanged

## Deployment
- Hosted on Vercel
- Analytics integrated: `@vercel/analytics` injected at runtime
- All 8 HTML pages auto-deployed as separate routes
- No server-side code; pure static site
