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

  test('favorites page should show login required message when not authenticated', async ({ page }) => {
    await page.goto('/favorites.html');
    
    // Should NOT redirect, but stay on favorites page
    await expect(page).toHaveURL(/\/favorites\.html/);
    
    // Should show login required message
    await expect(page.getByText(/login required/i)).toBeVisible();
    
    // Should show login link
    await expect(page.getByRole('link', { name: /log in or sign up/i })).toBeVisible();
  });

  test('should display error for invalid email', async ({ page }) => {
    await page.goto('/login.html');
    
    const emailInput = page.locator('input[type="email"]');
    const sendCodeBtn = page.locator('button:has-text("Send Code")');
    
    // Try invalid email
    await emailInput.fill('invalid-email');
    await sendCodeBtn.click();
    
    // HTML5 validation should prevent form submission
    // or error message should appear
    const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
    expect(isInvalid).toBe(true);
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
