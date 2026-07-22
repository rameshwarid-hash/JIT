// @ts-check
/**
 * pages/LoginPage.js
 * ------------------
 * WHY THIS FILE EXISTS (Page Object Model):
 * The login screen is used by almost every test (every role must sign in).
 * If we put locators + actions directly inside every test file, we would
 * duplicate code and break many tests when the UI changes.
 *
 * A Page Object keeps:
 * - locators (HOW to find elements)
 * - actions (WHAT the user does)
 * in ONE place. Tests stay short and readable.
 *
 * RULE: Page Objects do NOT contain credentials.
 * Credentials come from .env via a separate users helper (Step 3).
 */
import { expect } from '@playwright/test';

export class LoginPage {
  /**
   * @param {import('@playwright/test').Page} page
   * WHY we store `page`:
   * Every Playwright action (goto, click, fill) needs the current browser tab.
   * The test creates `page` and passes it into this class.
   */
  constructor(page) {
    this.page = page;

    /**
     * LOCATORS
     * --------
     * WHY getByRole / accessible names:
     * Playwright recommends role-based locators because they match how users
     * (and screen readers) see the page. They are more stable than CSS/XPath.
     *
     * These names were verified on the real staging login page:
     * - heading: "Project Activity Reporting System"
     * - textbox: "Email Address"
     * - textbox: "Password"
     * - button: "Sign In"
     */
    this.heading = page.getByRole('heading', {
      name: 'Project Activity Reporting System',
    });

    // Accessible name comes from the visible label "Email Address"
    this.emailInput = page.getByRole('textbox', { name: 'Email Address' });

    // Accessible name comes from the visible label "Password"
    this.passwordInput = page.getByRole('textbox', { name: 'Password' });

    this.signInButton = page.getByRole('button', { name: 'Sign In' });

    // Optional controls — useful for later negative / UX tests
    this.rememberMeCheckbox = page.getByRole('checkbox', { name: 'Remember me' });
    this.forgotPasswordLink = page.getByRole('link', { name: 'Forgot Password?' });

    // Staging shows an alert region (toasts / validation messages often land here)
    this.alert = page.getByRole('alert');
  }

  /**
   * Open the login page.
   *
   * WHY '/login' instead of the full URL:
   * baseURL is set in playwright.config.js, so Playwright joins them:
   *   baseURL + '/login' => https://staging.../login
   */
  async goto() {
    await this.page.goto('/login');
  }

  /**
   * Confirm we are actually on the Sign In screen before interacting.
   *
   * WHY web-first assertions (expect(...).toBeVisible()):
   * Playwright auto-waits/retries until the condition is true (or times out).
   * We do NOT use page.waitForTimeout() — that is brittle and slow.
   */
  async expectLoaded() {
    await expect(this.page).toHaveTitle(/Sign In/i);
    await expect(this.heading).toBeVisible();
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.signInButton).toBeVisible();
  }

  /**
   * Type into the email field.
   * @param {string} email
   */
  async fillEmail(email) {
    await this.emailInput.fill(email);
  }

  /**
   * Type into the password field.
   * @param {string} password
   */
  async fillPassword(password) {
    await this.passwordInput.fill(password);
  }

  /**
   * Click the Sign In button.
   */
  async clickSignIn() {
    await this.signInButton.click();
  }

  /**
   * Happy-path helper: fill credentials and submit.
   *
   * WHY one method for the full flow:
   * Most tests only need "log in as X". Keeping fill+click together avoids
   * repeating 3 lines in every test. For negative tests, call fill/click separately.
   *
   * @param {string} email
   * @param {string} password
   */
  async login(email, password) {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.clickSignIn();
  }

  /**
   * Assert login succeeded.
   *
   * WHY this design:
   * Different roles land on different home URLs
   * (e.g. Super Admin -> /super-admin/dashboard).
   * Pass `urlIncludes` when you know the expected path.
   * If unknown, we still assert we left /login.
   *
   * @param {{ urlIncludes?: string | RegExp }} [options]
   */
  async expectLoginSuccess(options = {}) {
    // Minimum success signal: we are no longer on the sign-in page
    await expect(this.page).not.toHaveURL(/\/login/);

    if (options.urlIncludes) {
      await expect(this.page).toHaveURL(options.urlIncludes);
    }
  }

  /**
   * Assert we are STILL on the login page (used for invalid credentials).
   */
  async expectStillOnLoginPage() {
    await expect(this.page).toHaveURL(/\/login/);
    await expect(this.signInButton).toBeVisible();
  }

  /**
   * Assert an error / toast message is shown.
   *
   * WHY optional `message`:
   * If we know the exact text from the app, pass it for a stronger assertion.
   * If not yet confirmed, call without args and we only check that an alert appears.
   *
   * @param {string | RegExp} [message]
   */
  async expectErrorMessage(message) {
    await expect(this.alert).toBeVisible();

    if (message) {
      await expect(this.alert).toContainText(message);
    }
    // TODO: Confirm exact invalid-login error text on staging and tighten this assertion.
  }
}
