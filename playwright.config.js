// @ts-check
/**
 * playwright.config.js
 * ---------------------
 * WHY THIS FILE EXISTS:
 * Playwright reads this file before every test run.
 * It controls: where tests live, which browser to use, base URL,
 * screenshots/videos/traces, retries, and reporters.
 *
 * Think of it as the "settings panel" for your entire framework.
 */
import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * WHY dotenv:
 * Credentials live in .env (not in code).
 * Without this, process.env.SUPER_ADMIN_EMAIL would be undefined
 * unless you manually set OS environment variables.
 *
 * WHY fileURLToPath:
 * We use ES modules ("type": "module" in package.json).
 * In ESM, __dirname is not available by default, so we recreate it.
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * WHY defineConfig:
 * Gives editor autocomplete and catches config typos early.
 */
export default defineConfig({
  // WHERE tests live
  testDir: './tests',

  // Run independent tests in parallel (faster on multi-core machines)
  fullyParallel: true,

  // Fail CI if someone left test.only() in the code (prevents accidental skip of other tests)
  forbidOnly: !!process.env.CI,

  // Retry flaky tests only on CI (locally we want to see failures immediately)
  retries: process.env.CI ? 2 : 0,

  // On CI use 1 worker for more stable runs; locally Playwright picks a sensible default
  workers: process.env.CI ? 1 : undefined,

  /**
   * WHY html reporter:
   * After a run you can open a clickable report with screenshots/traces.
   * Use: npm run report
   */
  reporter: [
    ['list'], // readable progress in the terminal (great while learning)
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
  ],

  /**
   * Shared settings for EVERY test (unless a project overrides them).
   */
  use: {
    /**
     * WHY baseURL:
     * Lets tests write: page.goto('/login')
     * instead of the full staging URL every time.
     * If the staging host changes, you update it in ONE place.
     */
    baseURL: 'https://staging.d1u0ld8155t0io.amplifyapp.com',

    /**
     * WHY screenshot / video / trace:
     * - screenshot on failure: visual proof of what the page looked like
     * - video retain-on-failure: replay the failing run
     * - trace on-first-retry: deep debug timeline (DOM, network, actions)
     *
     * We do NOT keep these for every PASS — that would bloat disk space.
     */
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',

    // Fail actions that hang too long (clicks, fills, etc.)
    actionTimeout: 15_000,

    // Fail navigations that hang too long
    navigationTimeout: 30_000,
  },

  /**
   * BROWSERS (projects)
   * -------------------
   * While learning, we run Chromium only (faster feedback).
   * Firefox / WebKit stay commented — enable later for cross-browser coverage.
   */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // Uncomment when you want cross-browser checks:
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  // No local webServer — we test against staging, not localhost.
});
