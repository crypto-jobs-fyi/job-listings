import { test, expect } from '@playwright/test';

test.describe('Navigation and Header', () => {
  test('should display sticky header on all pages', async ({ page }) => {
    await page.goto('/');
    
    // Check page header exists and is sticky
    const pageHeader = page.locator('.page-header');
    await expect(pageHeader).toBeVisible();
    
    // Check for theme toggle (renamed from theme-toggle-header to theme-toggle)
    const themeToggle = pageHeader.locator('.theme-toggle');
    await expect(themeToggle).toBeVisible();
    
    // Check for login button (not authenticated)
    const loginBtn = pageHeader.locator('.auth-btn-login');
    await expect(loginBtn).toBeVisible();
  });

  test('should toggle between light and dark theme', async ({ page }) => {
    await page.goto('/');
    
    const themeToggle = page.locator('.theme-toggle');
    
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
    
    // Desktop navigation should be visible on desktop viewports
    const desktopNav = page.locator('.desktop-nav');
    
    // Only check visibility on desktop viewport
    const viewport = page.viewportSize();
    if (viewport && viewport.width >= 768) {
      await expect(desktopNav).toBeVisible();
      
      // Should show section labels and category navigation links
      await expect(desktopNav.locator('text=Jobs:')).toBeVisible();
      await expect(desktopNav.locator('text=Companies:')).toBeVisible();
      
      // Check for first AI link (should be in Jobs section)
      const aiLink = desktopNav.locator('text=AI').first();
      await expect(aiLink).toBeVisible();
    }
  });

  test('mobile hamburger menu should work correctly', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/ai-jobs.html');
    
    const menuToggle = page.locator('.menu-toggle');
    const mobileNav = page.locator('.mobile-nav');
    
    // Menu should be hidden initially on mobile
    await expect(mobileNav).not.toHaveClass(/open/);
    
    // Click hamburger to open menu
    await menuToggle.click();
    
    // Menu should be open
    await expect(mobileNav).toHaveClass(/open/);
    
    // Check section labels and first category items are visible
    await expect(mobileNav.locator('text=Jobs')).toBeVisible();
    await expect(mobileNav.locator('text=Companies')).toBeVisible();
    await expect(mobileNav.locator('text=AI').first()).toBeVisible();
    await expect(mobileNav.locator('text=Crypto').first()).toBeVisible();
    
    // Click again to close
    await menuToggle.click();
    await expect(mobileNav).not.toHaveClass(/open/);
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
    
    // Check for category cards in the main content using more flexible matching for badges
    await expect(page.getByRole('link', { name: /Crypto Jobs/ }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /AI Jobs/ }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /FinTech Jobs/ }).first()).toBeVisible();
    
    await expect(page.getByRole('link', { name: /Crypto Companies/ }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /AI Companies/ }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /FinTech Companies/ }).first()).toBeVisible();
  });

  test('should navigate between category pages', async ({ page }) => {
    await page.goto('/');
    
    // Click on Crypto Jobs card in main content (skip nav links)
    await page.getByRole('link', { name: /Crypto Jobs \d+/ }).click();
    await page.waitForURL('/crypto-jobs.html');
    
    // On mobile, use the mobile menu; on desktop, use desktop nav
    const viewport = page.viewportSize();
    if (viewport && viewport.width < 768) {
      // Mobile: open hamburger menu
      await page.locator('.menu-toggle').click();
      // Use the first "AI" link (under Jobs) or specific one if needed
      // Actually, original test used "AI Companies" text, which is now just "AI" in the Companies section
      await page.locator('.mobile-nav').locator('text=AI').nth(1).click();
    } else {
      // Desktop: click in desktop nav
      // "AI" link in Companies section is the second one (index 1)
      await page.locator('.desktop-nav').locator('text=AI').nth(1).click();
    }
    await page.waitForURL('/ai-companies.html');
  });
});
