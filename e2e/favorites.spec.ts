import { test, expect } from '@playwright/test';

test.describe('Favorites Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test to ensure a clean state
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('favorites page should require authentication', async ({ page }) => {
    await page.goto('/favorites.html');

    // Should show in-page "Login Required" panel rather than redirect
    await expect(page).toHaveURL(/\/favorites\.html/);

    // Verify the login required message is visible
    await expect(page.getByText(/login required/i)).toBeVisible();

    // Verify there is a login link pointing to /login.html
    const loginLink = page.getByRole('link', { name: /login/i });
    await expect(loginLink).toBeVisible();
    await expect(loginLink).toHaveAttribute('href', /\/login\.html/);
  });

  test('should add a job to favorites (localStorage)', async ({ page }) => {
    // Clear auth to test localStorage-only mode
    await page.goto('/ai-jobs.html');

    // Wait for jobs to load (JobBoard renders them)
    const firstJobRow = page.locator('.job-row').first();
    await expect(firstJobRow).toBeVisible();

    const jobTitle = await firstJobRow.locator('.job-title-link').textContent();
    const favoriteBtn = firstJobRow.locator('.favorite-btn');

    // Add first job to favorite
    await favoriteBtn.click();

    // Check After clicking (favorited)
    await expect(favoriteBtn).toHaveClass(/favorited/);
    
    // Check that the job is marked as favorited (star should be visible)
    const starIcon = favoriteBtn.locator('svg');
    await expect(starIcon).toBeVisible();
  });

  test('should persist favorites in localStorage across page reloads', async ({ page }) => {
    await page.goto('/ai-jobs.html');
    const firstJobRow = page.locator('.job-row').first();
    await expect(firstJobRow).toBeVisible();
    
    const favoriteBtn = firstJobRow.locator('.favorite-btn');
    
    // Add to favorites
    await favoriteBtn.click();
    await expect(favoriteBtn).toHaveClass(/favorited/);

    // Reload page
    await page.reload();
    await expect(page.locator('.job-row').first()).toBeVisible();
    
    // Check that favorite persists
    const reloadedFavoriteBtn = page.locator('.job-row').first().locator('.favorite-btn');
    await expect(reloadedFavoriteBtn).toHaveClass(/favorited/);
  });

  test('should remove favorite when clicking again', async ({ page }) => {
    await page.goto('/ai-jobs.html');
    const firstJobRow = page.locator('.job-row').first();
    await expect(firstJobRow).toBeVisible();

    const favoriteBtn = firstJobRow.locator('.favorite-btn');
    
    // Add to favorites
    await favoriteBtn.click();
    await expect(favoriteBtn).toHaveClass(/favorited/);

    // Remove from favorites
    await favoriteBtn.click();
    await expect(favoriteBtn).not.toHaveClass(/favorited/);
  });

  test('should show multiple favorited jobs on jobs page', async ({ page }) => {
    await page.goto('/ai-jobs.html');
    const jobRows = page.locator('.job-row');
    await expect(jobRows.first()).toBeVisible();

    // Favorite first two jobs
    await jobRows.nth(0).locator('.favorite-btn').click();
    await jobRows.nth(1).locator('.favorite-btn').click();

    // Verify both are marked as favorited
    await expect(jobRows.nth(0).locator('.favorite-btn')).toHaveClass(/favorited/);
    await expect(jobRows.nth(1).locator('.favorite-btn')).toHaveClass(/favorited/);
  });

  test('should toggle favorites across different category pages', async ({ page }) => {
    // Favorite a job on Crypto page
    await page.goto('/crypto-jobs.html');
    const cryptoJobRow = page.locator('.job-row').first();
    await expect(cryptoJobRow).toBeVisible();
    
    const cryptoFavoriteBtn = cryptoJobRow.locator('.favorite-btn');
    const cryptoJobTitle = await cryptoJobRow.locator('.job-title-link').textContent();
    
    await cryptoFavoriteBtn.click();
    await expect(cryptoFavoriteBtn).toHaveClass(/favorited/);

    // Navigate to AI page
    await page.goto('/ai-jobs.html');
    const aiJobRow = page.locator('.job-row').first();
    await expect(aiJobRow).toBeVisible();
    
    const aiJobTitle = await aiJobRow.locator('.job-title-link').textContent();
    const aiJobTitle_ne_cryptoJobTitle = aiJobTitle?.trim() !== cryptoJobTitle?.trim();
    
    // Original crypto job favorite should not affect AI jobs
    // (unless they're the same job, which is unlikely)
    if (aiJobTitle_ne_cryptoJobTitle) {
      const aiFavoriteBtn = aiJobRow.locator('.favorite-btn');
      await expect(aiFavoriteBtn).not.toHaveClass(/favorited/);
    }
  });

  test('should handle favorite toggle rapidly', async ({ page }) => {
    await page.goto('/ai-jobs.html');
    const firstJobRow = page.locator('.job-row').first();
    await expect(firstJobRow).toBeVisible();

    const favoriteBtn = firstJobRow.locator('.favorite-btn');

    // Rapid toggles
    await favoriteBtn.click();
    await favoriteBtn.click();
    await favoriteBtn.click();

    // Final state should be favorited (odd number of clicks)
    await expect(favoriteBtn).toHaveClass(/favorited/);

    // Verify state persists after reload
    await page.reload();
    await expect(page.locator('.job-row').first().locator('.favorite-btn')).toHaveClass(/favorited/);
  });
});
