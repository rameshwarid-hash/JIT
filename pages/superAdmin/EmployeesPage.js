// @ts-check
/**
 * pages/superAdmin/EmployeesPage.js
 * Employees master list + Add Employee dialog (Super Admin).
 */
import { expect } from '@playwright/test';

export class EmployeesPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.main = page.getByRole('main');
    this.pageTitle = this.main.getByRole('heading', {
      name: 'Employees',
      level: 1,
    });
    this.searchInput = this.main
      .getByPlaceholder('Search employees...')
      .filter({ visible: true });
    this.roleFilter = this.main.getByRole('combobox').filter({ visible: true });
    this.addEmployeeButton = this.main.getByRole('button', {
      name: 'Add Employee',
    });
    this.dialog = page.getByRole('dialog');
  }

  async goto() {
    await this.page.goto('/super-admin/masters/employees');
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/\/super-admin\/masters\/employees/);
    await expect(this.pageTitle).toBeVisible();
    await expect(this.searchInput).toBeVisible();
    await expect(this.addEmployeeButton).toBeVisible();
  }

  /** @param {string} query */
  async search(query) {
    await this.searchInput.fill(query);
    await this.searchInput.press('Enter');
  }

  async expectNoResults() {
    // Staging empty copy says "No users found" (not "employees")
    await expect(
      this.main
        .getByText(/No users found/i)
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

  async openRoleFilter() {
    await this.roleFilter.click();
  }

  /** @param {string} optionLabel */
  async selectRole(optionLabel) {
    await this.openRoleFilter();
    await this.page.getByRole('option', { name: optionLabel, exact: true }).click();
  }

  async openAddEmployee() {
    await this.addEmployeeButton.click();
    await expect(
      this.dialog.getByRole('heading', { name: 'Add Employee' }),
    ).toBeVisible();
  }

  async expectListColumns() {
    for (const col of ['User', 'Code', 'Email', 'Role', 'Status', 'Phone']) {
      await expect(this.main.getByText(col, { exact: true }).first()).toBeVisible();
    }
  }

  get firstNameInput() {
    return this.dialog.getByPlaceholder('Enter first name');
  }
  get lastNameInput() {
    return this.dialog.getByPlaceholder('Enter last name');
  }
  get emailInput() {
    return this.dialog.getByPlaceholder('Enter email address');
  }
  get passwordInput() {
    return this.dialog.getByPlaceholder('Enter password');
  }
  get phoneInput() {
    return this.dialog.getByPlaceholder('Enter phone number (optional)');
  }
  get locationInput() {
    return this.dialog.getByPlaceholder('Enter location (optional)');
  }
  get submitButton() {
    // Staging submit label is "Add User"
    return this.dialog.getByRole('button', { name: 'Add User' });
  }
  get cancelButton() {
    return this.dialog.getByRole('button', { name: 'Cancel' });
  }
  get addGatePassButton() {
    return this.dialog.getByRole('button', { name: 'Add Gate Pass' });
  }

  /**
   * @param {{
   *   firstName: string,
   *   lastName: string,
   *   email: string,
   *   password: string,
   *   phone?: string,
   *   location?: string,
   * }} data
   */
  async fillEmployeeForm(data) {
    await this.firstNameInput.fill(data.firstName);
    await this.lastNameInput.fill(data.lastName);
    await this.emailInput.fill(data.email);
    await this.passwordInput.fill(data.password);
    if (data.phone) await this.phoneInput.fill(data.phone);
    if (data.location) await this.locationInput.fill(data.location);
  }

  async submitAddEmployee() {
    await this.submitButton.click();
  }

  async cancelAddEmployee() {
    await this.cancelButton.click();
    await expect(this.dialog).toBeHidden();
  }
}
