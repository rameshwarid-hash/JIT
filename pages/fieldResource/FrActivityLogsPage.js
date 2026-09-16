// @ts-check
/**
 * pages/fieldResource/FrActivityLogsPage.js
 * Field Resource — Activity Logs list + details (comments).
 */
import { expect } from '@playwright/test';

export class FrActivityLogsPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.main = page.getByRole('main');
    this.pageTitle = this.main.getByRole('heading', {
      name: 'Activity Logs',
      level: 1,
    });
    this.dialog = page.getByRole('dialog');
  }

  async goto() {
    await this.page.goto('/field-resource/activity-logs');
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/\/field-resource\/activity-logs/);
    await expect(this.pageTitle).toBeVisible();
  }

  /** @param {string} text */
  async openActivityContaining(text) {
    const row = this.main
      .locator('table tbody tr, [role="row"], button')
      .filter({ hasText: text })
      .first();
    await expect(row).toBeVisible({ timeout: 20_000 });
    await row.click();
    await expect(this.dialog.or(this.main.getByText(/Comments|WORK PERFORMED/i).first())).toBeVisible({
      timeout: 15_000,
    });
  }

  /** @param {string} comment */
  async expectCommentVisible(comment) {
    const commentsTab = this.page.getByRole('tab', { name: /Comments/i });
    if (await commentsTab.first().isVisible().catch(() => false)) {
      await commentsTab.first().click();
    }
    await expect(
      this.page.getByText(comment, { exact: true }).filter({ visible: true }).first(),
    ).toBeVisible({ timeout: 20_000 });
  }

  async openDraftsFilterIfPresent() {
    const drafts = this.main.getByRole('tab', { name: /Draft/i }).or(
      this.main.getByRole('button', { name: /Draft/i }),
    );
    if (await drafts.first().isVisible().catch(() => false)) {
      await drafts.first().click();
    }
  }
}
