# Documentation Index

Job Finder is a Svelte 5 and Vite job-search platform for Crypto, AI, and FinTech roles. This index points to the current documentation and the source files that define its generated category pages.

## Start Here

- [README.md](README.md): installation, development commands, routes, features, deployment, and test commands.
- [ARCHITECTURE.md](ARCHITECTURE.md): entry-point generation, routing, data flow, stores, services, charts, tests, and CI.
- [MODERNIZATION_PLAN.md](MODERNIZATION_PLAN.md): current verified baseline, CI policy, and open performance work.
- [MODERNIZATION_HISTORY.md](MODERNIZATION_HISTORY.md): completed modernization milestones and superseded context.

## Category Configuration

- [categories.config.js](categories.config.js): category source of truth for Crypto, AI, and FinTech metadata and data endpoints.
- [scripts/generate-entry-points.js](scripts/generate-entry-points.js): creates entry points, derived constants and category metadata, Vite inputs, sitemap, and robots rules.
- [categories.config.README.md](categories.config.README.md): configuration field reference.

### Adding a Category

1. Add jobs, companies, current-count, new-jobs, and history endpoints to [categories.config.js](categories.config.js).
2. Extend the typed category, service, store, page, and navigation mappings. The current implementation explicitly supports `crypto`, `ai`, and `fin`.
3. Run `npm run generate` and commit all generated changes.
4. Run `npm run lint`, `npm run format:check`, `npm run test`, `npm run build`, and relevant E2E coverage.

## Development and Testing

- `npm run dev`: run the Vite frontend at http://localhost:3000.
- `npm run dev:vercel`: run the frontend with local Vercel serverless functions.
- `npm run generate`: regenerate entry points and derived files after category changes.
- `npm run test`: run Vitest unit and component tests.
- `npm run test:e2e`: run Playwright E2E tests.
- `CI=1 npx playwright test --workers=2`: reproduce the CI browser-worker configuration locally.

## Supplemental Category Material

The documents below were created for the original category-generator rollout. They can provide examples and background, but the canonical workflow is in [README.md](README.md), [ARCHITECTURE.md](ARCHITECTURE.md), and [MODERNIZATION_PLAN.md](MODERNIZATION_PLAN.md). Confirm implementation details against the current source before following them.

- [ADDING_CATEGORIES.md](ADDING_CATEGORIES.md)
- [CATEGORY_CHECKLIST.md](CATEGORY_CHECKLIST.md)
- [CATEGORY_SYSTEM_OVERVIEW.md](CATEGORY_SYSTEM_OVERVIEW.md)
- [DYNAMIC_CATEGORIES.md](DYNAMIC_CATEGORIES.md)
- [EXAMPLE_ADD_CATEGORY.js](EXAMPLE_ADD_CATEGORY.js)
- [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)
- [QUICK_REFERENCE.md](QUICK_REFERENCE.md)
- [VISUAL_GUIDE.md](VISUAL_GUIDE.md)
