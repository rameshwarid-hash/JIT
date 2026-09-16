// @ts-check
/**
 * helpers/network.js
 * ------------------
 * Playwright network helpers for UI + API hybrid asserts.
 * Prefer these over fixed sleeps when waiting on backend calls.
 */
import { TIMEOUTS } from '../constants/timeouts.js';

/**
 * Wait for a matching response, optionally starting the trigger in parallel.
 *
 * @param {import('@playwright/test').Page} page
 * @param {{
 *   url: string | RegExp,
 *   method?: string,
 *   status?: number,
 *   timeout?: number,
 * }} options
 * @param {() => Promise<unknown>} [trigger] action that causes the request
 * @returns {Promise<import('@playwright/test').Response>}
 */
export async function waitForApi(page, options, trigger) {
  const method = (options.method || 'GET').toUpperCase();
  const status = options.status;
  const timeout = options.timeout ?? TIMEOUTS.long;
  const urlMatcher = options.url;

  /** @param {import('@playwright/test').Response} response */
  const predicate = (response) => {
    const url = response.url();
    const urlOk =
      typeof urlMatcher === 'string'
        ? url.includes(urlMatcher)
        : urlMatcher.test(url);

    if (!urlOk) return false;
    if (response.request().method() !== method) return false;
    if (status !== undefined && response.status() !== status) return false;
    return true;
  };

  if (trigger) {
    const [response] = await Promise.all([
      page.waitForResponse(predicate, { timeout }),
      trigger(),
    ]);
    return response;
  }

  return page.waitForResponse(predicate, { timeout });
}

/**
 * Collect pageerror + console error messages while `action` runs.
 * Always removes listeners in `finally` (no leaks across tests).
 *
 * @param {import('@playwright/test').Page} page
 * @param {() => Promise<void>} action
 * @returns {Promise<string[]>}
 */
export async function collectConsoleErrors(page, action) {
  /** @type {string[]} */
  const errors = [];

  /** @param {Error} error */
  const onPageError = (error) => {
    errors.push(error.message);
  };

  /** @param {import('@playwright/test').ConsoleMessage} message */
  const onConsole = (message) => {
    if (message.type() === 'error') {
      errors.push(message.text());
    }
  };

  page.on('pageerror', onPageError);
  page.on('console', onConsole);

  try {
    await action();
  } finally {
    page.off('pageerror', onPageError);
    page.off('console', onConsole);
  }

  return errors;
}
