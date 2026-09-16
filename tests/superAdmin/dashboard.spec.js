// @ts-check
/**
 * tests/superAdmin/dashboard.spec.js
 * ----------------------------------
 * Super Admin Dashboard — defect-finding suite.
 *
 * Navigation tests load the UI only (goto).
 * Card / chart / API tests alone call gotoAndLoadApi().
 *
 * Intentionally NOT applicable on Dashboard:
 * - Traditional table filter / sort / pagination controls
 * - Required-field form validation / toast on page load
 */
import { test, expect } from '../../fixtures/auth.fixture.js';
import { DashboardPage } from '../../pages/superAdmin/DashboardPage.js';
import { users } from '../../test-data/users.js';
import { collectConsoleErrors } from '../../utils/network.js';

/** Ignore known staging noise that is not a dashboard regression. */
const IGNORED_CONSOLE = [
  /Download the React DevTools/i,
  /favicon/i,
  /forgot-password/i,
  /Failed to load resource: the server responded with a status of 404/i,
];

/**
 * @param {string[]} errors
 */
function actionableConsoleErrors(errors) {
  return errors.filter((msg) => !IGNORED_CONSOLE.some((re) => re.test(msg)));
}

test.describe('Super Admin — Dashboard navigation', () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs(users.superAdmin);
  });

  test('SA_002 + SA_003 Title and welcome banner show Super Administrator role', async ({
    page,
  }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await expect(dashboard.pageTitle).toHaveText('Dashboard');
    await dashboard.expectWelcomeBanner();
  });

  test('SA_004 Activity Logs quick link reaches Activity Logs page', async ({
    page,
  }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await dashboard.expectQuickNav(dashboard.quickActivityLogs, {
      url: /\/super-admin\/activity-logs/,
      heading: 'Activity Logs',
    });
  });

  test('SA_005 Projects quick link reaches All Projects page', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await dashboard.expectQuickNav(dashboard.quickProjects, {
      url: /\/super-admin\/projects(?!\/create)/,
      heading: 'All Projects',
    });
  });

  test('SA_006 Clients quick link reaches Clients page', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await dashboard.expectQuickNav(dashboard.quickClients, {
      url: /\/super-admin\/masters\/clients/,
      heading: 'Clients',
    });
  });

  test('SA_007 Employees quick link reaches Employees page', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await dashboard.expectQuickNav(dashboard.quickEmployees, {
      url: /\/super-admin\/masters\/employees/,
      heading: 'Employees',
    });
  });

  test('SA_008 + SA_009 Create Project link href and navigation', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await expect(dashboard.createProjectLink).toHaveAttribute(
      'href',
      '/super-admin/projects/create',
    );
    await dashboard.expectQuickNav(dashboard.createProjectLink, {
      url: /\/super-admin\/projects\/create/,
      heading: 'Create Project',
    });
  });

  test('SA_017 View All opens Activity Logs (URL + heading)', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await expect(dashboard.viewAllActivityLogs).toHaveAttribute(
      'href',
      '/super-admin/activity-logs',
    );
    await dashboard.viewAllActivityLogs.click();
    await expect(page).toHaveURL(/\/super-admin\/activity-logs/);
    await expect(page).not.toHaveURL(/\/login/);
    await expect(
      page.getByRole('heading', { name: 'Activity Logs', level: 1 }),
    ).toBeVisible();
  });

  test('SA_020 Left navigation hrefs are correct for SA routes', async ({
    page,
  }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await dashboard.expectLeftNavigationItems();
  });

  test('SA_021 Notifications panel opens with Unread/Read tabs', async ({
    page,
  }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await dashboard.openNotifications();
    await expect(
      dashboard.notificationsDialog.getByRole('tab', { name: 'Unread', exact: true }),
    ).toBeVisible();
    await expect(
      dashboard.notificationsDialog.getByRole('tab', { name: 'Read', exact: true }),
    ).toBeVisible();
    await expect(
      dashboard.notificationsDialog.getByRole('button', { name: /Close/i }),
    ).toBeVisible();
  });

  test('SA_022 Profile shows authenticated Super Admin email', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await dashboard.expectUserProfile(users.superAdmin);
  });

  test('Card deep-link View projects lands on All Projects', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await page.getByRole('link', { name: 'View projects' }).click();
    await expect(page).toHaveURL(/\/super-admin\/projects(?!\/create)/);
    await expect(page).not.toHaveURL(/\/login/);
    await expect(
      page.getByRole('heading', { name: 'All Projects', level: 1 }),
    ).toBeVisible();
  });
});

test.describe('Super Admin — Dashboard API & data', () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs(users.superAdmin);
  });

  test('SA_001 Dashboard loads with healthy API and no actionable console errors', async ({
    page,
  }) => {
    const dashboard = new DashboardPage(page);

    const errors = await collectConsoleErrors(page, async () => {
      await dashboard.gotoAndLoadApi();
    });

    await dashboard.expectLoaded();
    const api = dashboard.lastDashboardApi;
    expect(api?.success).toBe(true);
    expect(api?.data.stats.projects.total).toBeGreaterThan(0);

    expect(
      actionableConsoleErrors(errors),
      `Unexpected console/page errors: ${actionableConsoleErrors(errors).join(' | ')}`,
    ).toEqual([]);
  });

  test('SA_010–SA_015 Summary cards match /api/dashboard stats and deep-links', async ({
    page,
  }) => {
    const dashboard = new DashboardPage(page);
    const api = await dashboard.gotoAndLoadApi();
    await dashboard.expectCardsMatchApi(api);

    // Deep-link filter validation: Activity card must target critical filter
    const activityCard = await dashboard.readCard('Activity logged today');
    expect(activityCard.href).toContain('isCritical=true');
  });

  test('SA_016 Recent Activity Logs list matches API and has no duplicate ids', async ({
    page,
  }) => {
    const dashboard = new DashboardPage(page);
    const api = await dashboard.gotoAndLoadApi();
    await dashboard.expectRecentActivityMatchesApi(api);
  });

  test('SA_018 Projects by status buckets sum to total (API + UI)', async ({
    page,
  }) => {
    const dashboard = new DashboardPage(page);
    const api = await dashboard.gotoAndLoadApi();
    await dashboard.expectProjectsByStatusConsistent(api);
  });

  test('SA_019 Clients + Vendors + Employees chart matches API totals', async ({
    page,
  }) => {
    const dashboard = new DashboardPage(page);
    const api = await dashboard.gotoAndLoadApi();
    await dashboard.expectClientsVendorsEmployeesConsistent(api);
  });

  test('SA_023 Responsive: core metrics remain readable on tablet and mobile', async ({
    page,
  }) => {
    const dashboard = new DashboardPage(page);
    const api = await dashboard.gotoAndLoadApi();

    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page).toHaveURL(/\/super-admin\/dashboard/);
    await dashboard.expectCardsMatchApi(api);

    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByRole('button', { name: 'Open menu' })).toBeVisible();
    // Mobile may hide H1 via CSS — prove business data still present
    const projectsCard = await dashboard.readCard('Total projects');
    expect(projectsCard.text).toContain(`${api.data.stats.projects.total} total`);
    await expect(dashboard.createProjectLink).toBeVisible();
  });

  test('Negative: Active ≤ Total for projects/users/clients (business invariants)', async ({
    page,
  }) => {
    const dashboard = new DashboardPage(page);
    const api = await dashboard.gotoAndLoadApi();
    const { projects, users: u, clients, vendors, employees } = api.data.stats;

    expect(projects.active).toBeLessThanOrEqual(projects.total);
    expect(u.active).toBeLessThanOrEqual(u.total);
    expect(clients.active).toBeLessThanOrEqual(clients.total);
    expect(vendors.active).toBeLessThanOrEqual(vendors.total);
    expect(employees.active).toBeLessThanOrEqual(employees.total);
    expect(api.data.stats.activityLogs.critical).toBeGreaterThanOrEqual(0);
    expect(api.data.stats.activityLogs.todayTotalLogs).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Super Admin — Dashboard security & auth negatives', () => {
  test('SA_024 Project Manager cannot access Super Admin dashboard', async ({
    page,
    loginAs,
  }) => {
    await loginAs(users.projectManager);
    await page.goto('/super-admin/dashboard');

    await expect(page).not.toHaveURL(/\/super-admin\/dashboard/);
    await expect(page).toHaveURL(/\/project-manager\//);
    await expect(
      page.getByRole('heading', { name: 'Dashboard', level: 1 }),
    ).toBeVisible();
    // Must not expose Super Admin welcome copy
    await expect(
      page.getByRole('heading', { name: /Super Administrator/i }),
    ).toHaveCount(0);
  });

  test('SA_024b Field Resource cannot access Super Admin dashboard', async ({
    page,
    loginAs,
  }) => {
    await loginAs(users.fieldResource);
    await page.goto('/super-admin/dashboard');

    await expect(page).not.toHaveURL(/\/super-admin\/dashboard/);
    await expect(page).toHaveURL(/\/field-resource\//);
    await expect(
      page.getByRole('heading', { name: /Super Administrator/i }),
    ).toHaveCount(0);
  });

  test('Unauthenticated user hitting SA dashboard is sent to login', async ({
    page,
  }) => {
    await page.context().clearCookies();
    await page.goto('/super-admin/dashboard');
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
  });
});

/**
 * Dashboard limitations (not fake-tested):
 * - No required-field / submit toast on this page (no create form here)
 * - No sortable data-grid / rows-per-page (recent logs are an API preview slice)
 * - Search/filter widgets live on Activity Logs / Projects — dashboard uses deep-links
 * - Duplicate master-data create belongs to Clients/Vendors/Employees modules
 */
