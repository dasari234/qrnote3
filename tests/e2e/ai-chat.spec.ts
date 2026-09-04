import { expect, test } from '@playwright/test';

test.describe('AI Chat', () => {
  test('sends a chat message', async ({ page }) => {
    await page.goto('/dashboard/ai');

    await expect(page.getByRole('textbox')).toBeVisible();

    await page.getByRole('textbox').fill('Explain React hooks');

    await page
      .getByRole('button', {
        name: /send/i,
      })
      .click();

    await expect(page.getByText('Explain React hooks')).toBeVisible();

    await expect(page.locator('[data-testid="assistant-message"]')).toBeVisible(
      {
        timeout: 60_000,
      }
    );
  });

  test('shows AI error state', async ({ page }) => {
    await page.route('**/api/chat', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: {
            code: 'AI_REQUEST_FAILED',
            message: 'Unable to process AI request.',
          },
        }),
      });
    });

    await page.goto('/dashboard/ai');

    await page.getByRole('textbox').fill('Test failure');

    await page
      .getByRole('button', {
        name: /send/i,
      })
      .click();

    await expect(page.getByText(/unable to process ai request/i)).toBeVisible();
  });

  test('uploads a document to AI chat', async ({ page }) => {
    await page.goto('/dashboard/ai');

    const fileInput = page.locator('input[type="file"]');

    await fileInput.setInputFiles('tests/fixtures/sample.txt');

    await expect(page.getByText('sample.txt')).toBeVisible();
  });

});
