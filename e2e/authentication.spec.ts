import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should display login page with email input', async ({ page }) => {
    await page.goto('/login.html');
    
    const emailInput = page.locator('input[type="email"]');
    const sendCodeBtn = page.locator('button:has-text("Send Code")');
    
    await expect(emailInput).toBeVisible();
    await expect(sendCodeBtn).toBeVisible();
  });

  test('should redirect to login when accessing account page without auth', async ({ page }) => {
    await page.goto('/account.html');
    
    // Should redirect to login with return URL
    await expect(page).toHaveURL(/\/login\.html/);
  });

  test('should redirect to login when accessing admin page without auth', async ({ page }) => {
    await page.goto('/admin.html');
    
    // Should redirect to login with return URL
    await expect(page).toHaveURL(/\/login\.html/);
  });

  test('should redirect to login when accessing favorites page without auth', async ({ page }) => {
    await page.goto('/favorites.html');
    
    // Should redirect to login with return URL
    await expect(page).toHaveURL(/\/login\.html/);
  });

  test('should display error for invalid email', async ({ page }) => {
    await page.goto('/login.html');
    
    const emailInput = page.locator('input[type="email"]');
    const sendCodeBtn = page.locator('button:has-text("Send Code")');
    
    // Try invalid email
    await emailInput.fill('invalid-email');
    await sendCodeBtn.click();
    
    // Should show error
    const errorMsg = page.locator('text=/invalid|error/i');
    await expect(errorMsg).toBeVisible();
  });

  test('should show rate limit message after multiple attempts', async ({ page }) => {
    await page.goto('/login.html');
    
    const emailInput = page.locator('input[type="email"]');
    const sendCodeBtn = page.locator('button:has-text("Send Code")');
    const testEmail = `test-${Date.now()}@example.com`;
    
    // Try to send code 4 times (limit is 3)
    for (let i = 0; i < 4; i++) {
      await emailInput.fill(testEmail);
      await sendCodeBtn.click();
      
      // Wait for response
      await page.waitForTimeout(500);
    }
    
    // Should show rate limit error
    const rateLimitMsg = page.locator('text=/too many|rate limit|try again/i');
    await expect(rateLimitMsg).toBeVisible();
  });

  test('remember me checkbox should be accessible', async ({ page }) => {
    await page.goto('/login.html');
    
    const rememberCheckbox = page.locator('input[type="checkbox"]');
    
    // Checkbox might be optional/hidden, but if present should be interactive
    if (await rememberCheckbox.isVisible()) {
      await expect(rememberCheckbox).toBeEnabled();
    }
  });
});
