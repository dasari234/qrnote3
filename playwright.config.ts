import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// Read from your local Next.js environment file layout
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html'], ['list']],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    // Change this from 'retain-on-failure' to 'off'
    video: 'off',
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
  },

  webServer: {
    command: 'npm run dev',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },

  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
      use: {
        // Enforce the pre-installed system browser for the authentication phase
        channel: 'chrome',
      },
    },

    {
      name: 'chromium',
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
        // Redirects Playwright to use your enterprise-approved stable Chrome
        channel: 'chrome',
      },
    },

    {
      name: 'mobile',
      dependencies: ['setup'],
      use: {
        ...devices['iPhone 13'],
        storageState: 'playwright/.auth/user.json',
        // Leverages stable Chrome under device viewport simulation conditions
        channel: 'chrome',
      },
    },
  ],
});
