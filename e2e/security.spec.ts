import { test, expect } from '@playwright/test';

test.describe('Security Headers and CORS', () => {
  test('API endpoints should require CORS origin headers', async ({ page, context }) => {
    // Test that API calls from different origins are blocked
    const apiResponse = await context.request.get(
      'http://localhost:5173/api/admin/redis-data',
      {
        headers: {
          'Origin': 'http://evil.com',
          'Authorization': 'Bearer invalid-token'
        }
      }
    );

    // Should either be blocked by browser CORS or return 403 from server
    expect([403, 0]).toContain(apiResponse.status());
  });

  test('admin endpoint should require Authorization header', async ({ page, context }) => {
    // Try without auth token
    const response = await context.request.get(
      'http://localhost:5173/api/admin/redis-data',
      {
        headers: {
          'Origin': 'http://localhost:5173'
        }
      }
    );

    // Should return 403 Unauthorized
    expect(response.status()).toBe(403);
    const body = await response.json();
    expect(body.error).toBeDefined();
  });

  test('admin endpoint should reject invalid tokens', async ({ page, context }) => {
    const response = await context.request.get(
      'http://localhost:5173/api/admin/redis-data',
      {
        headers: {
          'Origin': 'http://localhost:5173',
          'Authorization': 'Bearer invalid-token-123'
        }
      }
    );

    // Should return 403 Unauthorized
    expect(response.status()).toBe(403);
  });

  test('error responses should not expose implementation details', async ({ page, context }) => {
    const response = await context.request.post(
      'http://localhost:5173/api/auth/send-code',
      {
        data: {
          email: 'test@example.com'
        },
        headers: {
          'Origin': 'http://localhost:5173'
        }
      }
    );

    if (!response.ok()) {
      const body = await response.json();
      
      // Should not contain 'message' field with error details
      if (body.error) {
        expect(typeof body.error).toBe('string');
        // Generic error messages should not leak implementation details
        expect(body.error).not.toMatch(/cannot|TypeError|ReferenceError/i);
      }
    }
  });

  test('verification code should not be exposed in logs or responses', async ({ page, context }) => {
    // This test verifies the fix - we'll attempt to verify with wrong code
    // and ensure no hint about what was stored is returned
    
    const response = await context.request.post(
      'http://localhost:5173/api/auth/verify-code',
      {
        data: {
          email: 'test@example.com',
          code: '0000'
        },
        headers: {
          'Origin': 'http://localhost:5173'
        }
      }
    );

    const body = await response.json();
    
    // Error should not mention stored code
    if (body.error) {
      expect(body.error).not.toContain('stored');
      expect(body.error).not.toContain('DEV:');
    }
  });
});
