import { defineConfig, devices } from '@playwright/test';

/**
 * Read-only smoke E2E. Boots `next dev` and exercises the real render +
 * scroll/animation paths that jsdom can't (imperative scroll transforms, real
 * layout). Specs never submit an RSVP — that would write to the live Sanity
 * dataset. Override the target guest with E2E_GUEST_SLUG.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
