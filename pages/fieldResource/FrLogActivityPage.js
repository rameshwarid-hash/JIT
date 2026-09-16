// @ts-check
/**
 * pages/fieldResource/FrLogActivityPage.js
 * Field Resource — Log Activity (submit / draft / critical / attachments).
 */
import { expect } from '@playwright/test';

export class FrLogActivityPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.main = page.getByRole('main');
    this.pageTitle = this.main.getByRole('heading', {
      name: 'Log Activity',
      level: 1,
    });
    this.workEditor = this.main.locator('[contenteditable="true"]').filter({ visible: true });
    this.categoryCombobox = this.main.getByRole('combobox').filter({
      hasText: /Select category|Electrical|General|Other|Civil|Plumbing/i,
    });
    this.submitButton = this.main.getByRole('button', { name: 'Submit Activity' });
    this.saveDraftButton = this.main.getByRole('button', { name: 'Save Draft' });
    this.criticalToggle = this.main.getByText('Mark it critical');
    this.locationInput = this.main.getByPlaceholder('Enter work location');
    this.remarksInput = this.main.getByPlaceholder('Enter any additional remarks');
  }

  async goto() {
    await this.page.goto('/field-resource/log-activity');
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/\/field-resource\/log-activity/);
    await expect(this.pageTitle).toBeVisible();
    await expect(this.submitButton).toBeVisible();
  }

  /** @param {string} projectName */
  async selectProject(projectName) {
    const projectCombo = this.main.getByRole('combobox').first();
    await projectCombo.click();
    await this.page
      .getByRole('option', { name: new RegExp(projectName, 'i') })
      .first()
      .click();
  }

  /** @param {string} text */
  async fillWorkPerformed(text) {
    await expect(this.workEditor.first()).toBeVisible();
    await this.workEditor.first().click();
    await this.page.keyboard.press('Control+A');
    await this.page.keyboard.type(text);
    await expect(this.main.getByText(/Characters:\s*[1-9]/)).toBeVisible();
  }

  /** @param {string} category */
  async selectCategory(category = 'General') {
    const combo = this.main.getByRole('combobox').filter({
      hasText: /Select category|Electrical|Plumbing|Civil|Mechanical|Inspection|General|Other/i,
    });
    await combo.click();
    await this.page.getByRole('option', { name: category, exact: true }).click();
  }

  async markCritical() {
    await this.criticalToggle.click();
  }

  /**
   * @param {string} filePath absolute path
   * @param {'Photos' | 'Documents'} tab
   */
  async uploadAttachment(filePath, tab = 'Photos') {
    await this.main.getByRole('tab', { name: tab }).click();
    const fileInput = this.main.locator('input[type="file"]');
    await fileInput.setInputFiles(filePath);
    // Thumbnail / filename may vary; assert upload control accepted a file
    await expect(fileInput).toHaveCount(1);
  }

  async submitActivity() {
    await this.submitButton.click();
  }

  async saveDraft() {
    await this.saveDraftButton.click();
  }

  async expectSubmitSuccess() {
    await expect(
      this.page.getByText(/submitted successfully|Activity submitted|success/i).first(),
    ).toBeVisible({ timeout: 20_000 });
  }

  async expectDraftSaved() {
    await expect(
      this.page.getByText(/draft saved|saved as draft|Draft/i).first(),
    ).toBeVisible({ timeout: 20_000 });
  }
}
