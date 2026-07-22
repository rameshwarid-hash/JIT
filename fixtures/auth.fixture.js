// @ts-check
/**
 * fixtures/auth.fixture.js
 * ------------------------
 * WHY THIS FILE EXISTS:
 * Almost every Super Admin test needs a logged-in session.
 * Putting login steps in every test would DUPLICATE LoginPage usage
 * and make specs noisy.
 *
 * This fixture reuses the EXISTING LoginPage + users.js.
 * It does NOT recreate login locators or hardcode credentials.
 *
 * HOW TO USE IN SPECS:
 *   import { test, expect } from '../../fixtures/auth.fixture.js';
 *   await loginAs(users.superAdmin);
 */
import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';

/**
 * Dismiss one-time UI prompts that can block the dashboard
 * (notification permission banner, etc.).
 * Safe no-ops when the prompts are not present.
 *
 * @param {import('@playwright/test').Page} page
 */
async function dismissTransientPrompts(page) {
  const candidates = [
    page.getByRole('button', { name: 'Not now' }),
    page.getByRole('button', { name: 'Dismiss' }),
  ];

  for (const button of candidates) {
    if (await button.isVisible().catch(() => false)) {
      await button.click();
    }
  }
}

/**
 * Extended Playwright test with a reusable loginAs helper.
 *
 * @typedef {(user: { email: string, password: string, homePath?: string }) => Promise<void>} LoginAs
 */

export const test = base.extend({
  /**
   * loginAs(user) — signs in with the given users.js role object.
   * Reuses LoginPage; never duplicates fill/click locators here.
   */
  loginAs: async ({ page }, use) => {
    /**
     * @type {LoginAs}
     */
    const loginAs = async (user) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login(user.email, user.password);
      await loginPage.expectLoginSuccess(
        user.homePath ? { urlIncludes: user.homePath } : {},
      );
      await dismissTransientPrompts(page);
    };

    await use(loginAs);
  },
});

export { expect };
