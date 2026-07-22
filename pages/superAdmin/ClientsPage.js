// @ts-check
/**
 * pages/superAdmin/ClientsPage.js
 * Clients master list + Add Client dialog (Super Admin).
 */
import { expect } from '@playwright/test';

export class ClientsPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.main = page.getByRole('main');
    this.pageTitle = this.main.getByRole('heading', { name: 'Clients', level: 1 });
    this.searchInput = this.main
      .getByPlaceholder('Search clients...')
      .filter({ visible: true });
    this.statusFilter = this.main.getByRole('combobox').filter({ visible: true });
    this.addClientButton = this.main.getByRole('button', { name: 'Add Client' });
    this.dialog = page.getByRole('dialog');
  }

  async goto() {
    await this.page.goto('/super-admin/masters/clients');
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/\/super-admin\/masters\/clients/);
    await expect(this.pageTitle).toBeVisible();
    await expect(this.searchInput).toBeVisible();
    await expect(this.addClientButton).toBeVisible();
  }

  /** @param {string} query */
  async search(query) {
    await this.searchInput.fill(query);
    await this.searchInput.press('Enter');
  }

  async expectNoResults() {
    await expect(
      this.main
        .getByText(/No clients found/i)
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
    await this.statusFilter.click();
  }

  /** @param {string} optionLabel */
  async selectStatus(optionLabel) {
    await this.openStatusFilter();
    await this.page.getByRole('option', { name: optionLabel, exact: true }).click();
  }

  async openAddClient() {
    await this.addClientButton.click();
    await expect(this.dialog.getByRole('heading', { name: 'Add Client' })).toBeVisible();
  }

  async expectListColumns() {
    for (const col of ['Name', 'Code', 'Users', 'Contact Email', 'Phone', 'Status']) {
      await expect(this.main.getByText(col, { exact: true }).first()).toBeVisible();
    }
  }

  get nameInput() {
    return this.dialog.getByPlaceholder('Enter client name');
  }
  get codeInput() {
    return this.dialog.getByPlaceholder('Auto-generated');
  }
  get emailInput() {
    return this.dialog.getByPlaceholder('contact@example.com');
  }
  get phoneInput() {
    return this.dialog.getByPlaceholder('Phone number');
  }
  get addressInput() {
    return this.dialog.getByPlaceholder('Address');
  }
  get notesInput() {
    return this.dialog.getByPlaceholder('Additional notes');
  }
  get submitButton() {
    return this.dialog.getByRole('button', { name: 'Add Client', exact: true });
  }
  get cancelButton() {
    return this.dialog.getByRole('button', { name: 'Cancel' });
  }

  /** @param {{ name: string, email?: string, phone?: string, address?: string, notes?: string }} data */
  async fillClientForm(data) {
    await this.nameInput.fill(data.name);
    if (data.email) await this.emailInput.fill(data.email);
    if (data.phone) await this.phoneInput.fill(data.phone);
    if (data.address) await this.addressInput.fill(data.address);
    if (data.notes) await this.notesInput.fill(data.notes);
  }

  async submitAddClient() {
    await this.submitButton.click();
  }

  async cancelAddClient() {
    await this.cancelButton.click();
    await expect(this.dialog).toBeHidden();
  }
}
