// @ts-check
/**
 * fixtures/api.fixture.js
 * -----------------------
 * Provides an isolated APIRequestContext for API / hybrid tests.
 * Disposed after each test (no leaked connections).
 */
import { test as base } from '@playwright/test';
import { env } from '../config/env.config.js';

export const test = base.extend({
  /**
   * Playwright request context pointed at API_BASE_URL (or BASE_URL).
   * Usage: const response = await api.get('/health');
   */
  api: async ({ playwright }, use) => {
    const api = await playwright.request.newContext({
      baseURL: env.apiBaseURL,
      extraHTTPHeaders: {
        Accept: 'application/json',
      },
    });

    await use(api);
    await api.dispose();
  },
});
