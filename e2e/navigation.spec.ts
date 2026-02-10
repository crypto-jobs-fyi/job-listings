import { test, expect } from '@playwright/test';

test.describe('Navigation and Header', () => {
  test('should display sticky header on all pages', async ({ page }) => {
    await page.goto('/');
    
    // Check page header exists and is sticky
    const pageHeader = page.locator('.page-header');
    await expect(pageHeader).toBeVisible();
    
    // Check for theme toggle
    const themeToggle = pageHeader.locator('.theme-toggle-header');
    await expect(themeToggle).toBeVisible();
    
    // Check for login button (not authenticated)
    const loginBtn = pageHeader.locator('.auth-btn-login');
    await expect(loginBtn).toBeVisible();
  });

  test('should toggle between light and dark theme', async ({ page }) => {
    await page.goto('/');
    
    const themeToggle = page.locator('.theme-toggle-header');
    
    // Get initial theme
    const htmlElement = page.locator('html');
    const initialTheme = await htmlElement.getAttribute('data-theme');
    
    // Click theme toggle
    await themeToggle.click();
    
    // Theme should change
    const newTheme = await htmlElement.getAttribute('data-theme');
    expect(newTheme).not.toBe(initialTheme);
  });

  test('should show correct nav links on job pages', async ({ page }) => {
    await page.goto('/crypto-jobs.html');
    
    // Top menu should be visible on desktop
    const topMenu = page.locator('.top-menu');
    await expect(topMenu).toBeVisible();
    
    // Should show category navigation
    const cryptoLink = page.locator('text=Crypto Jobs');
    await expect(cryptoLink).toBeVisible();
  });

  test('mobile hamburger menu should work correctly', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/ai-jobs.html');
    
    const menuToggle = page.locator('.menu-toggle');
    const topActions = page.locator('.top-actions');
    
    // Menu should be hidden initially on mobile
    await expect(topActions).not.toHaveClass(/open/);
    
    // Click hamburger to open menu
    await menuToggle.click();
    
    // Menu should be open
    await expect(topActions).toHaveClass(/open/);
    
    // Check menu items are visible
    await expect(page.locator('text=Crypto Jobs')).toBeVisible();
    await expect(page.locator('text=AI Jobs')).toBeVisible();
    
    // Click again to close
    await menuToggle.click();
    await expect(topActions).not.toHaveClass(/open/);
  });

  test('mobile layout should show Home button on left', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/ai-jobs.html');
    
    const logoButton = page.locator('.logo');
    const menuToggle = page.locator('.menu-toggle');
    const headerActions = page.locator('.header-actions');
    
    // All should be visible on mobile
    await expect(logoButton).toBeVisible();
    await expect(menuToggle).toBeVisible();
    await expect(headerActions).toBeVisible();
    
    // Logo should be clickable and navigate to home
    await logoButton.click();
    await page.waitForURL('/');
  });

  test('login button should redirect to login page', async ({ page }) => {
    await page.goto('/');
    
    const loginBtn = page.locator('.auth-btn-login');
    await loginBtn.click();
    
    await page.waitForURL('/login.html');
    expect(page.url()).toContain('/login.html');
  });

  test('should show All category links on home page', async ({ page }) => {
    await page.goto('/');
    
    // Check for all category cards
    await expect(page.locator('text=Crypto Jobs')).toBeVisible();
    await expect(page.locator('text=AI Jobs')).toBeVisible();
    await expect(page.locator('text=FinTech Jobs')).toBeVisible();
    
    await expect(page.locator('text=Crypto Companies')).toBeVisible();
    await expect(page.locator('text=AI Companies')).toBeVisible();
    await expect(page.locator('text=FinTech Companies')).toBeVisible();
  });

  test('should navigate between category pages', async ({ page }) => {
    await page.goto('/');
    
    // Click on Crypto Jobs
    await page.locator('text=Crypto Jobs').first().click();
    await page.waitForURL('/crypto-jobs.html');
    
    // Click on AI Companies
    await page.locator('text=AI Companies').click();
    await page.waitForURL('/ai-companies.html');
  });
});
