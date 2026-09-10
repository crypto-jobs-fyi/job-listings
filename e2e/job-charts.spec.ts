import { expect, test, type Page } from '@playwright/test';

async function mockCryptoCompanyData(page: Page) {
  await page.route('**/crypto_jobs.json', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        data: [
          {
            company: 'Chart Labs',
            title: 'Data Engineer',
            location: 'Remote',
            link: 'https://example.test/jobs/data-engineer',
          },
        ],
      }),
    })
  );
  await page.route('**/crypto_companies.json', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify([{ company_name: 'Chart Labs' }]),
    })
  );
  await page.route('**/crypto_current.json', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ total_jobs: 1 }),
    })
  );
  await page.route('**/crypto_history.json', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        total_jobs: {
          '2026-09-01': 10,
          '2026-09-02': 12,
        },
        'chart labs': {
          '2026-09-01': 1,
          '2026-09-02': 2,
        },
      }),
    })
  );
}

async function expectChartCanvas(dialog: ReturnType<Page['getByRole']>) {
  const canvas = dialog.locator('canvas');
  await expect(canvas).toBeVisible();
  await expect
    .poll(() => canvas.evaluate((element: HTMLCanvasElement) => element.width))
    .toBeGreaterThan(0);
}

test.describe('Job history charts', () => {
  test.beforeEach(async ({ page }) => {
    await mockCryptoCompanyData(page);
    await page.goto('/crypto-companies.html');
    await expect(page.getByRole('button', { name: 'Total Jobs' })).toBeVisible();
  });

  test('opens the total jobs chart and closes it with Escape', async ({ page }) => {
    await page.getByRole('button', { name: 'Total Jobs' }).click();

    const dialog = page.getByRole('dialog', { name: 'Total Jobs' });
    await expect(dialog).toBeVisible();
    await expectChartCanvas(dialog);

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });

  test('opens a company jobs chart and closes it with its close button', async ({ page }) => {
    const companyRow = page.locator('.company-row-item', { hasText: 'Chart Labs' });
    await companyRow.locator('.company-chart-btn').click();

    const dialog = page.getByRole('dialog', { name: 'Chart Labs' });
    await expect(dialog).toBeVisible();
    await expectChartCanvas(dialog);

    await dialog.getByRole('button', { name: 'Close' }).click();
    await expect(dialog).toBeHidden();
  });
});
