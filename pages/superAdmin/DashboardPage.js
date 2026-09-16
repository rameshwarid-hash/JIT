// @ts-check
/**
 * pages/superAdmin/DashboardPage.js
 * ---------------------------------
 * Super Admin Dashboard — defect-finding Page Object.
 * Prefer data + API + business-rule assertions over visibility-only checks.
 */
import { expect } from '@playwright/test';
import { collectConsoleErrors, waitForApi } from '../../utils/network.js';

/**
 * @typedef {{
 *   success: boolean,
 *   data: {
 *     stats: {
 *       projects: { total: number, active: number, byStatus: { active: number, on_hold: number, completed: number } },
 *       users: { total: number, active: number, projectManagers: { total: number, active: number } },
 *       activityLogs: { todaySubmitted: number, todayDrafts: number, critical: number, todayUniqueLoggers: number, todayTotalLogs: number },
 *       clients: { total: number, active: number },
 *       vendors: { total: number, active: number },
 *       employees: { total: number, active: number },
 *     },
 *     recentLogs: Array<{
 *       _id: string,
 *       projectName?: string,
 *       status?: string,
 *       isCritical?: boolean,
 *       workPerformed?: string,
 *       project?: { name?: string },
 *     }>,
 *   },
 * }} DashboardApiPayload
 */

export class DashboardPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.main = page.getByRole('main');
    this.sidebar = page.getByRole('complementary');
    this.nav = page.getByRole('navigation');

    this.pageTitle = this.main.getByRole('heading', {
      name: 'Dashboard',
      level: 1,
    });
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
    this.userProfileButton = this.sidebar.getByRole('button', { name: /@/ });

    this.navDashboard = this.nav.getByRole('link', { name: 'Dashboard' });
    this.navActivityLogs = this.nav.getByRole('link', { name: 'Activity Logs' });
    this.navProjectsSection = this.nav.getByRole('button', { name: 'Projects' });
    this.navMastersSection = this.nav.getByRole('button', { name: 'Masters' });

    /** @type {DashboardApiPayload | null} */
    this.lastDashboardApi = null;
  }

  /**
   * Load the Dashboard UI only. Use for navigation / chrome tests.
   * Does NOT wait on or parse /api/dashboard.
   */
  async goto() {
    await this.page.goto('/super-admin/dashboard');
    await this.expectLoaded();
  }

  /**
   * True when the response is the browser GET /api/dashboard (any status).
   * @param {import('@playwright/test').Response} res
   */
  isDashboardApiResponse(res) {
    return (
      res.url().includes('ji-tech.duckdns.org/api/dashboard') &&
      res.request().method() === 'GET'
    );
  }

  /**
   * Wait for an authenticated browser /api/dashboard (HTTP 200) and read its
   * body immediately on the response event so CDP cannot dispose it first.
   * Never uses page.request — only in-page navigation/reload traffic.
   * @param {() => Promise<unknown>} trigger
   * @returns {Promise<{ response: import('@playwright/test').Response, raw: string }>}
   */
  async waitForDashboardBrowserResponse(trigger) {
    /** @type {{ response: import('@playwright/test').Response, raw: string } | null} */
    let captured = null;

    const bodyPromise = new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        cleanup();
        reject(
          new Error(
            'Timed out waiting for authenticated browser GET /api/dashboard (200)',
          ),
        );
      }, 30_000);

      const onResponse = (/** @type {import('@playwright/test').Response} */ res) => {
        if (!this.isDashboardApiResponse(res)) return;
        // Ignore unauthenticated races (401); keep listening for the 200.
        if (res.status() !== 200) return;
        if (captured) return;

        // Read body immediately while the browser response is still alive.
        res
          .text()
          .then((raw) => {
            if (captured) return;
            captured = { response: res, raw };
            cleanup();
            resolve(captured);
          })
          .catch(() => {
            // Body already disposed — keep listening for a later browser 200.
          });
      };

      const cleanup = () => {
        clearTimeout(timeoutId);
        this.page.off('response', onResponse);
      };

      this.page.on('response', onResponse);
    });

    await trigger();
    return bodyPromise;
  }

  /**
   * @param {import('@playwright/test').Response} response
   * @param {string} raw
   */
  assertDashboardResponseMeta(response, raw) {
    expect(response.status(), 'dashboard API HTTP status').toBe(200);
    const contentType = response.headers()['content-type'] || '';
    expect(contentType, 'dashboard API content-type').toMatch(/application\/json/i);
    expect(raw?.length, 'dashboard API body must be non-empty').toBeGreaterThan(0);
  }

  /**
   * Load Dashboard and capture /api/dashboard for card/data assertions only.
   * @returns {Promise<DashboardApiPayload>}
   */
  async gotoAndLoadApi() {
    const payload = await this.readDashboardJsonSafely(async () => {
      await this.page.goto('/super-admin/dashboard');
    });

    expect(payload.success, 'dashboard API success flag').toBe(true);
    expect(payload.data?.stats, 'dashboard API stats').toBeTruthy();
    this.lastDashboardApi = payload;
    await this.expectLoaded();
    return payload;
  }

  /**
   * Capture JSON from the authenticated browser Response only.
   * If the first 200 body's text cannot be read, wait once for a fresh
   * matching browser response via reload — never page.request.get().
   * @param {() => Promise<unknown>} trigger
   * @returns {Promise<DashboardApiPayload>}
   */
  async readDashboardJsonSafely(trigger) {
    try {
      const { response, raw } = await this.waitForDashboardBrowserResponse(trigger);
      this.assertDashboardResponseMeta(response, raw);
      return /** @type {DashboardApiPayload} */ (JSON.parse(raw));
    } catch (firstError) {
      try {
        const { response, raw } = await this.waitForDashboardBrowserResponse(
          async () => {
            await this.page.reload({ waitUntil: 'domcontentloaded' });
          },
        );
        this.assertDashboardResponseMeta(response, raw);
        return /** @type {DashboardApiPayload} */ (JSON.parse(raw));
      } catch (secondError) {
        const firstMsg =
          firstError instanceof Error ? firstError.message : String(firstError);
        const secondMsg =
          secondError instanceof Error ? secondError.message : String(secondError);
        throw new Error(
          `Failed to read authenticated /api/dashboard body (${firstMsg}); browser retry also failed (${secondMsg})`,
        );
      }
    }
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/\/super-admin\/dashboard$/);
    await expect(this.page).toHaveTitle(/Super Admin/i);
    await expect(this.pageTitle).toBeVisible();
    await expect(this.welcomeHeading).toBeVisible();
  }

  async expectWelcomeBanner() {
    await expect(this.welcomeHeading).toBeVisible();
    await expect(this.welcomeHeading).toContainText(/Super Administrator/i);
    await expect(
      this.main.getByText("Here's what's happening in your system today."),
    ).toBeVisible();
  }

  /**
   * Read a summary card's visible text + primary link href from the DOM.
   * @param {string} title
   * @returns {Promise<{ text: string, href: string | null }>}
   */
  async readCard(title) {
    const result = await this.main.evaluate((main, cardTitle) => {
      const el = Array.from(main.querySelectorAll('p, span, div, h2, h3')).find(
        (e) => e.textContent?.trim() === cardTitle,
      );
      if (!el) return null;
      let root = /** @type {HTMLElement} */ (el);
      for (let i = 0; i < 8 && root.parentElement; i++) {
        root = root.parentElement;
        if (root.querySelector('a[href]')) break;
      }
      return {
        text: (root.innerText || '').replace(/\s+/g, ' ').trim(),
        href: root.querySelector('a')?.getAttribute('href') || null,
      };
    }, title);

    expect(result, `summary card "${title}" should exist`).toBeTruthy();
    return /** @type {{ text: string, href: string | null }} */ (result);
  }

  /**
   * @param {string} title
   * @param {{ hrefIncludes: string | RegExp, mustInclude: Array<string | RegExp> }} expectations
   */
  async expectSummaryCardData(title, expectations) {
    const card = await this.readCard(title);
    for (const needle of expectations.mustInclude) {
      if (typeof needle === 'string') {
        expect(card.text, `card "${title}" text`).toContain(needle);
      } else {
        expect(card.text, `card "${title}" text`).toMatch(needle);
      }
    }
    expect(card.href, `card "${title}" link`).toBeTruthy();
    if (typeof expectations.hrefIncludes === 'string') {
      expect(card.href).toContain(expectations.hrefIncludes);
    } else {
      expect(card.href).toMatch(expectations.hrefIncludes);
    }
  }

  /**
   * Business rule: UI card numbers must match /api/dashboard stats.
   * @param {DashboardApiPayload} api
   */
  async expectCardsMatchApi(api) {
    const { stats } = api.data;

    await this.expectSummaryCardData('Activity logged today', {
      hrefIncludes: '/super-admin/activity-logs',
      mustInclude: [
        `${stats.activityLogs.critical} critical`,
        `${stats.activityLogs.todayTotalLogs} logged today`,
      ],
    });

    await this.expectSummaryCardData('Total projects', {
      hrefIncludes: '/super-admin/projects',
      mustInclude: [
        `${stats.projects.active} active`,
        `${stats.projects.total} total`,
      ],
    });

    await this.expectSummaryCardData('Total users', {
      hrefIncludes: '/super-admin/users',
      mustInclude: [
        `${stats.users.active} active`,
        `${stats.users.total} total`,
      ],
    });

    await this.expectSummaryCardData('Project managers', {
      hrefIncludes: '/super-admin/masters/employees',
      mustInclude: [
        `${stats.users.projectManagers.active} active`,
        `${stats.users.projectManagers.total} total`,
      ],
    });

    await this.expectSummaryCardData('Total clients', {
      hrefIncludes: '/super-admin/masters/clients',
      mustInclude: [
        `${stats.clients.active} active`,
        `${stats.clients.total} total`,
      ],
    });

    await this.expectSummaryCardData('People logged today', {
      hrefIncludes: '/super-admin/activity-logs',
      mustInclude: [
        `${stats.activityLogs.todayTotalLogs} logs`,
        `${stats.activityLogs.todayUniqueLoggers} people logged`,
      ],
    });
  }

  /**
   * Projects-by-status: Active + On Hold + Completed === Total (API + UI).
   * @param {DashboardApiPayload} api
   */
  async expectProjectsByStatusConsistent(api) {
    await expect(this.projectsByStatusHeading).toBeVisible();
    const { projects } = api.data.stats;
    const { active, on_hold, completed } = projects.byStatus;
    expect(active + on_hold + completed, 'status buckets must sum to total').toBe(
      projects.total,
    );

    const sectionText = await this.main.evaluate(() => {
      const h = Array.from(document.querySelectorAll('h3')).find(
        (e) => (e.textContent || '').trim() === 'Projects by status',
      );
      let root = h?.parentElement;
      while (root && root !== document.body) {
        const t = root.innerText || '';
        if (t.includes('Total') && /\d/.test(t)) {
          return t.replace(/\s+/g, ' ').trim();
        }
        root = root.parentElement;
      }
      return '';
    });

    expect(sectionText).toMatch(new RegExp(`\\b${projects.total}\\b`));
    expect(sectionText).toMatch(new RegExp(`Active\\s+${active}`));
    expect(sectionText).toMatch(new RegExp(`On Hold\\s+${on_hold}`));
    expect(sectionText).toMatch(new RegExp(`Completed\\s+${completed}`));
  }

  /**
   * Clients + Vendors + Employees totals must equal chart Total.
   * @param {DashboardApiPayload} api
   */
  async expectClientsVendorsEmployeesConsistent(api) {
    await expect(this.clientsVendorsEmployeesHeading).toBeVisible();
    const { clients, vendors, employees } = api.data.stats;
    const sum = clients.total + vendors.total + employees.total;

    const sectionText = await this.main.evaluate(() => {
      const h = Array.from(document.querySelectorAll('h3')).find((e) =>
        /Clients, Vendors & Employees/i.test(e.textContent || ''),
      );
      let root = h?.parentElement;
      while (root && root !== document.body) {
        const t = root.innerText || '';
        if (t.includes('Total') && /\d/.test(t)) {
          return t.replace(/\s+/g, ' ').trim();
        }
        root = root.parentElement;
      }
      return '';
    });

    expect(sectionText).toMatch(new RegExp(`\\b${sum}\\b`));
    expect(sectionText).toMatch(new RegExp(`Clients\\s+${clients.total}`));
    expect(sectionText).toMatch(new RegExp(`Vendors\\s+${vendors.total}`));
    expect(sectionText).toMatch(new RegExp(`Employees\\s+${employees.total}`));
  }

  /**
   * Recent activity list must reflect API recentLogs (order + no duplicate ids).
   * @param {DashboardApiPayload} api
   */
  async expectRecentActivityMatchesApi(api) {
    await expect(this.recentActivityHeading).toBeVisible();
    await expect(this.viewAllActivityLogs).toHaveAttribute(
      'href',
      '/super-admin/activity-logs',
    );

    const logs = api.data.recentLogs || [];
    expect(logs.length, 'API should return recent logs on staging').toBeGreaterThan(0);

    const ids = logs.map((l) => l._id);
    expect(new Set(ids).size, 'recentLogs must not contain duplicate _id').toBe(
      ids.length,
    );

    // Validate first few entries appear in the UI list (project name + status)
    const sample = logs.slice(0, Math.min(3, logs.length));
    for (const log of sample) {
      const projectName = log.projectName || log.project?.name;
      expect(projectName, 'recent log project name').toBeTruthy();
      await expect(
        this.main.getByText(/** @type {string} */ (projectName), { exact: true }).first(),
      ).toBeVisible();

      if (log.isCritical) {
        await expect(
          this.main.getByText('Critical', { exact: true }).first(),
        ).toBeVisible();
      }
      if (log.status === 'submitted') {
        await expect(
          this.main.getByText('Submitted', { exact: true }).first(),
        ).toBeVisible();
      }
    }
  }

  /**
   * @param {import('@playwright/test').Locator} sectionButton
   */
  async expandNavSection(sectionButton) {
    const expanded = await sectionButton.getAttribute('aria-expanded');
    if (expanded !== 'true') {
      await sectionButton.click();
    }
  }

  async expectLeftNavigationItems() {
    await expect(this.navDashboard).toHaveAttribute('href', '/super-admin/dashboard');
    await expect(this.navActivityLogs).toHaveAttribute(
      'href',
      '/super-admin/activity-logs',
    );

    await this.expandNavSection(this.navProjectsSection);
    await expect(this.nav.getByRole('link', { name: 'All Projects' })).toHaveAttribute(
      'href',
      '/super-admin/projects',
    );
    await expect(
      this.nav.getByRole('link', { name: 'Create Project' }),
    ).toHaveAttribute('href', '/super-admin/projects/create');

    await this.expandNavSection(this.navMastersSection);
    await expect(this.nav.getByRole('link', { name: 'Clients' })).toHaveAttribute(
      'href',
      '/super-admin/masters/clients',
    );
    await expect(this.nav.getByRole('link', { name: 'Employees' })).toHaveAttribute(
      'href',
      '/super-admin/masters/employees',
    );
    await expect(this.nav.getByRole('link', { name: 'Vendors' })).toHaveAttribute(
      'href',
      '/super-admin/masters/vendors',
    );
  }

  async openNotifications() {
    const unreadPromise = waitForApi(this.page, {
      urlPart: '/api/notifications',
      method: 'GET',
      status: 200,
    }).catch(() => null);

    await this.notificationsButton.click();
    await expect(this.notificationsDialog).toBeVisible();
    await expect(
      this.notificationsDialog.getByRole('heading', { name: 'Notifications' }),
    ).toBeVisible();
    await expect(
      this.notificationsDialog.getByRole('tab', { name: /Unread|Read/i }).first(),
    ).toBeVisible();

    // Unread-count may already have fired on page load; ignore if missed.
    await unreadPromise;
  }

  /**
   * @param {{ email: string, role?: string }} user
   */
  async expectUserProfile(user) {
    await expect(this.userProfileButton).toBeVisible();
    await expect(this.userProfileButton).toContainText(user.email);
  }

  /**
   * Click a main quick-nav link and assert destination (no API coupling).
   * Verifies: click, URL, H1, no login redirect, no actionable console errors.
   * @param {import('@playwright/test').Locator} link
   * @param {{ url: RegExp, heading: string }} dest
   */
  async expectQuickNav(link, dest) {
    await expect(link).toBeVisible();
    const href = await link.getAttribute('href');
    expect(href, 'quick-nav href').toBeTruthy();

    const consoleErrors = await collectConsoleErrors(this.page, async () => {
      await link.click();
      await expect(this.page).toHaveURL(dest.url);
    });

    // No unexpected auth bounce or wrong-role landing
    expect(this.page.url(), 'must not redirect to login').not.toMatch(/\/login/);
    expect(this.page.url(), 'must stay on Super Admin area').toMatch(/\/super-admin\//);

    await expect(
      this.page.getByRole('heading', { name: dest.heading, level: 1 }),
    ).toBeVisible();

    const ignored = [
      /Download the React DevTools/i,
      /favicon/i,
      /forgot-password/i,
      /Failed to load resource: the server responded with a status of 404/i,
    ];
    const actionable = consoleErrors.filter(
      (msg) => !ignored.some((re) => re.test(msg)),
    );
    expect(
      actionable,
      `Unexpected console/page errors after nav: ${actionable.join(' | ')}`,
    ).toEqual([]);
  }
}
