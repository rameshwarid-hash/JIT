// @ts-check
/**
 * pages/fieldResource/FrProjectsPage.js
 * Field Resource — My Projects.
 */
import { expect } from '@playwright/test';

export class FrProjectsPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.main = page.getByRole('main');
    this.pageTitle = this.main.getByRole('heading', {
      name: 'My Projects',
      level: 1,
    });
  }

  async goto() {
    await this.page.goto('/field-resource/projects');
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/\/field-resource\/projects/);
    await expect(this.pageTitle).toBeVisible();
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
