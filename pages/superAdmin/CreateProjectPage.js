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

  /** @param {string} clientName */
  async selectClient(clientName) {
    await this.main.getByRole('combobox').filter({ hasText: /Select client|client/i }).click();
    await this.page.getByRole('option', { name: new RegExp(clientName, 'i') }).first().click();
  }

  /** @param {string} vendorName */
  async selectVendor(vendorName) {
    await this.main.getByRole('combobox').filter({ hasText: /Select vendor|vendor/i }).click();
    await this.page.getByRole('option', { name: new RegExp(vendorName, 'i') }).first().click();
  }

  /** @param {string} managerName */
  async assignProjectManager(managerName) {
    const search = this.main.getByPlaceholder('Search project managers');
    await search.fill(managerName);
    await this.main.locator('label').filter({ hasText: managerName }).first().click();
    await expect(this.main.getByText(/[1-9]\d* managers? selected/i)).toBeVisible();
  }

  /** @param {string} memberName */
  async assignFieldResource(memberName) {
    const search = this.main.getByPlaceholder('Search team members');
    await search.fill(memberName);
    const label = this.main.locator('label').filter({ hasText: memberName }).first();
    await expect(label).toBeVisible();
    await label.click();
  }

  /**
   * Publish project via Create and leave the create route.
   */
  async publishProject() {
    const responsePromise = this.page.waitForResponse((res) => {
      if (res.request().method() !== 'POST') return false;
      try {
        return new URL(res.url()).pathname.replace(/\/$/, '') === '/api/projects';
      } catch {
        return false;
      }
    }, { timeout: 30_000 });

    await this.clickCreate();
    const response = await responsePromise;
    expect([200, 201], `create project status ${response.status()}`).toContain(
      response.status(),
    );
    await expect(this.page).not.toHaveURL(/\/projects\/create/, { timeout: 30_000 });
  }
}
