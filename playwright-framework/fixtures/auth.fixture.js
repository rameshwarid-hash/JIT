// @ts-check
/**
 * fixtures/auth.fixture.js
 * ------------------------
 * Thin auth orchestrator — locators live in pages/LoginPage.js (POM).
 */
import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';
import { dismissIfPresent } from '../helpers/page.js';

/**
 * @typedef {{
 *   email: string,
 *   password: string,
 *   homePath?: string | RegExp,
 * }} AuthUser
 */

export const test = base.extend({
  /**
   * Signs in with the given user ({ email, password, homePath? }).
   * Pass personas from test-data/personas.js — never hardcode credentials.
   */
  loginAs: async ({ page }, use) => {
    /**
     * @param {AuthUser} user
     */
    const loginAs = async (user) => {
      if (!user?.email || !user?.password) {
        throw new Error('loginAs(user) requires user.email and user.password');
      }

      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.expectLoaded();
      await loginPage.login(user.email, user.password);
      await loginPage.expectLoginSuccess(
        user.homePath ? { homePath: user.homePath } : {},
      );
      await dismissIfPresent(page, ['Not now', 'Dismiss', 'Maybe later']);
    };

    await use(loginAs);
  },

  /**
   * Ends the session via LoginPage.logout().
   */
  logout: async ({ page }, use) => {
    const logout = async () => {
      const loginPage = new LoginPage(page);
      await loginPage.logout();
    };
    await use(logout);
  },
});
