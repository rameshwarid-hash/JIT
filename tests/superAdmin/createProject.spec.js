// @ts-check
/**
 * tests/superAdmin/createProject.spec.js
 * Super Admin — Create Project (JIT Super Admin.xlsx / SA-CreateProject)
 */
import { test, expect } from '../../fixtures/auth.fixture.js';
import { CreateProjectPage } from '../../pages/superAdmin/CreateProjectPage.js';
import { users } from '../../test-data/users.js';
import { uniqueName, uniqueSuffix } from '../../utils/uniqueData.js';

test.describe('Super Admin — Create Project', () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs(users.superAdmin);
  });

  test('SA_CP page loads with core fields', async ({ page }) => {
    const form = new CreateProjectPage(page);
    await form.goto();
    await form.expectLoaded();
  });

  test('SA_CP_001 Project Name is mandatory', async ({ page }) => {
    const form = new CreateProjectPage(page);
    await form.goto();
    await form.fillBasicFields({
      name: '',
      code: `AUTO-${uniqueSuffix()}`,
      location: 'Pune',
    });
    await form.clickCreate();
    // Stay on create page when validation fails
    await expect(page).toHaveURL(/\/super-admin\/projects\/create/);
    await expect(form.projectNameInput).toBeVisible();
  });

  test('SA_CP_002 Project Name accepts valid input', async ({ page }) => {
    const form = new CreateProjectPage(page);
    await form.goto();
    const name = uniqueName('Smart City');
    await form.projectNameInput.fill(name);
    await expect(form.projectNameInput).toHaveValue(name);
  });

  test('SA_CP_005 Project Code is mandatory', async ({ page }) => {
    const form = new CreateProjectPage(page);
    await form.goto();
    await form.fillBasicFields({
      name: uniqueName('Project'),
      code: '',
      location: 'Pune',
    });
    await form.clickCreate();
    await expect(page).toHaveURL(/\/super-admin\/projects\/create/);
  });

  test('SA_CP_008 Description accepts input', async ({ page }) => {
    const form = new CreateProjectPage(page);
    await form.goto();
    await form.descriptionInput.fill('Sample Description');
    await expect(form.descriptionInput).toHaveValue('Sample Description');
  });

  test('SA_CP_011 Project Location is mandatory', async ({ page }) => {
    const form = new CreateProjectPage(page);
    await form.goto();
    await form.fillBasicFields({
      name: uniqueName('Project'),
      code: `LOC-${uniqueSuffix()}`,
      location: '',
    });
    await form.clickCreate();
    await expect(page).toHaveURL(/\/super-admin\/projects\/create/);
  });

  test('SA_CP_012 Location accepts valid input', async ({ page }) => {
    const form = new CreateProjectPage(page);
    await form.goto();
    await form.locationInput.fill('Pune');
    await expect(form.locationInput).toHaveValue('Pune');
  });

  test('SA_CP_017 Notes field accepts input', async ({ page }) => {
    const form = new CreateProjectPage(page);
    await form.goto();
    await form.notesInput.fill('Project Notes');
    await expect(form.notesInput).toHaveValue('Project Notes');
  });

  test('SA_CP_024 Cancel navigates away without creating', async ({ page }) => {
    const form = new CreateProjectPage(page);
    await form.goto();
    await form.fillBasicFields({ name: uniqueName('Cancel Me') });
    await form.clickCancel();
    await expect(page).not.toHaveURL(/\/super-admin\/projects\/create/);
  });

  test('SA_CP_031 Access & Permissions section is displayed', async ({
    page,
  }) => {
    const form = new CreateProjectPage(page);
    await form.goto();
    await form.expectAccessPermissionsSection();
  });

  test('SA_CP_045 Welcome email / documents section exists', async ({ page }) => {
    const form = new CreateProjectPage(page);
    await form.goto();
    await expect(form.projectDocumentsHeading).toBeVisible();
    await expect(
      form.main.getByRole('button', { name: /Browse Files/i }),
    ).toBeVisible();
  });

  test('SA_CP_046 Save as Draft control is visible', async ({ page }) => {
    const form = new CreateProjectPage(page);
    await form.goto();
    await expect(form.saveDraftButton).toBeVisible();
  });

  test('SA_CP_022 / SA_CP_046 Save as Draft with basic fields', async ({ page }) => {
    const form = new CreateProjectPage(page);
    const name = uniqueName('Auto Project');
    const code = `AP-${uniqueSuffix()}`;

    await form.goto();
    await form.fillBasicFields({
      name,
      code,
      description: 'Created by Playwright automation',
      location: 'Pune',
      notes: 'Automation draft notes',
    });
    await form.clickSaveDraft();

    // Draft save should leave the create page or show success feedback
    await expect(page).not.toHaveURL(/\/super-admin\/projects\/create/, {
      timeout: 20_000,
    });
  });
});
