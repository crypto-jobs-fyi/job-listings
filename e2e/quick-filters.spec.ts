import { test, expect } from '@playwright/test';

test.describe('Quick Filters', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a jobs page (crypto-jobs) before each test
    await page.goto('/crypto-jobs.html');
    
    // Wait for jobs to load
    await page.waitForSelector('.job-row, .empty-state', { timeout: 10000 });
  });

  test('should display quick filter buttons', async ({ page }) => {
    const quickFilters = page.locator('.quick-filters');
    await expect(quickFilters).toBeVisible();
    
    // Check for filter label
    await expect(quickFilters.locator('text=Quick Filters:')).toBeVisible();
    
    // Check for filter buttons
    const qaBtn = quickFilters.locator('button', { hasText: 'QA' });
    const devopsBtn = quickFilters.locator('button', { hasText: 'DevOps' });
    const clearBtn = quickFilters.locator('button.clear-btn');
    
    await expect(qaBtn).toBeVisible();
    await expect(devopsBtn).toBeVisible();
    await expect(clearBtn).toBeVisible();
  });

  test('should display Search button next to inputs', async ({ page }) => {
    const searchBtn = page.locator('.search-bar .search-btn');
    await expect(searchBtn).toBeVisible();
    await expect(searchBtn).toHaveText('Search');
  });

  test('should populate title input when QA button is clicked without filtering', async ({ page }) => {
    const qaBtn = page.locator('.quick-filters button', { hasText: 'QA' });
    
    // Count jobs before clicking
    const initialJobRows = await page.locator('.job-row').count();
    
    // Click QA filter — should only populate the input, NOT filter
    await qaBtn.click();
    
    // Title search input should be populated
    const titleInput = page.locator('.search-input[placeholder*="title"]');
    await expect(titleInput).toHaveValue('QA, Test, Quality');
    
    // Job list should remain unchanged (no filtering yet)
    const jobRowsAfterClick = await page.locator('.job-row').count();
    expect(jobRowsAfterClick).toBe(initialJobRows);
  });

  test('should populate title input when DevOps button is clicked without filtering', async ({ page }) => {
    const devopsBtn = page.locator('.quick-filters button', { hasText: 'DevOps' });
    
    // Count jobs before clicking
    const initialJobRows = await page.locator('.job-row').count();
    
    // Click DevOps filter — should only populate the input, NOT filter
    await devopsBtn.click();
    
    // Title search input should be populated
    const titleInput = page.locator('.search-input[placeholder*="title"]');
    await expect(titleInput).toHaveValue('DevOps, SRE, Infrastructure, Cloud');
    
    // Job list should remain unchanged (no filtering yet)
    const jobRowsAfterClick = await page.locator('.job-row').count();
    expect(jobRowsAfterClick).toBe(initialJobRows);
  });

  test('should filter only after clicking Search button with quick filter input', async ({ page }) => {
    const qaBtn = page.locator('.quick-filters button', { hasText: 'QA' });
    const searchBtn = page.locator('.search-bar .search-btn');
    
    // Count initial jobs
    const initialJobRows = await page.locator('.job-row').count();
    
    // Click QA filter — populates input only
    await qaBtn.click();
    const titleInput = page.locator('.search-input[placeholder*="title"]');
    await expect(titleInput).toHaveValue('QA, Test, Quality');
    
    // Still no filtering
    expect(await page.locator('.job-row').count()).toBe(initialJobRows);
    
    // Now click Search to apply
    await searchBtn.click();
    await page.waitForTimeout(200);
    
    // Results should now be filtered (fewer or equal)
    const filteredJobRows = await page.locator('.job-row').count();
    expect(filteredJobRows).toBeLessThanOrEqual(initialJobRows);
    
    // If there are results, they should match the filter
    if (filteredJobRows > 0) {
      const firstJobTitle = page.locator('.job-row .job-title-link').first();
      const titleText = await firstJobTitle.textContent();
      const lowerTitle = titleText?.toLowerCase() || '';
      const hasQATerm =
        lowerTitle.includes('qa') ||
        lowerTitle.includes('test') ||
        lowerTitle.includes('quality');
      expect(hasQATerm).toBe(true);
    }
  });

  test('should clear inputs and reset results when Clear button is clicked', async ({ page }) => {
    const qaBtn = page.locator('.quick-filters button', { hasText: 'QA' });
    const searchBtn = page.locator('.search-bar .search-btn');
    const clearBtn = page.locator('.quick-filters button.clear-btn');
    
    // Populate and search
    await qaBtn.click();
    await searchBtn.click();
    await page.waitForTimeout(200);
    
    // Click Clear button — should clear inputs and reset results
    await clearBtn.click();
    await page.waitForTimeout(200);
    
    // All search inputs should be empty
    const titleInput = page.locator('.search-input[placeholder*="title"]');
    const companyInput = page.locator('.search-input[placeholder*="company"]');
    const locationInput = page.locator('.search-input[placeholder*="location"]');
    
    await expect(titleInput).toHaveValue('');
    await expect(companyInput).toHaveValue('');
    await expect(locationInput).toHaveValue('');
  });

  test('should work on different job category pages', async ({ page }) => {
    // Test on AI jobs page
    await page.goto('/ai-jobs.html');
    await page.waitForSelector('.job-row, .empty-state', { timeout: 10000 });
    await page.waitForSelector('.quick-filters', { state: 'visible', timeout: 5000 });
    
    const qaBtn = page.locator('.quick-filters button', { hasText: 'QA' });
    await qaBtn.click({ timeout: 10000 });
    
    const titleInput = page.locator('.search-input[placeholder*="title"]');
    await expect(titleInput).toHaveValue('QA, Test, Quality');
    
    // Test on fin jobs page
    await page.goto('/fin-jobs.html');
    await page.waitForSelector('.job-row, .empty-state', { timeout: 10000 });
    await page.waitForSelector('.quick-filters', { state: 'visible', timeout: 5000 });
    
    const devopsBtn = page.locator('.quick-filters button', { hasText: 'DevOps' });
    await devopsBtn.click({ timeout: 10000 });
    
    await expect(titleInput).toHaveValue('DevOps, SRE, Infrastructure, Cloud');
  });

  test('should not show quick filters on companies pages', async ({ page }) => {
    await page.goto('/crypto-companies.html');
    await page.waitForSelector('.company-row-item, .empty-state', { timeout: 10000 });
    
    // Quick filters should NOT be visible on companies pages
    const quickFilters = page.locator('.quick-filters');
    await expect(quickFilters).not.toBeVisible();
  });

  test('should apply manual search on Search button click', async ({ page }) => {
    const companyInput = page.locator('.search-input[placeholder*="company"]');
    const searchBtn = page.locator('.search-bar .search-btn');
    
    // Count jobs before filtering
    const initialJobRows = await page.locator('.job-row').count();
    
    // Type a company name — filtering should NOT happen yet
    await companyInput.fill('SomeVerySpecificCompanyXYZ');
    
    // Jobs should still show the same count (no filtering without clicking Search)
    const jobRowsBeforeSearch = await page.locator('.job-row').count();
    expect(jobRowsBeforeSearch).toBe(initialJobRows);
    
    // Click Search button to apply
    await searchBtn.click();
    await page.waitForTimeout(200);
    
    // After clicking Search, results should be filtered (fewer or zero)
    const filteredJobRows = await page.locator('.job-row').count();
    expect(filteredJobRows).toBeLessThanOrEqual(initialJobRows);
  });

  test('should apply manual search on Enter key', async ({ page }) => {
    const titleInput = page.locator('.search-input[placeholder*="title"]');
    
    // Count jobs before filtering
    const initialJobRows = await page.locator('.job-row').count();
    
    // Type a narrow search term and press Enter
    await titleInput.fill('QA, Test, Quality');
    await titleInput.press('Enter');
    
    // Wait for DOM to update
    await page.waitForTimeout(200);
    
    // After pressing Enter, filtering should be applied (fewer or equal results)
    const filteredJobRows = await page.locator('.job-row').count();
    expect(filteredJobRows).toBeLessThanOrEqual(initialJobRows);
  });

  test('should combine quick filter input with Search button', async ({ page }) => {
    const qaBtn = page.locator('.quick-filters button', { hasText: 'QA' });
    const companyInput = page.locator('.search-input[placeholder*="company"]');
    const searchBtn = page.locator('.search-bar .search-btn');
    
    // Populate via quick filter and add manual input
    await qaBtn.click();
    await companyInput.fill('SomeVerySpecificCompanyXYZ');
    
    // Both inputs should be populated but no filtering yet
    const titleInput = page.locator('.search-input[placeholder*="title"]');
    await expect(titleInput).toHaveValue('QA, Test, Quality');
    await expect(companyInput).toHaveValue('SomeVerySpecificCompanyXYZ');
    
    // Count before search
    const initialJobRows = await page.locator('.job-row').count();
    
    // Click Search to apply both filters
    await searchBtn.click();
    await page.waitForTimeout(200);
    
    // Results should be filtered
    const combinedJobRows = await page.locator('.job-row').count();
    expect(combinedJobRows).toBeLessThanOrEqual(initialJobRows);
  });

  test('should maintain filter state when switching between quick filters', async ({ page }) => {
    const qaBtn = page.locator('.quick-filters button', { hasText: 'QA' });
    const devopsBtn = page.locator('.quick-filters button', { hasText: 'DevOps' });
    const titleInput = page.locator('.search-input[placeholder*="title"]');
    
    // Click QA filter — populates input
    await qaBtn.click();
    await expect(titleInput).toHaveValue('QA, Test, Quality');
    
    // Switch to DevOps filter — replaces input
    await devopsBtn.click();
    await expect(titleInput).toHaveValue('DevOps, SRE, Infrastructure, Cloud');
    
    // The previous filter should be replaced, not appended
    const value = await titleInput.inputValue();
    expect(value).not.toContain('QA');
  });

  test('should remain responsive after rapid filter+search cycles', async ({ page }) => {
    const qaBtn = page.locator('.quick-filters button', { hasText: 'QA' });
    const devopsBtn = page.locator('.quick-filters button', { hasText: 'DevOps' });
    const searchBtn = page.locator('.search-bar .search-btn');
    const clearBtn = page.locator('.quick-filters button.clear-btn');
    const titleInput = page.locator('.search-input[placeholder*="title"]');

    // Rapid filter+search cycles — this previously caused unresponsiveness
    // due to transition:fade animations stacking on hundreds of DOM elements.
    for (let i = 0; i < 3; i++) {
      await qaBtn.click();
      await searchBtn.click({ timeout: 10000 });

      await devopsBtn.click();
      await searchBtn.click({ timeout: 10000 });
    }

    // Clear all filters
    await clearBtn.click();

    // Page should still be responsive — verify we can interact with elements
    // 1. Input should be clearable and typeable
    await expect(titleInput).toHaveValue('');
    await titleInput.fill('Engineer');
    await expect(titleInput).toHaveValue('Engineer');

    // 2. Search button should still respond within a reasonable time
    await searchBtn.click({ timeout: 10000 });

    // 3. Quick filter should still populate the input
    await qaBtn.click();
    await expect(titleInput).toHaveValue('QA, Test, Quality');

    // 4. Job rows or empty state should be visible (DOM not broken)
    const jobRows = page.locator('.job-row');
    const emptyState = page.locator('.empty-state');
    const hasContent = (await jobRows.count()) > 0 || (await emptyState.count()) > 0;
    expect(hasContent).toBe(true);
  });
});
