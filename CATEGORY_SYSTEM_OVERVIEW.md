# Category System Overview

## Architecture Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     categories.config.js                         │
│                   (Single Source of Truth)                       │
│                                                                   │
│  CATEGORIES = [                                                  │
│    { id, name, color, hoverColor, endpoints },                  │
│    { id, name, color, hoverColor, endpoints },                  │
│  ]                                                               │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│          scripts/generate-entry-points.js                        │
│                (Run: node scripts/generate-entry-points.js)      │
│                                                                   │
│  Reads categories.config.js and generates:                      │
└────────────────────────┬────────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  HTML Files │  │  JS Entries │  │  Config TS  │
│             │  │             │  │             │
│ crypto-     │  │ src/crypto- │  │ constants.ts│
│ jobs.html   │  │ jobs.js     │  │ categories. │
│             │  │             │  │ ts          │
│ crypto-new- │  │ src/crypto- │  │             │
│ jobs.html   │  │ new-jobs.js │  │ vite.config │
│             │  │             │  │ .js         │
│ crypto-     │  │ src/crypto- │  │             │
│ companies.  │  │ companies.js│  │ sitemap.xml │
│ html        │  │             │  │ robots.txt  │
│             │  │             │  │             │
│ (same for   │  │ (same for   │  │             │
│  ai, defi,  │  │  ai, defi,  │  │             │
│  etc.)      │  │  etc.)      │  │             │
└─────────────┘  └─────────────┘  └─────────────┘
         │               │               │
         └───────────────┼───────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Application Runtime                           │
│                                                                   │
│  1. Entry point sets window.__PAGE_CONFIG__                     │
│  2. App.svelte routes to correct page component                 │
│  3. Page component reads from stores                            │
│  4. Stores fetch data from ENDPOINTS                            │
│  5. Components render with filters, search, favorites           │
└─────────────────────────────────────────────────────────────────┘
```

## File Generation Flow

```
Input: categories.config.js
    │
    ├─▶ For each category:
    │   │
    │   ├─▶ Generate HTML pages:
    │   │   ├─ {id}-jobs.html
    │   │   ├─ {id}-new-jobs.html
    │   │   └─ {id}-companies.html
    │   │
    │   ├─▶ Generate JS entry points:
    │   │   ├─ src/{id}-jobs.js
    │   │   ├─ src/{id}-new-jobs.js
    │   │   └─ src/{id}-companies.js
    │   │
    │   └─▶ Add to constants.ts:
    │       ├─ ENDPOINTS.{ID}_JOBS
    │       ├─ ENDPOINTS.{ID}_COMPANIES
    │       ├─ ENDPOINTS.{ID}_CURRENT
    │       ├─ ENDPOINTS.{ID}_NEW_JOBS
    │       └─ ROUTES.{ID}_JOBS, etc.
    │
    ├─▶ Generate categories.ts:
    │   └─ CATEGORIES array with metadata
    │
    ├─▶ Update vite.config.js:
    │   └─ Add all HTML files to build input
    │
    └─▶ Update SEO files:
        ├─ public/sitemap.xml
        └─ public/robots.txt
```

## Data Flow in Application

```
┌──────────────┐
│  User visits │
│  /ai-jobs.   │
│  html        │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────┐
│  HTML loads src/ai-jobs.js           │
│                                       │
│  window.__PAGE_CONFIG__ = {          │
│    type: 'jobs',                     │
│    category: 'ai',                   │
│    title: '...',                     │
│    description: '...'                │
│  }                                    │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  App.svelte reads pageConfig         │
│  and renders JobsPage component      │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  JobsPage.svelte                     │
│  - Subscribes to jobs store          │
│  - Calls jobs.fetchAIJobs()          │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  jobs.ts store                       │
│  - Fetches from ENDPOINTS.AI_JOBS    │
│  - Fetches from ENDPOINTS.AI_CURRENT │
│  - Updates store state               │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  JobsPage reactive updates           │
│  - Displays jobs list                │
│  - Enables search & filters          │
│  - Shows favorites button            │
│  - Enables share links               │
└──────────────────────────────────────┘
```

## Adding a New Category: Step-by-Step

```
Step 1: Edit categories.config.js
┌─────────────────────────────────────┐
│ Add category object with:           │
│ - id: 'defi'                        │
│ - name: 'DeFi'                      │
│ - color: '#f59e0b'                  │
│ - hoverColor: '#d97706'             │
│ - endpoints: { jobs, companies,     │
│              current, newJobs }     │
└─────────────────────────────────────┘
                │
                ▼
Step 2: Run Generation Script
┌─────────────────────────────────────┐
│ $ node scripts/generate-entry-      │
│   points.js                         │
│                                      │
│ ✓ Creates 3 HTML files              │
│ ✓ Creates 3 JS entry points         │
│ ✓ Updates constants.ts              │
│ ✓ Updates categories.ts             │
│ ✓ Updates vite.config.js            │
│ ✓ Updates sitemap & robots.txt      │
└─────────────────────────────────────┘
                │
                ▼
Step 3: Update stores/jobs.ts
┌─────────────────────────────────────┐
│ Add to interface:                   │
│ - defiJobs: Job[]                   │
│ - defiCompanies: Company[]          │
│ - defiNewJobs: Job[]                │
│ - defiTotal: number | null          │
│                                      │
│ Add methods:                         │
│ - fetchDeFiJobs()                   │
│ - fetchDeFiNewJobs()                │
└─────────────────────────────────────┘
                │
                ▼
Step 4: Update HomePage.svelte
┌─────────────────────────────────────┐
│ Update type-safe mapping:           │
│ - Add defi case to jobsCount        │
│ - Add defi case to companies        │
│ - Add fetchDeFiJobs() call          │
└─────────────────────────────────────┘
                │
                ▼
Step 5: Test
┌─────────────────────────────────────┐
│ $ npm run dev                       │
│                                      │
│ Visit:                               │
│ - / (homepage)                      │
│ - /defi-jobs.html                   │
│ - /defi-new-jobs.html               │
│ - /defi-companies.html              │
│                                      │
│ Verify all features work!           │
└─────────────────────────────────────┘
```

## Key Components

### 1. Configuration Layer
- `categories.config.js` - Single source of truth
- Contains all category definitions
- Validated on import

### 2. Generation Layer
- `scripts/generate-entry-points.js`
- Reads configuration
- Generates all necessary files
- Auto-updates build config

### 3. TypeScript Layer
- `src/utils/constants.ts` - Endpoints & routes
- `src/utils/categories.ts` - Category metadata
- Both auto-generated, type-safe

### 4. Application Layer
- `src/stores/jobs.ts` - Data fetching
- `src/pages/HomePage.svelte` - Category display
- `src/pages/JobsPage.svelte` - Job listings
- `src/pages/CompaniesPage.svelte` - Company listings

### 5. Features Layer (Auto-included)
- Search & Filters
- Quick Filters
- Favorites (localStorage)
- Share Links
- Responsive Design
- Dark/Light Mode
- SEO Metadata

## Example: 2 Categories vs 5 Categories

### With 2 Categories (Crypto, AI):
```
Files Generated:
├── crypto-jobs.html
├── crypto-new-jobs.html
├── crypto-companies.html
├── ai-jobs.html
├── ai-new-jobs.html
├── ai-companies.html
├── src/crypto-jobs.js
├── src/crypto-new-jobs.js
├── src/crypto-companies.js
├── src/ai-jobs.js
├── src/ai-new-jobs.js
└── src/ai-companies.js

Total: 12 files
```

### With 5 Categories (Crypto, AI, DeFi, Gaming, NFT):
```
Files Generated:
├── [all crypto files]
├── [all ai files]
├── defi-jobs.html
├── defi-new-jobs.html
├── defi-companies.html
├── gaming-jobs.html
├── gaming-new-jobs.html
├── gaming-companies.html
├── nft-jobs.html
├── nft-new-jobs.html
├── nft-companies.html
├── src/defi-jobs.js
├── src/defi-new-jobs.js
├── src/defi-companies.js
├── src/gaming-jobs.js
├── src/gaming-new-jobs.js
├── src/gaming-companies.js
├── src/nft-jobs.js
├── src/nft-new-jobs.js
└── src/nft-companies.js

Total: 30 files
```

All generated automatically! 🎉

## Color Scheme Guide

```
Category Type    │ Suggested Color  │ Color Code │ Use Case
─────────────────┼──────────────────┼────────────┼──────────────────
Finance/Crypto   │ Emerald/Green    │ #059669    │ Money, Growth
Technology/AI    │ Purple/Violet    │ #8b5cf6    │ Innovation, Tech
DeFi/Gold        │ Amber/Orange     │ #f59e0b    │ Value, Finance
Enterprise       │ Blue             │ #3b82f6    │ Trust, Stability
Gaming/Energy    │ Red/Rose         │ #ef4444    │ Excitement, Fun
Data/Analytics   │ Cyan/Sky         │ #06b6d4    │ Data, Insights
Creative/NFT     │ Pink/Magenta     │ #ec4899    │ Art, Creative
```

## Validation Rules

Categories are validated automatically:

✅ Required fields: `id`, `name`, `color`, `hoverColor`, `endpoints`  
✅ Endpoint URLs must start with `http`  
✅ No duplicate category IDs  
✅ All endpoint keys present: `jobs`, `companies`, `current`, `newJobs`  

If validation fails, the script will throw an error with details.

## Best Practices

1. **Naming**:
   - IDs: lowercase, no spaces (`defi`, `datascience`)
   - Names: user-friendly (`DeFi`, `Data Science`)

2. **Colors**:
   - Use distinct colors for each category
   - Test in both dark and light mode
   - Ensure good contrast with white text

3. **Endpoints**:
   - Use HTTPS URLs
   - Ensure URLs are publicly accessible
   - Follow the required JSON format

4. **Testing**:
   - Always test on localhost before deploying
   - Check all three pages (jobs, new-jobs, companies)
   - Verify badges show correct counts

5. **Documentation**:
   - Comment your category purpose
   - Document any special handling needed
   - Keep this README updated

## Troubleshooting Guide

| Problem | Solution |
|---------|----------|
| Category not on homepage | Re-run generation script + restart dev server |
| Jobs not loading | Check browser console, verify JSON URLs accessible |
| TypeScript errors | Update HomePage.svelte type-safe mapping |
| Build fails | Run `npm run lint`, check for missing imports |
| Wrong job count | Verify `current.json` format matches requirements |
| Missing companies | Check companies endpoint URL and JSON format |

## Performance Considerations

- **Client-side caching**: Jobs are cached in store after first fetch
- **Lazy loading**: Each category's data only loaded when visited
- **Deduplication**: Jobs automatically deduplicated by ID
- **Bundle size**: Each page loads only its required code (thanks to Vite)

## Future Enhancements

Possible improvements to the system:

- [ ] Auto-generate store methods from config
- [ ] Auto-update HomePage.svelte mappings
- [ ] Category-specific themes
- [ ] Category analytics/metrics
- [ ] Multi-language support per category
- [ ] Category-specific quick filters
- [ ] Dynamic category enable/disable without rebuild
