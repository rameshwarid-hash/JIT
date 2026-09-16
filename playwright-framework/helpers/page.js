// @ts-check
/**
 * helpers/page.js
 * ---------------
 * Small page helpers for optional UI (banners, dismiss buttons).
 * Do NOT wrap normal clicks/fills — use Playwright locators + expect instead.
 */
import { TIMEOUTS } from '../constants/timeouts.js';

/**
 * True when the locator is visible within `timeout`; false otherwise (no throw).
 * Use only for optional chrome (cookie banner, "Not now"), never for assertions
 * that must fail the test.
 *
 * @param {import('@playwright/test').Locator} locator
 * @param {number} [timeout]
 * @returns {Promise<boolean>}
 */
export async function isVisible(locator, timeout = TIMEOUTS.short) {
  try {
    await locator.waitFor({ state: 'visible', timeout });
    return true;
  } catch {
    return false;
  }
}

/**
 * Click the first matching control if it appears; no-op if absent.
 *
 * @param {import('@playwright/test').Page} page
 * @param {Array<string | RegExp>} buttonNames accessible names to try in order
 * @returns {Promise<boolean>} true if something was clicked
 */
export async function dismissIfPresent(page, buttonNames) {
  for (const name of buttonNames) {
    const button = page.getByRole('button', { name });
    if (await isVisible(button, TIMEOUTS.short)) {
      await button.click();
      return true;
    }
  }
  return false;
}
