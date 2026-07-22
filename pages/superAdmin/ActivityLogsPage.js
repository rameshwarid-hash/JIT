// @ts-check
/**
 * pages/superAdmin/ActivityLogsPage.js
 * Activity Logs list + details popup (Super Admin).
 */
import { expect } from '@playwright/test';

export class ActivityLogsPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.main = page.getByRole('main');
    this.pageTitle = this.main.getByRole('heading', {
      name: 'Activity Logs',
      level: 1,
    });
    this.searchInput = this.main
      .getByPlaceholder('Search logs, projects, users...')
      .filter({ visible: true });
    this.dialog = page.getByRole('dialog');
  }

  async goto() {
    await this.page.goto('/super-admin/activity-logs');
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/\/super-admin\/activity-logs/);
    await expect(this.pageTitle).toBeVisible();
    await expect(this.searchInput).toBeVisible();
  }

  /** @param {string} query */
  async search(query) {
    await this.searchInput.fill(query);
    await this.searchInput.press('Enter');
  }

  async expectNoResults() {
    await expect(
      this.main
        .getByText(/No .*logs? found/i)
        .filter({ visible: true })
        .first(),
    ).toBeVisible();
  }

  /** @param {string | RegExp} text */
  async expectRowContaining(text) {
    const locator =
      typeof text === 'string'
        ? this.main.getByText(text, { exact: true })
        : this.main.getByText(text);
    await expect(locator.filter({ visible: true }).first()).toBeVisible();
  }

  async expectFilterControls() {
    await expect(this.main.getByRole('combobox').first()).toBeVisible();
    await expect(
      this.main.getByRole('button', { name: /From date/i }),
    ).toBeVisible();
    await expect(this.main.getByRole('button', { name: /To date/i })).toBeVisible();
  }

  /**
   * Open the first activity row/details control in the table area.
   */
  async openFirstActivityDetails() {
    // Rows are often clickable buttons or table rows — try common patterns
    const rowButton = this.main.getByRole('row').nth(1);
    if (await rowButton.isVisible().catch(() => false)) {
      await rowButton.click();
    } else {
      await this.main.locator('table tbody tr').first().click();
    }
    await expect(this.dialog).toBeVisible({ timeout: 10_000 });
  }

  async expectDetailsPopupVisible() {
    await expect(this.dialog).toBeVisible();
  }

  async closeDetailsPopup() {
    const close = this.dialog.getByRole('button', { name: /Close|Dismiss/i }).first();
    if (await close.isVisible().catch(() => false)) {
      await close.click();
    } else {
      await this.page.keyboard.press('Escape');
    }
    await expect(this.dialog).toBeHidden();
  }
}
