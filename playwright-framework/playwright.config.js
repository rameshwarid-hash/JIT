// @ts-check
/**
 * playwright.config.js
 * --------------------
 * Playwright reads this file before every run.
 * Controls: test location, browsers, baseURL, parallel/retries,
 * reporters, and failure artifacts (screenshot / video / trace).
 */
import { defineConfig, devices } from '@playwright/test';
import { env } from './config/env.config.js';

/**
 * Prefer BASE_URL from the active .env* file (via config/env.config.js).
 * Fallback is local-only so the config can load before env files exist.
 * Never put staging/production URLs here.
 */
const baseURL = env.optional('BASE_URL', 'http://127.0.0.1:3000');

export default defineConfig({
  // Where spec files live (smoke / sanity / regression / api / visual)
  testDir: './tests',

  // Default pattern Playwright already uses; stated for clarity
  testMatch: '**/*.spec.js',

  // Independent tests in the same file can run in parallel
  fullyParallel: true,

  // Block test.only on CI so one focused test cannot silence the suite
  forbidOnly: !!process.env.CI,

  // Local: fail once (fast feedback). CI: retry flaky transient failures
  retries: process.env.CI ? 2 : 0,

  // CI: single worker = more stable shared-env runs. Local: Playwright default
  workers: process.env.CI ? 1 : undefined,

  // Per-test artifact root (screenshots, videos, traces live here by default).
  // Top-level screenshots/ videos/ traces/ are optional manual/export folders — see screenshots/README.md
  outputDir: 'test-results',

  // Global assertion timeout (web-first expects)
  expect: {
    timeout: 10_000,
  },

  // Maximum time one test may run
  timeout: 60_000,

  reporter: [
    // Terminal progress while the run is in progress
    ['list'],
    // HTML report path matches framework layout: reports/html
    [
      'html',
      {
        open: 'never',
        outputFolder: 'reports/html',
      },
    ],
    // Allure raw results → generate HTML via: npm run allure:report
    [
      'allure-playwright',
      {
        resultsDir: 'reports/allure-results',
        detail: true,
        suiteTitle: true,
        environmentInfo: {
          framework: 'playwright-framework',
          test_env: env.name,
          base_url: baseURL,
        },
      },
    ],
  ],

  use: {
    baseURL,

    // Capture evidence only when useful (keeps disks small on green runs)
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // retain-on-failure: traces even when local retries = 0
    trace: 'retain-on-failure',

    actionTimeout: 15_000,
    navigationTimeout: 30_000,

    // Stable viewport for consistent UI / visual baselines later
    viewport: { width: 1280, height: 720 },

    // Ignore HTTPS errors only when an env flag opts in (e.g. corporate proxy labs)
    ignoreHTTPSErrors: env.optional('IGNORE_HTTPS_ERRORS', 'false') === 'true',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
