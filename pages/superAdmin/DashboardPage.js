// @ts-check
/**
 * pages/superAdmin/DashboardPage.js
 * ---------------------------------
 * WHY THIS FILE EXISTS:
 * Encapsulates Super Admin Dashboard locators and actions so
 * tests/superAdmin/dashboard.spec.js stays readable and we do not
 * scatter getByRole() calls across many tests.
 *
 * Locators were verified against staging (/super-admin/dashboard).
 */
import { expect } from '@playwright/test';

export class DashboardPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;

    // Scope quick links to <main> so they do not clash with the sidebar
    this.main = page.getByRole('main');
    this.sidebar = page.getByRole('complementary');
    this.nav = page.getByRole('navigation');

    this.pageTitle = this.main.getByRole('heading', {
      name: 'Dashboard',
      level: 1,
    });

    // Greeting changes by time of day — use a flexible matcher
    this.welcomeHeading = this.main.getByRole('heading', {
      name: /Good (morning|afternoon|evening), Super Administrator/i,
      level: 2,
    });

    this.createProjectLink = this.main.getByRole('link', {
      name: 'Create Project',
    });

    this.quickActivityLogs = this.main.getByRole('link', {
      name: 'Activity Logs',
      exact: true,
    });
    this.quickProjects = this.main.getByRole('link', {
      name: 'Projects',
      exact: true,
    });
    this.quickClients = this.main.getByRole('link', {
      name: 'Clients',
      exact: true,
    });
    this.quickEmployees = this.main.getByRole('link', {
      name: 'Employees',
      exact: true,
    });

    // Summary cards — locate by visible card title text
    this.cardActivityLoggedToday = this.main.getByText('Activity logged today', {
      exact: true,
    });
    this.cardTotalProjects = this.main.getByText('Total projects', {
      exact: true,
    });
    this.cardTotalUsers = this.main.getByText('Total users', { exact: true });
    this.cardProjectManagers = this.main.getByText('Project managers', {
      exact: true,
    });
    this.cardTotalClients = this.main.getByText('Total clients', {
      exact: true,
    });
    this.cardPeopleLoggedToday = this.main.getByText('People logged today', {
      exact: true,
    });

    this.recentActivityHeading = this.main.getByRole('heading', {
      name: 'Recent Activity Logs',
      level: 3,
    });
    this.viewAllActivityLogs = this.main.getByRole('link', { name: 'View all' });

    this.projectsByStatusHeading = this.main.getByRole('heading', {
      name: 'Projects by status',
      level: 3,
    });
    this.clientsVendorsEmployeesHeading = this.main.getByRole('heading', {
      name: 'Clients, Vendors & Employees',
      level: 3,
    });

    this.notificationsButton = page.getByRole('button', {
      name: 'Notifications',
    });
    this.notificationsDialog = page.getByRole('dialog');

    // Sidebar profile button includes name + email in accessible name
    this.userProfileButton = this.sidebar.getByRole('button', {
      name: /@/,
    });

    this.navDashboard = this.nav.getByRole('link', { name: 'Dashboard' });
    this.navActivityLogs = this.nav.getByRole('link', {
      name: 'Activity Logs',
    });
    this.navProjectsSection = this.nav.getByRole('button', { name: 'Projects' });
    this.navMastersSection = this.nav.getByRole('button', { name: 'Masters' });
  }

  async goto() {
    await this.page.goto('/super-admin/dashboard');
  }

  /**
   * SA_001 / SA_002 — dashboard loaded with title visible
   */
  async expectLoaded() {
    await expect(this.page).toHaveURL(/\/super-admin\/dashboard/);
    await expect(this.page).toHaveTitle(/Super Admin/i);
    await expect(this.pageTitle).toBeVisible();
  }

  /**
   * SA_003 — welcome banner shows Super Administrator (time-aware)
   */
  async expectWelcomeBanner() {
    await expect(this.welcomeHeading).toBeVisible();
    await expect(
      this.main.getByText("Here's what's happening in your system today."),
    ).toBeVisible();
  }

  /**
   * Expand a collapsible sidebar section if it is collapsed.
   * @param {import('@playwright/test').Locator} sectionButton
   */
  async expandNavSection(sectionButton) {
    const expanded = await sectionButton.getAttribute('aria-expanded');
    if (expanded !== 'true') {
      await sectionButton.click();
    }
  }

  /**
   * SA_020 — left navigation items from Excel
   */
  async expectLeftNavigationItems() {
    await expect(this.navDashboard).toBeVisible();
    await expect(this.navActivityLogs).toBeVisible();

    await this.expandNavSection(this.navProjectsSection);
    await expect(
      this.nav.getByRole('link', { name: 'All Projects' }),
    ).toBeVisible();
    await expect(
      this.nav.getByRole('link', { name: 'Create Project' }),
    ).toBeVisible();

    await this.expandNavSection(this.navMastersSection);
    await expect(this.nav.getByRole('link', { name: 'Clients' })).toBeVisible();
    await expect(
      this.nav.getByRole('link', { name: 'Employees' }),
    ).toBeVisible();
    await expect(this.nav.getByRole('link', { name: 'Vendors' })).toBeVisible();
  }

  /**
   * SA_021 — open notifications panel
   */
  async openNotifications() {
    await this.notificationsButton.click();
    await expect(this.notificationsDialog).toBeVisible();
    await expect(
      this.notificationsDialog.getByRole('heading', { name: 'Notifications' }),
    ).toBeVisible();
  }

  /**
   * SA_022 — profile shows logged-in name/email
   * @param {{ email: string }} user
   */
  async expectUserProfile(user) {
    await expect(this.userProfileButton).toBeVisible();
    await expect(this.userProfileButton).toContainText(user.email);
  }

  /**
   * Assert a summary card title is visible.
   * Exact counts change on staging — we assert presence, not hardcoded numbers.
   * @param {import('@playwright/test').Locator} titleLocator
   */
  async expectSummaryCardVisible(titleLocator) {
    await expect(titleLocator).toBeVisible();
  }
}
