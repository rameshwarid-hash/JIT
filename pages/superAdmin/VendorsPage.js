// @ts-check
/**
 * pages/superAdmin/VendorsPage.js
 * Vendors master list + Add Vendor dialog (Super Admin).
 */
import { expect } from '@playwright/test';

export class VendorsPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.main = page.getByRole('main');
    this.pageTitle = this.main.getByRole('heading', { name: 'Vendors', level: 1 });
    // Desktop + mobile both render a search input; target the visible one only
    this.searchInput = this.main
      .getByPlaceholder('Search vendors...')
      .filter({ visible: true });
    this.statusFilter = this.main.getByRole('combobox').filter({ visible: true });
    this.addVendorButton = this.main.getByRole('button', { name: 'Add Vendor' });
    this.dialog = page.getByRole('dialog');
  }

  async goto() {
    await this.page.goto('/super-admin/masters/vendors');
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/\/super-admin\/masters\/vendors/);
    await expect(this.pageTitle).toBeVisible();
    await expect(this.searchInput).toBeVisible();
    await expect(this.addVendorButton).toBeVisible();
  }

  /**
   * @param {string} query
   */
  async search(query) {
    await this.searchInput.fill(query);
    await this.searchInput.press('Enter');
  }

  async expectNoResults() {
    await expect(
      this.main
        .getByText(/No vendors found/i)
        .filter({ visible: true })
        .first(),
    ).toBeVisible();
  }

  /**
   * @param {string | RegExp} text
   */
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

  /**
   * @param {string} optionLabel
   */
  async selectStatus(optionLabel) {
    await this.openStatusFilter();
    await this.page.getByRole('option', { name: optionLabel, exact: true }).click();
  }

  async openAddVendor() {
    await this.addVendorButton.click();
    await expect(this.dialog.getByRole('heading', { name: 'Add Vendor' })).toBeVisible();
  }

  async expectListColumns() {
    for (const col of ['Name', 'Code', 'Users', 'Contact Email', 'Phone', 'Status']) {
      await expect(this.main.getByText(col, { exact: true }).first()).toBeVisible();
    }
  }

  // --- Add Vendor dialog fields (placeholders verified on staging) ---
  get nameInput() {
    return this.dialog.getByPlaceholder('Enter vendor name');
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
    return this.dialog.getByRole('button', { name: 'Add Vendor', exact: true });
  }
  get cancelButton() {
    return this.dialog.getByRole('button', { name: 'Cancel' });
  }

  /**
   * @param {{ name: string, email?: string, phone?: string, address?: string, notes?: string }} data
   */
  async fillVendorForm(data) {
    await this.nameInput.fill(data.name);
    if (data.email) await this.emailInput.fill(data.email);
    if (data.phone) await this.phoneInput.fill(data.phone);
    if (data.address) await this.addressInput.fill(data.address);
    if (data.notes) await this.notesInput.fill(data.notes);
  }

  async submitAddVendor() {
    await this.submitButton.click();
  }

  async cancelAddVendor() {
    await this.cancelButton.click();
    await expect(this.dialog).toBeHidden();
  }
}
