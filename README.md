# Job Finder

A modern job search platform for **AI** and **Crypto** industries, built with Svelte 5 and Vite.

> **✨ NEW**: Dynamic category system! Add new job categories (DeFi, Gaming, Web3, etc.) by editing one config file. See [DYNAMIC_CATEGORIES.md](DYNAMIC_CATEGORIES.md) for details.

## Features

- 🔍 **Multi-page Search**: Browse jobs by industry (Crypto, AI) and type (active, new job listings, companies)
- 🎯 **Dynamic Categories**: Easily add new job categories with automatic page generation
- ⭐ **Favorites Management**: Save jobs locally with persistent localStorage
- 🏢 **Company Directory**: Browse companies by industry with logos and links
- 📱 **Mobile Responsive**: Touch-friendly UI with responsive design
- ⚡ **Fast Search & Filtering**: Real-time multi-term search (company, location, title)
- 🔗 **Job Sharing**: LinkedIn share integration and QR codes
- 📊 **Analytics**: Vercel Analytics integrated
- 🏗️ **Type-Safe**: Full TypeScript support with strict mode
- 🧪 **Tested**: Vitest test suite with component tests
- 📝 **SEO-Ready**: Complete meta tags, Open Graph, structured data

## Adding New Job Categories

Want to add "DeFi", "Gaming", or other job categories? It's easy!

1. Edit `categories.config.js` with your category details
2. Run `node scripts/generate-entry-points.js`
3. Update the jobs store with fetch methods
4. Done! Your category is live with all features

See the complete guide: **[DYNAMIC_CATEGORIES.md](DYNAMIC_CATEGORIES.md)**

Quick references:
- 📖 [Quick Start Guide](QUICK_REFERENCE.md)
- 📚 [Complete Documentation](ADDING_CATEGORIES.md)
- 💻 [Code Examples](EXAMPLE_ADD_CATEGORY.js)
- 🏗️ [System Architecture](CATEGORY_SYSTEM_OVERVIEW.md)

## Tech Stack

- **Svelte 5** + **Vite** (latest versions)
- **TypeScript** (strict mode)
- **Svelte Stores** for state management
- **Vitest** for testing
- **ESLint + Prettier** for code quality
- **GitHub Raw CDN** for job data (no backend required)

## Quick Start

### Installation
```sh
npm install
```

### Development
```sh
npm run dev
```
Opens http://localhost:5173 with live reload.

### Build & Preview
```sh
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/        # Reusable UI components
├── pages/            # Page-level components (HomePage, JobsPage, CompaniesPage)
├── stores/           # Svelte stores (jobs, filters, favorites)
├── services/         # API services (jobService, companyService)
├── types/            # TypeScript type definitions
└── utils/            # Helpers and configuration
```

### Pages (Auto-Generated)

8 HTML entry points served from `scripts/generate-entry-points.js`:

- `/` — Homepage with job categories
- `/crypto-jobs.html` — All crypto job listings
- `/crypto-new-jobs.html` — New crypto jobs (24-48h)
- `/crypto-companies.html` — Crypto companies directory
- `/ai-jobs.html` — All AI job listings
- `/ai-new-jobs.html` — New AI jobs (24-48h)
- `/ai-companies.html` — AI companies directory
- `/favorites.html` — Saved favorite jobs

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run lint         # Check for linting errors
npm run lint:fix     # Auto-fix linting issues
npm run format       # Format with Prettier
npm run test         # Run tests once
npm run test:watch   # Watch test mode
npm run test:e2e     # Run Playwright E2E tests
```

### E2E Testing Details

Before running Playwright tests for the first time, you may need to install the required browsers:
```bash
npx playwright install
```

The tests run against the production build by default to ensure maximum accuracy:
```bash
npm run build
npm run test:e2e
```

**After adding pages/entry points:**
```bash
node scripts/generate-entry-points.js
```

## Data Source

Job data sourced from GitHub API (no authentication required):
```
https://raw.githubusercontent.com/crypto-jobs-fyi/crawler/refs/heads/main
```

Includes endpoints for:
- Crypto jobs and companies
- AI jobs and companies
- New job listings (24-48h)
- Job count statistics

## Key Patterns

### Store Subscriptions
Always use `onMount()` with proper cleanup:
```javascript
import { onMount } from 'svelte';
onMount(() => {
  const unsubscribe = favorites.subscribe(favs => {
    // Handle updates
  });
  return unsubscribe;
});
```

### Job Deduplication
Jobs are deduplicated using `makeJobId()`:
```typescript
const id = makeJobId(job);  // "${company}-${title}-${location}".toLowerCase()
```

### Favorites (Map-based)
Favorites store returns a `Map<string, FavoriteJob>`:
```typescript
const ids = new Set(Array.from(favs.keys()));
const jobs = Array.from(favs.values());
```

## Deployment

Deployed on **Vercel** with all pages auto-served as static routes. No server-side code required.

### Deploy via CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy to Preview:
   ```bash
   vercel
   ```

3. Deploy to Production:
   ```bash
   vercel --prod
   ```

## Architecture Deep Dive

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed documentation on routing, stores, and component patterns.

## AI Development

For AI coding agents and Copilot assistance, see [.github/copilot-instructions.md](.github/copilot-instructions.md) for critical patterns, architecture overview, and essential workflows.
