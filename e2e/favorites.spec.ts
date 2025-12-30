import { test, expect } from '@playwright/test';

test.describe('Favorites Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test to ensure a clean state
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('should add a job to favorites and verify it on the favorites page', async ({ page }) => {
    // 1. Open ai-jobs page
    await page.goto('/ai-jobs.html');

    // Wait for jobs to load (JobBoard renders them)
    const firstJobRow = page.locator('.job-row').first();
    await expect(firstJobRow).toBeVisible();

    const jobTitle = await firstJobRow.locator('.job-title-link').textContent();
    const favoriteBtn = firstJobRow.locator('.favorite-btn');

    // 2. Add first job to favorite
    await favoriteBtn.click();

    // 3. Check After clicking (favorited): Shows filled star (★) in gold
    await expect(favoriteBtn).toHaveClass(/favorited/);
    await expect(favoriteBtn).toContainText('★');
    
    const starSpan = favoriteBtn.locator('span');
    await expect(starSpan).toHaveText('★');
    
    // Check color - Playwright can check computed styles
    const color = await starSpan.evaluate((el) => window.getComputedStyle(el).color);
    // #FFD700 is rgb(255, 215, 0)
    expect(color).toBe('rgb(255, 215, 0)');

    // 4. Open favorites page
    await page.goto('/favorites.html');

    // 5. Check that job is displayed
    const favoriteJobRow = page.locator('.job-row').first();
    await expect(favoriteJobRow).toBeVisible();
    const favoriteJobTitle = await favoriteJobRow.locator('.job-title-link').textContent();
    expect(favoriteJobTitle?.trim()).toBe(jobTitle?.trim());

    // 6. Unfavorite it
    const unfavoriteBtn = favoriteJobRow.locator('.favorite-btn');
    await unfavoriteBtn.click();

    // 7. Check that job is not displayed
    await expect(favoriteJobRow).toBeHidden();
    await expect(page.locator('text=You haven\'t saved any favorites yet!')).toBeVisible();
    await expect(page.locator('.job-row')).toHaveCount(0);
  });

  test('should persist favorites across page reloads', async ({ page }) => {
    await page.goto('/ai-jobs.html');
    const firstJobRow = page.locator('.job-row').first();
    await expect(firstJobRow).toBeVisible();
    
    const favoriteBtn = firstJobRow.locator('.favorite-btn');
    await favoriteBtn.click();
    await expect(favoriteBtn).toHaveClass(/favorited/);

    // Reload page
    await page.reload();
    await expect(page.locator('.job-row').first().locator('.favorite-btn')).toHaveClass(/favorited/);
    await expect(page.locator('.job-row').first().locator('.favorite-btn span')).toHaveText('★');
  });

  test('should show gold star for multiple favorited jobs', async ({ page }) => {
    await page.goto('/ai-jobs.html');
    const jobRows = page.locator('.job-row');
    await expect(jobRows.first()).toBeVisible();

    // Favorite first two jobs
    await jobRows.nth(0).locator('.favorite-btn').click();
    await jobRows.nth(1).locator('.favorite-btn').click();

    await expect(jobRows.nth(0).locator('.favorite-btn')).toHaveClass(/favorited/);
    await expect(jobRows.nth(1).locator('.favorite-btn')).toHaveClass(/favorited/);
    
    await page.goto('/favorites.html');
    await expect(page.locator('.job-row')).toHaveCount(2);
  });
});
