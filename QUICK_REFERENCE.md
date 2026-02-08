# Quick Reference: Dynamic Categories System

## 🎯 Quick Start

**Want to add a new category?** Follow these 3 simple steps:

### 1. Edit `categories.config.js`

```javascript
export const CATEGORIES = [
  // ... existing categories ...
  {
    id: 'your-category',
    name: 'Your Category',
    color: '#hex-color',
    hoverColor: '#hex-color',
    endpoints: {
      jobs: 'https://url-to/jobs.json',
      companies: 'https://url-to/companies.json',
      current: 'https://url-to/current.json',
      newJobs: 'https://url-to/new_jobs.json',
    },
  },
];
```

### 2. Run Generation Script

```bash
node scripts/generate-entry-points.js
```

### 3. Update Store Methods

Add fetch methods in `src/stores/jobs.ts` - see [EXAMPLE_ADD_CATEGORY.js](EXAMPLE_ADD_CATEGORY.js)

### 4. Update Navigation Header

Add links in `src/components/TopMenu.svelte`:

```svelte
<a href="/{category}-jobs.html" class="new-jobs-btn" 
   class:active={active === '{category}'}>{Category} Jobs</a>
<a href="/{category}-companies.html" class="new-jobs-btn" 
   class:active={active === '{category}-companies'}>{Category} Companies</a>
```

### 5. Restart and Test

```bash
npm run dev
```

## 📁 Key Files

| File | Purpose | Edit? |
|------|---------|-------|
| `categories.config.js` | Category definitions | ✅ YES |
| `scripts/generate-entry-points.js` | Generates all files | ❌ NO |
| `src/utils/constants.ts` | API endpoints | ❌ AUTO-GENERATED |
| `src/utils/categories.ts` | Category metadata | ❌ AUTO-GENERATED |
| `src/stores/jobs.ts` | Data fetching | ✅ YES |
| `src/pages/HomePage.svelte` | Homepage | ✅ YES (minor) |
| `src/components/TopMenu.svelte` | Navigation header | ✅ YES |

## 🔄 What Gets Auto-Generated

When you run `node scripts/generate-entry-points.js`:

✅ HTML files (e.g., `defi-jobs.html`)  
✅ JS entry points (e.g., `src/defi-jobs.js`)  
✅ `src/utils/constants.ts` (endpoints, routes)  
✅ `src/utils/categories.ts` (category data)  
✅ `vite.config.js` (build config)  
✅ `public/sitemap.xml` (SEO)  
✅ `public/robots.txt` (SEO)  

## 📋 Configuration Fields

```javascript
{
  id: 'lowercase-id',        // Used in URLs, no spaces
  name: 'Display Name',      // Shown to users
  color: '#059669',          // Button background (hex)
  hoverColor: '#047857',     // Button hover (hex)
  endpoints: {
    jobs: 'url',             // All jobs JSON
    companies: 'url',        // Companies JSON
    current: 'url',          // Stats JSON
    newJobs: 'url',          // New jobs JSON
  }
}
```

## 🎨 Suggested Colors

| Color | Hex | Hover Hex | Use Case |
|-------|-----|-----------|----------|
| Emerald | `#059669` | `#047857` | Crypto, Finance |
| Purple | `#8b5cf6` | `#7c3aed` | AI, Tech |
| Amber | `#f59e0b` | `#d97706` | DeFi, Gold |
| Blue | `#3b82f6` | `#2563eb` | Enterprise, Security |
| Red | `#ef4444` | `#dc2626` | Gaming, High Energy |
| Cyan | `#06b6d4` | `#0891b2` | Data, Analytics |
| Pink | `#ec4899` | `#db2777` | NFT, Creative |

## 📦 JSON Format Requirements

### Jobs JSON (`{category}_jobs.json`)

```json
{
  "data": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "location": "Location",
      "description": "Description...",
      "apply_url": "https://...",
      "date_posted": "2026-01-15"
    }
  ]
}
```

### Companies JSON (`{category}_companies.json`)

```json
[
  {
    "name": "Company Name",
    "location": "Location",
    "description": "Description...",
    "website": "https://..."
  }
]
```

### Current JSON (`{category}_current.json`)

```json
{
  "Total Jobs": 123
}
```

## 🔍 Testing Checklist

After adding a category, verify:

- [ ] Navigation header shows new category links
- [ ] Navigation links work correctly
- [ ] Active state highlights current page
- [ ] Homepage shows new category buttons
- [ ] Job count badge appears (if > 0)
- [ ] Company count badge appears (if > 0)
- [ ] `/{category}-jobs.html` loads jobs
- [ ] `/{category}-new-jobs.html` loads new jobs
- [ ] `/{category}-companies.html` loads companies
- [ ] Search works on all pages
- [ ] Filters work (location, remote, quick filters)
- [ ] Favorites work (save/unsave)
- [ ] Share links work
- [ ] Responsive design works on mobile
- [ ] Dark/light mode toggle works

## 🐛 Troubleshooting

### Category not showing on homepage

```bash
# Re-run generation script
node scripts/generate-entry-points.js

# Restart dev server
npm run dev
```

### Jobs not loading

1. Check browser console for errors
2. Verify JSON URLs are accessible
3. Check JSON format matches requirements
4. Ensure store methods were added

### TypeScript errors

```bash
# Check for errors
npm run lint

# The error might be in src/pages/HomePage.svelte
# Update the type-safe mapping (see EXAMPLE_ADD_CATEGORY.js)
```

## 📚 Full Documentation

- **Complete Guide**: [ADDING_CATEGORIES.md](ADDING_CATEGORIES.md)
- **Example Code**: [EXAMPLE_ADD_CATEGORY.js](EXAMPLE_ADD_CATEGORY.js)
- **Architecture**: [ARCHITECTURE.md](ARCHITECTURE.md)
- **Config README**: [categories.config.README.md](categories.config.README.md)

## 🚀 Example: Adding "DeFi" Category

```javascript
// 1. Edit categories.config.js
{
  id: 'defi',
  name: 'DeFi',
  color: '#f59e0b',
  hoverColor: '#d97706',
  endpoints: {
    jobs: 'https://raw.githubusercontent.com/your-org/crawler/main/defi_jobs.json',
    companies: 'https://raw.githubusercontent.com/your-org/crawler/main/defi_companies.json',
    current: 'https://raw.githubusercontent.com/your-org/crawler/main/defi_current.json',
    newJobs: 'https://raw.githubusercontent.com/your-org/crawler/main/defi_jobs_new.json',
  },
}
```

```bash
# 2. Generate files
node scripts/generate-entry-points.js
```

```typescript
// 3. Update src/stores/jobs.ts (see EXAMPLE_ADD_CATEGORY.js)
// Add: defiJobs, defiCompanies, defiNewJobs, defiTotal
// Add: fetchDeFiJobs(), fetchDeFiNewJobs()
```

```svelte
<!-- 4. Update src/components/TopMenu.svelte -->
<a href="/defi-jobs.html" class="new-jobs-btn" 
   class:active={active === 'defi'}>DeFi Jobs</a>
<a href="/defi-companies.html" class="new-jobs-btn" 
   class:active={active === 'defi-companies'}>DeFi Companies</a>
```

```bash
# 5. Restart and test
npm run dev
```

✅ Done! Your DeFi category is live.

## 💡 Pro Tips

- Use descriptive category names (shown to users)
- Keep IDs short and lowercase (used in URLs)
- Pick distinct colors for each category
- Test JSON URLs before adding
- Always restart dev server after generation
- Update HomePage.svelte type mapping for TypeScript safety

## 🔗 Related Files

- Configuration: `categories.config.js`
- Generation Script: `scripts/generate-entry-points.js`
- Jobs Store: `src/stores/jobs.ts`
- Homepage: `src/pages/HomePage.svelte`
- Navigation: `src/components/TopMenu.svelte`
- Constants: `src/utils/constants.ts` (auto-generated)
- Categories: `src/utils/categories.ts` (auto-generated)
