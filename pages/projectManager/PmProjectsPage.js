// @ts-check
/**
 * pages/projectManager/PmProjectsPage.js
 * Project Manager — Projects list (assigned projects).
 */
import { expect } from '@playwright/test';

export class PmProjectsPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.main = page.getByRole('main');
    this.pageTitle = this.main.getByRole('heading', { name: 'Projects', level: 1 });
    this.searchInput = this.main
      .getByPlaceholder(/Search projects/i)
      .filter({ visible: true });
  }

  async goto() {
    await this.page.goto('/project-manager/projects');
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/\/project-manager\/projects/);
    await expect(this.pageTitle).toBeVisible();
  }

  /** @param {string} query */
  async search(query) {
    if (await this.searchInput.isVisible().catch(() => false)) {
      await this.searchInput.fill(query);
      await this.searchInput.press('Enter');
    }
  }

  /** @param {string} projectName */
  async expectProjectVisible(projectName) {
    await expect(
      this.main.getByText(projectName, { exact: true }).filter({ visible: true }).first(),
    ).toBeVisible({ timeout: 20_000 });
  }

  /** @param {string} projectName */
  async openProject(projectName) {
    await this.expectProjectVisible(projectName);
    await this.main
      .getByText(projectName, { exact: true })
      .filter({ visible: true })
      .first()
      .click();
  }
}
