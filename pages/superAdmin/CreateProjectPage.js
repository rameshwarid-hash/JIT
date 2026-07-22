// @ts-check
/**
 * pages/superAdmin/CreateProjectPage.js
 * Create Project form (Super Admin).
 */
import { expect } from '@playwright/test';

export class CreateProjectPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.main = page.getByRole('main');
    this.pageTitle = this.main.getByRole('heading', {
      name: 'Create Project',
      level: 1,
    });

    this.projectNameInput = this.main.getByPlaceholder('Enter project name');
    this.projectCodeInput = this.main.getByPlaceholder('Enter unique project code');
    this.descriptionInput = this.main.getByPlaceholder('Enter project description');
    this.locationInput = this.main.getByPlaceholder('Enter project location');
    this.notesInput = this.main.getByPlaceholder(
      'Add any additional notes about the project',
    );

    this.cancelButton = this.main.getByRole('button', { name: 'Cancel' });
    this.saveDraftButton = this.main.getByRole('button', { name: 'Save as Draft' });
    this.createButton = this.main.getByRole('button', {
      name: '+ Create Project',
    });

    this.accessPermissionsHeading = this.main.getByRole('heading', {
      name: 'Access & Permissions',
    });
    this.projectDocumentsHeading = this.main.getByRole('heading', {
      name: /Project Documents/i,
    });
  }

  async goto() {
    await this.page.goto('/super-admin/projects/create');
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/\/super-admin\/projects\/create/);
    await expect(this.pageTitle).toBeVisible();
    await expect(this.projectNameInput).toBeVisible();
    await expect(this.projectCodeInput).toBeVisible();
    await expect(this.createButton).toBeVisible();
  }

  /**
   * @param {{
   *   name?: string,
   *   code?: string,
   *   description?: string,
   *   location?: string,
   *   notes?: string,
   * }} data
   */
  async fillBasicFields(data) {
    if (data.name !== undefined) await this.projectNameInput.fill(data.name);
    if (data.code !== undefined) await this.projectCodeInput.fill(data.code);
    if (data.description !== undefined) {
      await this.descriptionInput.fill(data.description);
    }
    if (data.location !== undefined) await this.locationInput.fill(data.location);
    if (data.notes !== undefined) await this.notesInput.fill(data.notes);
  }

  async clickCreate() {
    await this.createButton.click();
  }

  async clickCancel() {
    await this.cancelButton.click();
  }

  async clickSaveDraft() {
    await this.saveDraftButton.click();
  }

  async expectAccessPermissionsSection() {
    await expect(this.accessPermissionsHeading).toBeVisible();
    await expect(this.main.getByText(/Employee/i).first()).toBeVisible();
    await expect(this.main.getByText(/^Client/i).first()).toBeVisible();
    await expect(this.main.getByText(/^Vendor/i).first()).toBeVisible();
  }
}
