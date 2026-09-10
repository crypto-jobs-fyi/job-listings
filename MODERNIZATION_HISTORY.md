# Job Finder Modernization History

This changelog preserves historical milestones and superseded plans. Current commitments and verified status live in `MODERNIZATION_PLAN.md`.

## 2025-12-15: Modernization Plan v2.0

- Established Svelte 5, TypeScript, ESLint, Prettier, Vitest, and Playwright tooling.
- Consolidated job list views into shared page and board components.
- Introduced job, company, favorites, filter, preference, and theme stores.
- Added a configurable entry-point generator, API timeout handling, authentication, favorites synchronization, and initial CI.
- Recorded fixes for Svelte mounting, subscription lifecycle, cached loading UI, grouping, duplicate keys, and duplicate job records.

## 2026-09-10: Rebaseline

- Replaced the historical plan's eight-page inventory with the current 14-page scope: home, nine category pages across Crypto, AI, and FinTech, plus favorites, login, account, and admin pages.
- Superseded the "5 passing tests" baseline. Verification belongs in the current plan because test counts change over time.
- Superseded the claim that Vite uses dynamic globbing. Entry points are generated into Vite's explicit input list.
- Removed the unreferenced `src/utils/pageConfig.ts` file, which retained the obsolete Crypto/AI-only page catalog.
- Moved job and company loading behind validated services with five-minute caching, in-flight request deduplication, cache invalidation, and resource-specific request status.
- Added CI quality, unit-test, and E2E-test stages. The quality stage regenerates entry points and rejects generated-file drift.