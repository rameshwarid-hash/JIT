// @ts-check
/**
 * fixtures/base.fixture.js
 * ------------------------
 * Root fixture: exposes the loaded env object to every test.
 */
import { test as base } from '@playwright/test';
import { env } from '../config/env.config.js';

/**
 * @typedef {import('../config/env.config.js').env} AppEnv
 */

export const test = base.extend({
  /**
   * Active environment config (baseURL, apiBaseURL, required/optional).
   * Usage: async ({ appEnv }) => { await page.goto(appEnv.baseURL) }
   */
  appEnv: async ({}, use) => {
    await use(env);
  },
});
