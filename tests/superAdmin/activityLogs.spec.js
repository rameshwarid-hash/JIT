// @ts-check
/**
 * tests/superAdmin/activityLogs.spec.js
 * Super Admin — Activity Logs + Details popup
 * (SA-ActivityLogs + SA-ActivityDetailsPopup sheets)
 */
import { test, expect } from '../../fixtures/auth.fixture.js';
import { ActivityLogsPage } from '../../pages/superAdmin/ActivityLogsPage.js';
import { users } from '../../test-data/users.js';

test.describe('Super Admin — Activity Logs', () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs(users.superAdmin);
  });

  test('SA_AL_001 Activity Logs page loads', async ({ page }) => {
    const logs = new ActivityLogsPage(page);
    await logs.goto();
    await logs.expectLoaded();
  });

  test('SA_AL_002 Page title is displayed', async ({ page }) => {
    const logs = new ActivityLogsPage(page);
    await logs.goto();
    await expect(logs.pageTitle).toBeVisible();
  });

  test('SA_AL_011 Search field accepts input', async ({ page }) => {
    const logs = new ActivityLogsPage(page);
    await logs.goto();
    await logs.search('test');
    await expect(logs.searchInput).toHaveValue('test');
  });

  test('SA_AL_012 Search by Project Name', async ({ page }) => {
    const logs = new ActivityLogsPage(page);
    await logs.goto();
    await logs.search('Hemang');
    await logs.expectRowContaining(/Hemang/i);
  });

  test('SA_AL_015 Search with invalid keyword', async ({ page }) => {
    const logs = new ActivityLogsPage(page);
    await logs.goto();
    await logs.search('XYZ123NOMATCH999');
    await logs.expectNoResults();
  });

  test('SA_AL filter and date controls are visible', async ({ page }) => {
    const logs = new ActivityLogsPage(page);
    await logs.goto();
    await logs.expectFilterControls();
  });

  test('SA_AL_016 Status filter options exist', async ({ page }) => {
    const logs = new ActivityLogsPage(page);
    await logs.goto();
    await logs.main.getByRole('combobox').first().click();
    await expect(page.getByRole('option').first()).toBeVisible();
  });

  test('SA_AL_033 Pagination / showing count is visible', async ({ page }) => {
    const logs = new ActivityLogsPage(page);
    await logs.goto();
    await expect(logs.main.getByText(/Showing|Per page|page/i).first()).toBeVisible();
  });

  test('SA_AD_001 Activity Details popup opens from a row', async ({ page }) => {
    const logs = new ActivityLogsPage(page);
    await logs.goto();
    await logs.openFirstActivityDetails();
    await logs.expectDetailsPopupVisible();
  });

  test('SA_AD_027 Close closes Activity Details popup', async ({ page }) => {
    const logs = new ActivityLogsPage(page);
    await logs.goto();
    await logs.openFirstActivityDetails();
    await logs.closeDetailsPopup();
  });
});

test.describe('Super Admin — Activity Logs security', () => {
  test('SA_AL_038 Unauthorized role cannot access SA Activity Logs', async ({
    page,
    loginAs,
  }) => {
    await loginAs(users.fieldResource);
    await page.goto('/super-admin/activity-logs');
    await expect(page).not.toHaveURL(/\/super-admin\/activity-logs/);
  });
});
