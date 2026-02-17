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

  test('should filter jobs when QA button is clicked', async ({ page }) => {
    const qaBtn = page.locator('.quick-filters button', { hasText: 'QA' });
    
    // Click QA filter
    await qaBtn.click();
    
    // Wait a bit for filtering to apply (debounce is immediate for programmatic updates)
    await page.waitForTimeout(100);
    
    // Title search input should be populated
    const titleInput = page.locator('.search-input[placeholder*="title"]');
    await expect(titleInput).toHaveValue('QA, Test, Quality');
    
    // Should have fewer or equal jobs (filtered)
    const filteredJobRows = await page.locator('.job-row').count();
    
    // If there are QA jobs, check that they contain relevant terms
    if (filteredJobRows > 0) {
      const firstJobTitle = page.locator('.job-row .job-title-link').first();
      const titleText = await firstJobTitle.textContent();
      
      // Title should contain one of the QA-related terms (case insensitive)
      const lowerTitle = titleText?.toLowerCase() || '';
      const hasQATerm = 
        lowerTitle.includes('qa') || 
        lowerTitle.includes('test') || 
        lowerTitle.includes('quality');
      
      expect(hasQATerm).toBe(true);
    }
  });

  test('should filter jobs when DevOps button is clicked', async ({ page }) => {
    const devopsBtn = page.locator('.quick-filters button', { hasText: 'DevOps' });
    
    // Click DevOps filter
    await devopsBtn.click();
    
    // Wait a bit for filtering to apply
    await page.waitForTimeout(100);
    
    // Title search input should be populated
    const titleInput = page.locator('.search-input[placeholder*="title"]');
    await expect(titleInput).toHaveValue('DevOps, SRE, Infrastructure, Cloud');
    
    // If there are DevOps jobs, check that they contain relevant terms
    const filteredJobRows = await page.locator('.job-row').count();
    if (filteredJobRows > 0) {
      const firstJobTitle = page.locator('.job-row .job-title-link').first();
      const titleText = await firstJobTitle.textContent();
      
      // Title should contain one of the DevOps-related terms (case insensitive)
      const lowerTitle = titleText?.toLowerCase() || '';
      const hasDevOpsTerm = 
        lowerTitle.includes('devops') || 
        lowerTitle.includes('sre') || 
        lowerTitle.includes('infrastructure') || 
        lowerTitle.includes('cloud');
      
      expect(hasDevOpsTerm).toBe(true);
    }
  });

  test('should clear filters when Clear button is clicked', async ({ page }) => {
    const qaBtn = page.locator('.quick-filters button', { hasText: 'QA' });
    const clearBtn = page.locator('.quick-filters button.clear-btn');
    
    // Apply QA filter first
    await qaBtn.click();
    await page.waitForTimeout(100);
    
    // Verify filter is applied
    const titleInput = page.locator('.search-input[placeholder*="title"]');
    await expect(titleInput).toHaveValue('QA, Test, Quality');
    
    // Click Clear button
    await clearBtn.click();
    await page.waitForTimeout(100);
    
    // All search inputs should be empty
    await expect(titleInput).toHaveValue('');
    
    const companyInput = page.locator('.search-input[placeholder*="company"]');
    const locationInput = page.locator('.search-input[placeholder*="location"]');
    
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
    await page.waitForTimeout(100);
    
    const titleInput = page.locator('.search-input[placeholder*="title"]');
    await expect(titleInput).toHaveValue('QA, Test, Quality');
    
    // Test on fin jobs page
    await page.goto('/fin-jobs.html');
    await page.waitForSelector('.job-row, .empty-state', { timeout: 10000 });
    await page.waitForSelector('.quick-filters', { state: 'visible', timeout: 5000 });
    
    const devopsBtn = page.locator('.quick-filters button', { hasText: 'DevOps' });
    await devopsBtn.click({ timeout: 10000 });
    await page.waitForTimeout(100);
    
    await expect(titleInput).toHaveValue('DevOps, SRE, Infrastructure, Cloud');
  });

  test('should not show quick filters on companies pages', async ({ page }) => {
    await page.goto('/crypto-companies.html');
    await page.waitForSelector('.company-row-item, .empty-state', { timeout: 10000 });
    
    // Quick filters should NOT be visible on companies pages
    const quickFilters = page.locator('.quick-filters');
    await expect(quickFilters).not.toBeVisible();
  });

  test('should combine quick filters with manual search', async ({ page }) => {
    const qaBtn = page.locator('.quick-filters button', { hasText: 'QA' });
    const companyInput = page.locator('.search-input[placeholder*="company"]');
    
    // Apply QA filter
    await qaBtn.click();
    await page.waitForTimeout(100);
    
    // Type a company name
    await companyInput.fill('Coinbase');
    await page.waitForTimeout(500); // Wait for debounce
    
    // Both filters should be applied
    const titleInput = page.locator('.search-input[placeholder*="title"]');
    await expect(titleInput).toHaveValue('QA, Test, Quality');
    await expect(companyInput).toHaveValue('Coinbase');
    
    // If results exist, they should match both filters
    const jobRows = await page.locator('.job-row').count();
    if (jobRows > 0) {
      // Check that the visible company headers contain "Coinbase"
      const companyHeaders = page.locator('.company-header');
      const count = await companyHeaders.count();
      if (count > 0) {
        const firstCompany = await companyHeaders.first().textContent();
        expect(firstCompany?.toLowerCase()).toContain('coinbase');
      }
    }
  });

  test('should maintain filter state when switching between quick filters', async ({ page }) => {
    const qaBtn = page.locator('.quick-filters button', { hasText: 'QA' });
    const devopsBtn = page.locator('.quick-filters button', { hasText: 'DevOps' });
    const titleInput = page.locator('.search-input[placeholder*="title"]');
    
    // Apply QA filter
    await qaBtn.click();
    await page.waitForTimeout(100);
    await expect(titleInput).toHaveValue('QA, Test, Quality');
    
    // Switch to DevOps filter
    await devopsBtn.click();
    await page.waitForTimeout(100);
    await expect(titleInput).toHaveValue('DevOps, SRE, Infrastructure, Cloud');
    
    // The previous filter should be replaced, not appended
    const value = await titleInput.inputValue();
    expect(value).not.toContain('QA');
  });
});
