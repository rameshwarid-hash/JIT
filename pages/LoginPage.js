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
   * Happy-path helper: fill credentials, submit, and wait until auth completes.
   *
   * Staging stores JWT in sessionStorage (ji_access_token / ji_refresh_token),
   * not cookies. We must wait for POST /api/auth/login + tokens before any
   * redirect assertion — otherwise expectLoginSuccess can race and still see /login.
   *
   * @param {string} email
   * @param {string} password
   */
  async login(email, password) {
    await this.fillEmail(email);
    await this.fillPassword(password);

    const responsePromise = this.page.waitForResponse(
      (res) =>
        res.url().includes('/api/auth/login') &&
        res.request().method() === 'POST',
      { timeout: 30_000 },
    );

    await this.clickSignIn();
    const response = await responsePromise;

    let bodyText = '';
    try {
      bodyText = await response.text();
    } catch (err) {
      throw new Error(
        `Login API body unavailable (${response.status()}): ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
    }

    if (response.status() !== 200) {
      throw new Error(
        `Login API failed with HTTP ${response.status()}: ${bodyText.slice(0, 300)}`,
      );
    }

    /** @type {{ success?: boolean, message?: string, data?: { accessToken?: string } }} */
    let payload;
    try {
      payload = JSON.parse(bodyText);
    } catch {
      throw new Error(`Login API returned non-JSON body: ${bodyText.slice(0, 300)}`);
    }

    if (!payload.success) {
      throw new Error(
        `Login API success=false: ${payload.message || bodyText.slice(0, 300)}`,
      );
    }

    // Auth is complete only once the SPA has stored the access token.
    await expect
      .poll(
        async () =>
          this.page.evaluate(() => sessionStorage.getItem('ji_access_token')),
        {
          timeout: 15_000,
          message: 'ji_access_token was not written to sessionStorage after login',
        },
      )
      .toBeTruthy();
  }

  /**
   * Assert login succeeded (redirect + session token).
   *
   * Call after login() so the API/token wait has already finished.
   * Still waits for navigation — redirect can lag slightly behind storage.
   *
   * @param {{ urlIncludes?: string | RegExp }} [options]
   */
  async expectLoginSuccess(options = {}) {
    await expect(this.page).not.toHaveURL(/\/login/, { timeout: 30_000 });

    if (options.urlIncludes) {
      const pattern =
        typeof options.urlIncludes === 'string'
          ? new RegExp(
              options.urlIncludes.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
            )
          : options.urlIncludes;
      await expect(this.page).toHaveURL(pattern, { timeout: 30_000 });
    }

    const accessToken = await this.page.evaluate(() =>
      sessionStorage.getItem('ji_access_token'),
    );
    expect(accessToken, 'session must keep ji_access_token after redirect').toBeTruthy();
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
  }

  /**
   * End session for role-switch E2E flows.
   * Prefers UI logout; always clears SPA JWT storage (sessionStorage).
   */
  async logout() {
    const profile = this.page
      .getByRole('complementary')
      .getByRole('button')
      .filter({ hasText: /@/ });

    if (await profile.first().isVisible().catch(() => false)) {
      await profile.first().click();
      const logoutItem = this.page
        .getByRole('menuitem', { name: /Log out|Sign out|Logout/i })
        .or(this.page.getByRole('button', { name: /Log out|Sign out|Logout/i }))
        .or(this.page.getByText(/Log out|Sign out/i));
      if (await logoutItem.first().isVisible().catch(() => false)) {
        await logoutItem.first().click();
      }
    }

    await this.page.evaluate(() => {
      sessionStorage.clear();
      localStorage.clear();
    });
    await this.page.goto('/login');
    await this.expectLoaded();
    const token = await this.page.evaluate(() =>
      sessionStorage.getItem('ji_access_token'),
    );
    expect(token, 'access token must be cleared after logout').toBeFalsy();
  }
}
