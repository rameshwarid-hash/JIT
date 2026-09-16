// @ts-check
/**
 * pages/projectManager/PmActivityLogsPage.js
 * Project Manager — Activity Logs + details/comments.
 */
import { expect } from '@playwright/test';

export class PmActivityLogsPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.main = page.getByRole('main');
    this.pageTitle = this.main.getByRole('heading', {
      name: 'Activity Logs',
      level: 1,
    });
    this.searchInput = this.main
      .getByPlaceholder(/Search/i)
      .filter({ visible: true });
    this.dialog = page.getByRole('dialog');
  }

  async goto() {
    await this.page.goto('/project-manager/activity-logs');
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/\/project-manager\/activity-logs/);
    await expect(this.pageTitle).toBeVisible();
  }

  /** @param {string} query */
  async search(query) {
    if (await this.searchInput.isVisible().catch(() => false)) {
      await this.searchInput.fill(query);
      await this.searchInput.press('Enter');
    } else {
      // Fallback: filter by visible text presence after reload
      await this.page.reload({ waitUntil: 'domcontentloaded' });
    }
  }

  /** @param {string} text */
  async openActivityContaining(text) {
    const row = this.main
      .locator('table tbody tr, [role="row"]')
      .filter({ hasText: text })
      .first();
    await expect(row).toBeVisible({ timeout: 20_000 });
    await row.click();
    await expect(this.dialog).toBeVisible({ timeout: 15_000 });
  }

  async expectCriticalBadge() {
    await expect(
      this.dialog.getByText(/CRITICAL|Critical/i).first(),
    ).toBeVisible();
  }

  /** @param {string} comment */
  async postComment(comment) {
    const input = this.dialog.getByPlaceholder(/comment/i);
    await expect(input).toBeVisible();
    await input.fill(comment);
    const post = this.dialog.getByRole('button', { name: 'Post Comment' });
    await expect(post).toBeVisible();
    await post.dispatchEvent('click');
    await expect(
      this.dialog.getByText(comment, { exact: true }).filter({ visible: true }),
    ).toBeVisible({ timeout: 20_000 });
  }

  async expectDetailsContain(text) {
    await expect(this.dialog).toContainText(text);
  }
}
