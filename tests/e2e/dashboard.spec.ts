import { expect, test } from '@playwright/test';

test.describe('Dashboard', () => {
  test('shows dashboard after login', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(
      page.getByRole('heading', {
        name: 'Overview',
      })
    ).toBeVisible();

    await expect(
      page.getByRole('link', {
        name: /create qr code/i,
      })
    ).toBeVisible();

    await expect(page.getByText('Recent QR Codes')).toBeVisible();
  });
});
