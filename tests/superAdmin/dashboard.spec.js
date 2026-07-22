// @ts-check
/**
 * tests/superAdmin/dashboard.spec.js
 * ----------------------------------
 * Super Admin — Dashboard module (from JIT Super Admin.xlsx / SA-Dashboard)
 *
 * RULES:
 * - Reuses LoginPage via fixtures/auth.fixture.js (no duplicated login)
 * - Uses users.superAdmin from .env (no hardcoded credentials)
 * - Does NOT recreate login.spec.js coverage
 *
 * Mapped Excel IDs are noted in each test title (SA_001 … SA_024).
 */
import { test, expect } from '../../fixtures/auth.fixture.js';
import { DashboardPage } from '../../pages/superAdmin/DashboardPage.js';
import { users } from '../../test-data/users.js';

test.describe('Super Admin — Dashboard', () => {
  test.beforeEach(async ({ loginAs }) => {
    // Arrange: one shared login for all dashboard happy-path tests
    await loginAs(users.superAdmin);
  });

  test('SA_001 Dashboard loads successfully after login', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await dashboard.expectLoaded();
  });

  test('SA_002 Dashboard title is displayed', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await expect(dashboard.pageTitle).toBeVisible();
  });

  test('SA_003 Welcome message displays Super Administrator role', async ({
    page,
  }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    // Excel says "Good morning..." — staging uses morning/afternoon/evening
    await dashboard.expectWelcomeBanner();
  });

  test('SA_004 Activity Logs quick link opens Activity Logs', async ({
    page,
  }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await dashboard.quickActivityLogs.click();
    await expect(page).toHaveURL(/\/super-admin\/activity-logs/);
  });

  test('SA_005 Projects quick link opens Projects', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await dashboard.quickProjects.click();
    await expect(page).toHaveURL(/\/super-admin\/projects/);
  });

  test('SA_006 Clients quick link opens Clients', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await dashboard.quickClients.click();
    await expect(page).toHaveURL(/\/super-admin\/masters\/clients/);
  });

  test('SA_007 Employees quick link opens Employees', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await dashboard.quickEmployees.click();
    await expect(page).toHaveURL(/\/super-admin\/masters\/employees/);
  });

  test('SA_008 Create Project button is visible', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await expect(dashboard.createProjectLink).toBeVisible();
  });

  test('SA_009 Create Project navigates to create page', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await dashboard.createProjectLink.click();
    await expect(page).toHaveURL(/\/super-admin\/projects\/create/);
  });

  test('SA_010 Activity Logged Today card is displayed', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await dashboard.expectSummaryCardVisible(dashboard.cardActivityLoggedToday);
  });

  test('SA_011 Total Projects card is displayed', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await dashboard.expectSummaryCardVisible(dashboard.cardTotalProjects);
  });

  test('SA_012 Total Users card is displayed', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await dashboard.expectSummaryCardVisible(dashboard.cardTotalUsers);
  });

  test('SA_013 Project Managers card is displayed', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await dashboard.expectSummaryCardVisible(dashboard.cardProjectManagers);
  });

  test('SA_014 Total Clients card is displayed', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await dashboard.expectSummaryCardVisible(dashboard.cardTotalClients);
  });

  test('SA_015 People Logged Today card is displayed', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await dashboard.expectSummaryCardVisible(dashboard.cardPeopleLoggedToday);
  });

  test('SA_016 Recent Activity Logs section is displayed', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await expect(dashboard.recentActivityHeading).toBeVisible();
    // At least one recent activity row/button should be present on staging
    await expect(
      dashboard.main.getByRole('button').filter({ hasText: /Submitted|Critical/i }).first(),
    ).toBeVisible();
  });

  test('SA_017 View All link opens Activity Logs', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await dashboard.viewAllActivityLogs.click();
    await expect(page).toHaveURL(/\/super-admin\/activity-logs/);
  });

  test('SA_018 Projects by Status section shows Active, On Hold, Completed', async ({
    page,
  }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await expect(dashboard.projectsByStatusHeading).toBeVisible();
    await expect(dashboard.main.getByText('Active', { exact: true })).toBeVisible();
    await expect(dashboard.main.getByText('On Hold', { exact: true })).toBeVisible();
    await expect(dashboard.main.getByText('Completed', { exact: true })).toBeVisible();
  });

  test('SA_019 Clients, Vendors & Employees section is displayed', async ({
    page,
  }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await expect(dashboard.clientsVendorsEmployeesHeading).toBeVisible();
    // Chart legend uses <span>; quick-nav also has "Clients" links — scope to spans
    await expect(
      dashboard.main.locator('span').filter({ hasText: /^Clients$/ }),
    ).toBeVisible();
    await expect(
      dashboard.main.locator('span').filter({ hasText: /^Vendors$/ }),
    ).toBeVisible();
    await expect(
      dashboard.main.locator('span').filter({ hasText: /^Employees$/ }),
    ).toBeVisible();
  });

  test('SA_020 Left navigation menu items are displayed', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await dashboard.expectLeftNavigationItems();
  });

  test('SA_021 Notification icon opens notifications panel', async ({
    page,
  }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await dashboard.openNotifications();
  });

  test('SA_022 Logged-in user information is displayed', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await dashboard.expectUserProfile(users.superAdmin);
  });

  test('SA_023 Dashboard remains usable on tablet and mobile widths', async ({
    page,
  }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();

    // Tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page).toHaveURL(/\/super-admin\/dashboard/);
    await expect(dashboard.createProjectLink).toBeVisible();

    // Mobile — header title may be CSS-hidden; prove layout still usable
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page).toHaveURL(/\/super-admin\/dashboard/);
    await expect(page.getByRole('button', { name: 'Open menu' })).toBeVisible();
    await expect(dashboard.createProjectLink).toBeVisible();
  });
});

/**
 * Security case uses a DIFFERENT role — keep it out of the Super Admin beforeEach.
 * Reuses LoginPage through loginAs; does not duplicate login locators.
 */
test.describe('Super Admin — Dashboard security', () => {
  test('SA_024 Unauthorized roles cannot stay on Super Admin Dashboard', async ({
    page,
    loginAs,
  }) => {
    // Act as Project Manager (non–Super Admin)
    await loginAs(users.projectManager);

    // Attempt to open Super Admin dashboard URL directly
    await page.goto('/super-admin/dashboard');

    // Expect: denied or redirected away from SA dashboard
    await expect(page).not.toHaveURL(/\/super-admin\/dashboard/);

    // Should remain in an authorized area (PM home or login), not SA
    await expect(page).toHaveURL(/\/(project-manager|login|field-resource)/);
  });

  test('SA_024b Field Resource cannot stay on Super Admin Dashboard', async ({
    page,
    loginAs,
  }) => {
    await loginAs(users.fieldResource);
    await page.goto('/super-admin/dashboard');
    await expect(page).not.toHaveURL(/\/super-admin\/dashboard/);
    await expect(page).toHaveURL(/\/(field-resource|login|project-manager)/);
  });
});
