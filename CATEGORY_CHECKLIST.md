# ✅ Category Addition Checklist

Use this checklist when adding a new job category to ensure nothing is missed.

## Pre-requisites

- [ ] JSON data files are prepared and hosted
- [ ] JSON URLs are publicly accessible
- [ ] JSON format matches requirements (see below)
- [ ] Category name and ID decided
- [ ] Color scheme chosen

## Step 1: Configuration

- [ ] Open `categories.config.js`
- [ ] Add new category object to `CATEGORIES` array
- [ ] Set `id` (lowercase, no spaces, URL-friendly)
- [ ] Set `name` (user-facing display name)
- [ ] Set `color` (button background hex code)
- [ ] Set `hoverColor` (button hover hex code)
- [ ] Set all 4 endpoint URLs:
  - [ ] `jobs` URL
  - [ ] `companies` URL
  - [ ] `current` URL
  - [ ] `newJobs` URL
- [ ] Save file

## Step 2: Generate Files

- [ ] Run: `node scripts/generate-entry-points.js`
- [ ] Verify success messages:
  - [ ] ✓ Generated HTML files
  - [ ] ✓ Generated JS entry points
  - [ ] ✓ Generated constants.ts
  - [ ] ✓ Generated categories.ts
  - [ ] ✓ Updated vite.config.js
  - [ ] ✓ Updated sitemap.xml
  - [ ] ✓ Updated robots.txt
- [ ] Check that new files exist:
  - [ ] `{category}-jobs.html`
  - [ ] `{category}-new-jobs.html`
  - [ ] `{category}-companies.html`
  - [ ] `src/{category}-jobs.js`
  - [ ] `src/{category}-new-jobs.js`
  - [ ] `src/{category}-companies.js`

## Step 3: Update Jobs Store

Open `src/stores/jobs.ts`:

### A. Update Interface
- [ ] Add `{category}Jobs: Job[]` to `JobsStoreState`
- [ ] Add `{category}Companies: Company[]` to `JobsStoreState`
- [ ] Add `{category}NewJobs: Job[]` to `JobsStoreState`
- [ ] Add `{category}Total: number | null` to `JobsStoreState`

### B. Update Default State
- [ ] Add `{category}Jobs: []` to `defaultState`
- [ ] Add `{category}Companies: []` to `defaultState`
- [ ] Add `{category}NewJobs: []` to `defaultState`
- [ ] Add `{category}Total: null` to `defaultState`

### C. Add Fetch Methods
- [ ] Add `fetch{Category}Jobs()` method
  - [ ] Fetches from `ENDPOINTS.{CATEGORY}_JOBS`
  - [ ] Fetches from `ENDPOINTS.{CATEGORY}_COMPANIES`
  - [ ] Fetches from `ENDPOINTS.{CATEGORY}_CURRENT`
  - [ ] Updates all three state fields
  - [ ] Has error handling
- [ ] Add `fetch{Category}NewJobs()` method
  - [ ] Fetches from `ENDPOINTS.{CATEGORY}_NEW_JOBS`
  - [ ] Fetches from `ENDPOINTS.{CATEGORY}_COMPANIES`
  - [ ] Updates both state fields
  - [ ] Has error handling

## Step 4: Update Homepage

Open `src/pages/HomePage.svelte`:

- [ ] Add `{category}` case to `jobsCount` mapping
- [ ] Add `{category}` case to `companies` mapping
- [ ] Add `fetch{Category}Jobs()` call in data fetching section
- [ ] Save file

## Step 5: Update Navigation Header

Open `src/components/TopMenu.svelte`:

- [ ] Add `/{category}-jobs.html` link to navigation
- [ ] Add `/{category}-companies.html` link to navigation
- [ ] Links use correct `active` prop values
- [ ] Links display correct category name
- [ ] Save file

## Step 6: Verification

### Development Server
- [ ] Start/restart dev server: `npm run dev`
- [ ] Server starts without errors
- [ ] No console errors in terminal

### Navigation Header Tests
- [ ] Category links appear in top navigation
- [ ] Links have correct colors and styling
- [ ] Active state works when on category pages
- [ ] Mobile menu includes new category links

### Homepage Tests
- [ ] Visit `http://localhost:5173`
- [ ] New category buttons appear
- [ ] Buttons have correct color
- [ ] Buttons have correct hover color
- [ ] Job count badge appears (if jobs > 0)
- [ ] Job count shows correct number
- [ ] Company count badge appears (if companies > 0)
- [ ] Company count shows correct number

### Jobs Page Tests
- [ ] Visit `/{category}-jobs.html`
- [ ] Page loads without errors
- [ ] Jobs display correctly
- [ ] Job count is accurate
- [ ] Search box works
- [ ] Location filter works
- [ ] Remote filter works
- [ ] Quick filters work (QA, DevOps)
- [ ] Can click on jobs to expand details
- [ ] Apply links work
- [ ] Can save job to favorites
- [ ] Favorite icon toggles correctly
- [ ] Share link generates correctly
- [ ] Share link opens in new tab

### New Jobs Page Tests
- [ ] Visit `/{category}-new-jobs.html`
- [ ] Page loads without errors
- [ ] New jobs display correctly
- [ ] All features work (search, filters, favorites)

### Companies Page Tests
- [ ] Visit `/{category}-companies.html`
- [ ] Page loads without errors
- [ ] Companies display correctly
- [ ] Company logos show (if available)
- [ ] Company links work
- [ ] Search works
- [ ] Location filter works

### Mobile Tests
- [ ] Open DevTools mobile view
- [ ] Homepage layout adapts correctly
- [ ] Category buttons stack on mobile
- [ ] Jobs page is readable on mobile
- [ ] Filters work on mobile
- [ ] Can tap to expand jobs
- [ ] Can save favorites on mobile

### Theme Tests
- [ ] Toggle to dark mode
- [ ] All pages look correct in dark mode
- [ ] Category buttons visible in dark mode
- [ ] Toggle to light mode
- [ ] All pages look correct in light mode

### Browser Console
- [ ] No errors in browser console
- [ ] No warnings about missing data
- [ ] API calls succeed (check Network tab)

## Step 7: TypeScript & Linting

- [ ] Run: `npm run lint`
- [ ] No errors reported
- [ ] No warnings reported (max-warnings=0)
- [ ] All files pass TypeScript checks

## Step 8: Build Test

- [ ] Run: `npm run build`
- [ ] Build completes successfully
- [ ] No build errors
- [ ] Run: `npm run preview`
- [ ] Preview server starts
- [ ] Visit preview site
- [ ] New category works in production build

## Step 9: Documentation

- [ ] Update `categories.config.js` with comments if needed
- [ ] Add any special notes to `ADDING_CATEGORIES.md` if needed
- [ ] Update main `README.md` if new category type

## Step 10: Git Commit

- [ ] Stage all changes: `git add .`
- [ ] Review changes: `git status`
- [ ] Commit with clear message:
  ```bash
  git commit -m "Add {Category} job category
  
  - Added {category} to categories.config.js
  - Generated HTML and JS entry points
  - Updated jobs store with fetch methods
  - Updated homepage with category mapping
  - All features tested and working"
  ```
- [ ] Push to repository: `git push origin main`

## Step 11: Deployment

For Vercel (auto-deploy):
- [ ] Push triggers automatic deployment
- [ ] Check Vercel dashboard for deployment status
- [ ] Visit production URL
- [ ] Test new category on production
- [ ] Verify job counts update
- [ ] Verify all pages work

## Post-Deployment

- [ ] Visit production homepage
- [ ] New category visible
- [ ] Badges show correct counts
- [ ] All links work
- [ ] Share production URL with team
- [ ] Monitor analytics for traffic

## JSON Format Checklist

### Jobs JSON
- [ ] Has `data` array wrapper
- [ ] Each job has `title`
- [ ] Each job has `company`
- [ ] Each job has `location`
- [ ] Each job has `description`
- [ ] Each job has `apply_url`
- [ ] Each job has `date_posted`
- [ ] No jobs missing required fields

### Companies JSON
- [ ] Is an array (not object)
- [ ] Each company has `name`
- [ ] Each company has `location`
- [ ] Each company has `description`
- [ ] Each company has `website`
- [ ] All websites use HTTPS

### Current JSON
- [ ] Has `Total Jobs` key (exact spelling)
- [ ] Value is a number
- [ ] Number matches actual job count

### New Jobs JSON
- [ ] Same format as jobs JSON
- [ ] Contains only recent jobs
- [ ] All jobs have `date_posted`

## Troubleshooting

If something doesn't work:

- [ ] Re-run generation script
- [ ] Restart dev server
- [ ] Clear browser cache
- [ ] Check browser console for errors
- [ ] Verify JSON URLs are accessible
- [ ] Check JSON format is valid
- [ ] Review TypeScript errors
- [ ] Compare with existing category code
- [ ] Check [ADDING_CATEGORIES.md](ADDING_CATEGORIES.md) for details

## Success Criteria

You've successfully added a category when:

✅ Homepage shows new category buttons with correct colors  
✅ Job and company count badges display  
✅ All three pages load ({category}-jobs, -new-jobs, -companies)  
✅ Search and filters work on all pages  
✅ Favorites can be saved and loaded  
✅ Share links generate correctly  
✅ Mobile responsive design works  
✅ Dark/light mode works  
✅ No console errors  
✅ No TypeScript errors  
✅ No linting errors  
✅ Build succeeds  
✅ Production deployment works  

## Notes

- This checklist assumes you're adding a standard category
- For custom features, you may need additional steps
- Always test thoroughly before deploying to production
- Keep a backup before making major changes
- Document any deviations from standard process

## Time Estimate

- Configuration: 5 minutes
- Store updates: 10 minutes
- Homepage updates: 5 minutes
- Testing: 15 minutes
- Total: ~35 minutes for a standard category

## Questions?

See:
- [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Quick answers
- [ADDING_CATEGORIES.md](ADDING_CATEGORIES.md) - Complete guide
- [EXAMPLE_ADD_CATEGORY.js](EXAMPLE_ADD_CATEGORY.js) - Code examples
- [CATEGORY_SYSTEM_OVERVIEW.md](CATEGORY_SYSTEM_OVERVIEW.md) - Architecture

---

**Print this checklist** and check off items as you complete them!
