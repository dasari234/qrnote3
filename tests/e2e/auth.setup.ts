import { expect, test as setup } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  await page.goto('/login');

  await page.getByLabel('Email').fill(process.env.E2E_EMAIL!);

  await page.getByLabel('Password').fill(process.env.E2E_PASSWORD!);

  await page
    .getByRole('button', {
      name: /sign in/i,
    })
    .click();

  await expect(
    page.getByRole('heading', {
      name: 'Overview',
    })
  ).toBeVisible();

  await page.context().storageState({
    path: authFile,
  });
});
