// @ts-check
/**
 * tests/smoke/login.page.spec.js
 * -------------------------------
 * PR-gate UI smoke: login screen is reachable and interactive.
 * Does not require credentials (no submit with real users).
 */
import { test, expect } from '../../fixtures/index.js';
import { LoginPage } from '../../pages/LoginPage.js';
import { TAGS } from '../../constants/tags.js';

test.describe('Smoke — Login page', () => {
  test(`login form is displayed ${TAGS.smoke}`, async ({ page, appEnv }) => {
    expect(appEnv.baseURL).toBeTruthy();

    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.expectLoaded();

    await expect(loginPage.emailInput).toBeEditable();
    await expect(loginPage.passwordInput).toBeEditable();
    await expect(loginPage.submitButton).toBeEnabled();
  });
});
