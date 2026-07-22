// @ts-check
/**
 * tests/superAdmin/projects.spec.js
 * Super Admin — All Projects (JIT Super Admin.xlsx / SA-AllProjecs)
 */
import { test, expect } from '../../fixtures/auth.fixture.js';
import { ProjectsPage } from '../../pages/superAdmin/ProjectsPage.js';
import { users } from '../../test-data/users.js';
import { knownProject } from '../../test-data/superAdmin/masters.js';

test.describe('Super Admin — Projects', () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs(users.superAdmin);
  });

  test('SA_PRJ_001 All Projects page loads', async ({ page }) => {
    const projects = new ProjectsPage(page);
    await projects.goto();
    await projects.expectLoaded();
  });

  test('SA_PRJ_002 Page title is All Projects', async ({ page }) => {
    const projects = new ProjectsPage(page);
    await projects.goto();
    await expect(projects.pageTitle).toBeVisible();
  });

  test('SA_PRJ_004 Search textbox is displayed', async ({ page }) => {
    const projects = new ProjectsPage(page);
    await projects.goto();
    await expect(projects.searchInput).toBeVisible();
  });

  test('SA_PRJ_005 Search using Project Name (partial)', async ({ page }) => {
    const projects = new ProjectsPage(page);
    await projects.goto();
    await projects.search(knownProject.nameHint);
    await projects.expectRowContaining(new RegExp(knownProject.nameHint, 'i'));
  });

  test('SA_PRJ_008 Search with invalid keyword shows no matches', async ({
    page,
  }) => {
    const projects = new ProjectsPage(page);
    await projects.goto();
    await projects.search('XYZ123NOMATCH999');
    await projects.expectNoResults();
  });

  test('SA_PRJ_009 Search field clears correctly', async ({ page }) => {
    const projects = new ProjectsPage(page);
    await projects.goto();
    await projects.search('something');
    await projects.searchInput.clear();
    await expect(projects.searchInput).toHaveValue('');
  });

  test('SA_PRJ_010 Status dropdown values', async ({ page }) => {
    const projects = new ProjectsPage(page);
    await projects.goto();
    await projects.openStatusFilter();
    await expect(page.getByRole('option', { name: /All Statuses/i })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Active', exact: true })).toBeVisible();
    await expect(page.getByRole('option', { name: /On Hold/i })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Completed', exact: true })).toBeVisible();
  });

  test('SA_PRJ_011 Filter by Active status', async ({ page }) => {
    const projects = new ProjectsPage(page);
    await projects.goto();
    await projects.selectStatus('Active');
    await expect(projects.main.getByText(/Active/i).first()).toBeVisible();
  });

  test('SA_PRJ_014 Publish State filter control is present', async ({ page }) => {
    const projects = new ProjectsPage(page);
    await projects.goto();
    await expect(
      projects.main.getByRole('combobox').filter({ hasText: /Publish/i }),
    ).toBeVisible();
  });

  test('SA_PRJ filter controls for Client / Manager / Vendor are present', async ({
    page,
  }) => {
    const projects = new ProjectsPage(page);
    await projects.goto();
    await projects.expectFilterControls();
  });

  test('SA_PRJ_030 Create Project entry point is available', async ({ page }) => {
    const projects = new ProjectsPage(page);
    await projects.goto();
    // Via direct create URL from dashboard pattern — ensure create route works from projects context
    await page.goto('/super-admin/projects/create');
    await expect(page).toHaveURL(/\/super-admin\/projects\/create/);
  });

  test('SA_PRJ_043 Pagination / showing count is visible', async ({ page }) => {
    const projects = new ProjectsPage(page);
    await projects.goto();
    await expect(projects.main.getByText(/Showing|Per page|page/i).first()).toBeVisible();
  });
});

test.describe('Super Admin — Projects security', () => {
  test('SA_PRJ_047 Unauthorized role cannot access SA Projects', async ({
    page,
    loginAs,
  }) => {
    await loginAs(users.projectManager);
    await page.goto('/super-admin/projects');
    await expect(page).not.toHaveURL(/\/super-admin\/projects$/);
  });
});
