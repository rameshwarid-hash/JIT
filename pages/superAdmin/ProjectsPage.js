// @ts-check
/**
 * pages/superAdmin/ProjectsPage.js
 * All Projects list (Super Admin).
 */
import { expect } from '@playwright/test';

export class ProjectsPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.main = page.getByRole('main');
    this.pageTitle = this.main.getByRole('heading', {
      name: 'All Projects',
      level: 1,
    });
    this.searchInput = this.main
      .getByPlaceholder('Search projects...')
      .filter({ visible: true });
  }

  async goto() {
    await this.page.goto('/super-admin/projects');
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/\/super-admin\/projects(?!\/create)/);
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
        .getByText(/No projects found/i)
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

  async openStatusFilter() {
    // First combobox on page is "All Statuses"
    await this.main.getByRole('combobox').nth(0).click();
  }

  /** @param {string} optionLabel */
  async selectStatus(optionLabel) {
    await this.openStatusFilter();
    await this.page.getByRole('option', { name: optionLabel, exact: true }).click();
  }

  async expectFilterControls() {
    await expect(this.main.getByRole('combobox').nth(0)).toBeVisible();
    await expect(this.main.getByText(/All Clients|Client/i).first()).toBeVisible();
    await expect(this.main.getByText(/All Managers|Manager/i).first()).toBeVisible();
  }

  async goToCreateProjectViaNav() {
    await this.page.goto('/super-admin/projects/create');
  }
}
