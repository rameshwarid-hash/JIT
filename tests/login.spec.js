// @ts-check
/**
 * tests/login.spec.js
 * -------------------
 * WHY THIS FILE EXISTS:
 * This is our first real automated test suite. It proves:
 * 1. The login page loads correctly
 * 2. Each of the 3 roles can sign in with credentials from .env
 * 3. Each role lands on the correct home/dashboard URL
 *
 * FRAMEWORK PIECES USED:
 * - LoginPage  → HOW to interact with the login screen (Page Object)
 * - users      → WHO is logging in (credentials from .env)
 * - expect     → web-first assertions (Playwright auto-waits)
 *
 * HOW TO RUN (after Step 5 approval we will verify together):
 *   npm test
 *   npm run test:headed
 */
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';
import { users } from '../test-data/users.js';

/**
 * WHY test.describe:
 * Groups related tests in the report under one folder name: "Login".
 * Makes the HTML report easier to read as the suite grows.
 */
test.describe('Login', () => {
  /**
   * Smoke check: form is visible before we try credentials.
   * WHY separate from role logins:
   * If the login page itself is broken, this fails first with a clear signal.
   */
  test('login page is displayed', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.expectLoaded();

    // Extra title check — documents the browser tab text we expect
    await expect(page).toHaveTitle(/Sign In/i);
  });

  /**
   * DATA-DRIVEN ROLE LOGINS
   * -----------------------
   * WHY loop over users instead of copying 3 nearly identical tests:
   * - One pattern, three roles
   * - Adding a 4th role later is one object in users.js + this list
   * - Failures still show the role name in the test title
   *
   * Object.values(users) => [superAdmin, projectManager, fieldResource]
   */
  for (const user of Object.values(users)) {
    test(`${user.role} can sign in and reach dashboard`, async ({ page }) => {
      const loginPage = new LoginPage(page);

      // Arrange: open the sign-in screen
      await loginPage.goto();
      await loginPage.expectLoaded();

      // Act: sign in with this role's .env credentials
      // (email/password are NEVER hardcoded in this file)
      await loginPage.login(user.email, user.password);

      // Assert: left /login AND landed on the role-specific home path
      await loginPage.expectLoginSuccess({
        urlIncludes: user.homePath,
      });

      // Assert: Dashboard heading is visible (same label across roles on staging)
      await expect(page.getByRole('heading', { name: 'Dashboard', level: 1 })).toBeVisible();
    });
  }
});
