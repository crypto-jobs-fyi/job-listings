# Quick Reference: Adding a Job Category

Job Finder currently supports the `crypto`, `ai`, and `fin` categories. `categories.config.js` drives generated routes and derived configuration, but adding a category also requires extending the explicitly typed runtime mappings.

## Category Configuration

Add a category with all five data endpoints to [categories.config.js](categories.config.js):

```js
{
  id: 'defi',
  name: 'DeFi',
  color: '#3b82f6',
  hoverColor: '#2563eb',
  endpoints: {
    jobs: 'https://example.com/defi_jobs.json',
    companies: 'https://example.com/defi_companies.json',
    current: 'https://example.com/defi_current.json',
    newJobs: 'https://example.com/defi_jobs_new.json',
    history: 'https://example.com/defi_history.json',
  },
}
```

| Field                  | Requirement                                                                    |
| ---------------------- | ------------------------------------------------------------------------------ |
| `id`                   | Unique lowercase identifier without spaces; it becomes part of generated URLs. |
| `name`                 | User-facing category name.                                                     |
| `color` / `hoverColor` | Valid CSS color values for category controls.                                  |
| `endpoints`            | HTTPS URLs for `jobs`, `companies`, `current`, `newJobs`, and `history`.       |

## Runtime Extension Checklist

Update every category-specific mapping for the new ID:

1. [src/types/job.ts](src/types/job.ts) and [src/App.svelte](src/App.svelte): extend the category union.
2. [src/services/jobService.ts](src/services/jobService.ts), [src/services/companyService.ts](src/services/companyService.ts), and [src/services/historyService.ts](src/services/historyService.ts): add the new endpoint selection and fetch functions.
3. [src/stores/jobs.ts](src/stores/jobs.ts): add job/company/new-job resources, totals, default state, and fetch methods.
4. [src/pages/JobsPage.svelte](src/pages/JobsPage.svelte), [src/pages/CompaniesPage.svelte](src/pages/CompaniesPage.svelte), and [src/pages/FavoritesPage.svelte](src/pages/FavoritesPage.svelte): extend category-specific loading and view mappings.
5. [src/pages/HomePage.svelte](src/pages/HomePage.svelte): add the category's counts and initial load. Links are already rendered from generated category metadata.
6. [src/components/TopMenu.svelte](src/components/TopMenu.svelte): add desktop and mobile navigation links.
7. Update or add focused unit and E2E coverage for the new category flow.

## Generated Outputs

Run the generator only after the configuration and runtime changes are in place:

```sh
npm run generate
```

It creates or updates:

- The three HTML and JavaScript entry points for jobs, new jobs, and companies.
- [src/utils/constants.ts](src/utils/constants.ts) and [src/utils/categories.ts](src/utils/categories.ts).
- [vite.config.js](vite.config.js), [public/sitemap.xml](public/sitemap.xml), and [public/robots.txt](public/robots.txt).

Do not hand-edit these generated outputs. Commit them with the source configuration change.

## Data Contracts

The runtime validators require these minimum payload shapes:

### Jobs

```json
{
  "data": [
    {
      "company": "Example Company",
      "title": "Senior Engineer",
      "location": "Remote",
      "link": "https://example.com/jobs/senior-engineer"
    }
  ]
}
```

`id`, `category`, and `postedDate` are optional. Invalid job responses are rejected before they enter store state.

### Companies

```json
[
  {
    "company_name": "Example Company",
    "company_url": "https://example.com",
    "jobs_url": "https://example.com/jobs",
    "logo_url": "https://example.com/logo.png"
  }
]
```

Only `company_name` is required by the validator. The remaining fields are optional.

### Current Count

```json
{
  "total_jobs": 123
}
```

### History

History is an object of date-to-count series. It must include `total_jobs`; company series use lowercase company names as keys.

```json
{
  "total_jobs": {
    "2026-09-09": 123
  },
  "example company": {
    "2026-09-09": 4
  }
}
```

## Verify the Change

```sh
npm run generate
npm run lint
npm run format:check
npm run test
npm run build
npm run test:e2e
```

To reproduce CI browser parallelism locally:

```sh
CI=1 npx playwright test --workers=2
```

Confirm the three generated routes load, navigation and home-page counts include the category, data failures show resource-specific errors, and company history charts open for the total and individual companies.

## Troubleshooting

| Symptom                         | Check                                                                                               |
| ------------------------------- | --------------------------------------------------------------------------------------------------- |
| Generated routes are missing    | Confirm the category has all five endpoints, then run `npm run generate`.                           |
| Route loads but data is empty   | Confirm every runtime mapping listed above includes the category and validate the response shape.   |
| History controls do not appear  | Ensure `history` is reachable, contains `total_jobs`, and has lowercase company keys.               |
| CI reports generated-file drift | Run `npm run generate` and commit its output.                                                       |
| A request fails unexpectedly    | Check the endpoint status and payload; services enforce a 15-second timeout and runtime validation. |

## Related Documentation

- [README.md](README.md): project setup and commands.
- [ARCHITECTURE.md](ARCHITECTURE.md): generated-entry-point, data-flow, and CI details.
- [MODERNIZATION_PLAN.md](MODERNIZATION_PLAN.md): required quality gates and current baseline.
- [DOCS_INDEX.md](DOCS_INDEX.md): documentation map and supplemental rollout material.
