// @ts-check
/**
 * pages/LoginPage.js
 * ------------------
 * Login screen Page Object — locators + actions only.
 * Credentials are passed in by fixtures / tests (never stored here).
 */
import { expect } from '@playwright/test';
import { BasePage } from './BasePage.js';
import { ROUTES } from '../constants/routes.js';
import { TIMEOUTS } from '../constants/timeouts.js';

export class LoginPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    this.emailInput = page.getByRole('textbox', { name: /email/i });
    this.passwordInput = page.getByRole('textbox', { name: /password/i });
    this.submitButton = page.getByRole('button', {
      name: /sign in|log in|login/i,
    });
    this.alert = page.getByRole('alert');
  }

  async goto() {
    await super.goto(ROUTES.login);
  }

  async expectLoaded() {
    await this.expectUrl(/\/login/);
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.submitButton).toBeVisible();
  }

  /**
   * @param {string} email
   * @param {string} password
   */
  async login(email, password) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  /**
   * @param {{ homePath?: string | RegExp }} [options]
   */
  async expectLoginSuccess(options = {}) {
    await expect(this.page).not.toHaveURL(/\/login(?:\?|$)/, {
      timeout: TIMEOUTS.long,
    });

    if (options.homePath) {
      await this.expectUrl(options.homePath, TIMEOUTS.long);
    }
  }

  async expectStillOnLoginPage() {
    await this.expectUrl(/\/login/);
    await expect(this.submitButton).toBeVisible();
  }

  /**
   * @param {string | RegExp} [message]
   */
  async expectErrorMessage(message) {
    await expect(this.alert).toBeVisible();
    if (message) {
      await expect(this.alert).toContainText(message);
    }
  }

  /**
   * Clear SPA storage and open login (role-switch / session end).
   */
  async logout() {
    await this.page.evaluate(() => {
      sessionStorage.clear();
      localStorage.clear();
    });
    await this.goto();
    await this.expectLoaded();
  }
}
