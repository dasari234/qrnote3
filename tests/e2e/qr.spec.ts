import { expect, test } from '@playwright/test';

test.describe('QR Codes', () => {
  test('opens create QR page', async ({ page }) => {
    await page.goto('/dashboard/qr');

    await page
      .getByRole('link', {
        name: /create qr code/i,
      })
      .click();

    await expect(
      page.getByRole('heading', {
        name: /create qr/i,
      })
    ).toBeVisible();
  });

  test('creates a URL QR code', async ({ page }) => {
    await page.goto('/dashboard/qr/new');

    await page.getByLabel(/name/i).fill('Playwright Test QR');

    await page.getByLabel(/url/i).fill('https://example.com');

    await page
      .getByRole('button', {
        name: /create qr/i,
      })
      .click();

    await expect(page.getByText('Playwright Test QR')).toBeVisible();
  });
});
