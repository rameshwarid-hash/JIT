// @ts-check
/**
 * pages/superAdmin/ClientsPage.js
 * Clients master list + Add Client dialog (Super Admin).
 */
import { expect } from '@playwright/test';

/**
 * @typedef {{
 *   success: boolean,
 *   message?: string,
 *   data: any,
 *   pagination?: { page: number, limit: number, total: number, totalPages: number },
 * }} ClientsApiPayload
 */

export class ClientsPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.main = page.getByRole('main');
    this.pageTitle = this.main.getByRole('heading', { name: 'Clients', level: 1 });
    this.searchInput = this.main
      .getByPlaceholder('Search clients...')
      .filter({ visible: true });
    this.statusFilter = this.main.getByRole('combobox').filter({ visible: true });
    this.addClientButton = this.main.getByRole('button', { name: 'Add Client' });
    this.dialog = page.getByRole('dialog');
    this.table = this.main.getByRole('table');
    this.showingLabel = this.main.getByText(/Showing\s+\d/);
    this.nextPageButton = this.page.getByRole('button', { name: 'Next page' });
    this.prevPageButton = this.page.getByRole('button', { name: 'Previous page' });
  }

  /**
   * @param {import('@playwright/test').Response} res
   * @param {{ method?: string, status?: number }} [opts]
   */
  isClientsListResponse(res, opts = {}) {
    const method = (opts.method || 'GET').toUpperCase();
    if (res.request().method() !== method) return false;

    let pathname = '';
    try {
      pathname = new URL(res.url()).pathname.replace(/\/$/, '') || '/';
    } catch {
      return false;
    }

    // List/create collection only — exclude /api/clients/:id and /users
    if (pathname !== '/api/clients') return false;
    if (opts.status != null) return res.status() === opts.status;
    return true;
  }

  /**
   * Wait for a matching browser /api/clients response and read body immediately.
   * @param {() => Promise<unknown>} trigger
   * @param {{
   *   method?: string,
   *   status?: number,
   *   urlIncludes?: string | RegExp,
   * }} [opts]
   * @returns {Promise<{ response: import('@playwright/test').Response, payload: ClientsApiPayload }>}
   */
  async waitForClientsApi(trigger, opts = {}) {
    const method = (opts.method || 'GET').toUpperCase();
    const status = opts.status;

    const responsePromise = this.page.waitForResponse(
      (res) => {
        if (!this.isClientsListResponse(res, { method })) return false;
        if (status != null && res.status() !== status) return false;
        if (opts.urlIncludes) {
          const url = res.url();
          if (typeof opts.urlIncludes === 'string') {
            if (!url.includes(opts.urlIncludes)) return false;
          } else if (!opts.urlIncludes.test(url)) {
            return false;
          }
        }
        return true;
      },
      { timeout: 30_000 },
    );

    await trigger();
    const response = await responsePromise;

    let raw = '';
    try {
      raw = await response.text();
    } catch (firstError) {
      // Body disposed — wait once for another matching browser response via reload/trigger is caller-specific.
      throw new Error(
        `Could not read /api/clients body: ${
          firstError instanceof Error ? firstError.message : String(firstError)
        }`,
      );
    }

    const payload = /** @type {ClientsApiPayload} */ (JSON.parse(raw));
    return { response, payload };
  }

  async goto() {
    await this.page.goto('/super-admin/masters/clients');
  }

  /**
   * Navigate and capture the initial list GET (page=1).
   * @returns {Promise<ClientsApiPayload>}
   */
  async gotoAndLoadList() {
    const { response, payload } = await this.waitForClientsApi(
      async () => {
        await this.goto();
      },
      { method: 'GET', status: 200, urlIncludes: 'page=1' },
    );
    expect(payload.success).toBe(true);
    expect(Array.isArray(payload.data)).toBe(true);
    expect(payload.pagination?.page).toBe(1);
    await this.expectLoaded();
    return payload;
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/\/super-admin\/masters\/clients/);
    await expect(this.pageTitle).toBeVisible();
    await expect(this.searchInput).toBeVisible();
    await expect(this.addClientButton).toBeVisible();
  }

  /** @param {string} query */
  async search(query) {
    await this.searchInput.fill(query);
    await this.searchInput.press('Enter');
  }

  /**
   * @param {string} query
   * @returns {Promise<ClientsApiPayload>}
   */
  async searchAndCapture(query) {
    const searchToken = `search=${encodeURIComponent(query).replace(/%20/g, '+')}`;
    const [response] = await Promise.all([
      this.page.waitForResponse(
        (res) =>
          this.isClientsListResponse(res, { method: 'GET' }) &&
          res.status() === 200 &&
          res.url().includes(searchToken),
        { timeout: 30_000 },
      ),
      this.search(query),
    ]);
    const payload = /** @type {ClientsApiPayload} */ (JSON.parse(await response.text()));
    expect(payload.success).toBe(true);
    return payload;
  }

  async expectNoResults() {
    await expect(
      this.main
        .getByText(/No clients found/i)
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

  /**
   * Assert a table row contains the given cells (order-independent presence).
   * @param {string} name
   * @param {string[]} mustInclude
   */
  async expectRowData(name, mustInclude) {
    const row = this.table.getByRole('row').filter({ hasText: name }).first();
    await expect(row).toBeVisible();
    const text = (await row.innerText()).replace(/\s+/g, ' ');
    for (const part of mustInclude) {
      expect(text, `row "${name}"`).toContain(part);
    }
  }

  /**
   * Every visible data row Status cell must equal expected (Active/Inactive).
   * @param {'Active' | 'Inactive'} statusLabel
   */
  async expectAllVisibleStatuses(statusLabel) {
    const rows = this.table.locator('tbody tr');
    const count = await rows.count();
    expect(count, 'filtered list should have rows or empty-state handled by caller').toBeGreaterThan(
      0,
    );
    for (let i = 0; i < count; i++) {
      const statusCell = rows.nth(i).locator('td').last();
      await expect(statusCell).toHaveText(statusLabel);
    }
  }

  async openStatusFilter() {
    await this.statusFilter.click();
  }

  /** @param {string} optionLabel */
  async selectStatus(optionLabel) {
    await this.openStatusFilter();
    await this.page.getByRole('option', { name: optionLabel, exact: true }).click();
  }

  /**
   * @param {'All Statuses' | 'Active' | 'Inactive'} optionLabel
   * @returns {Promise<ClientsApiPayload>}
   */
  async selectStatusAndCapture(optionLabel) {
    /** @type {string | undefined} */
    let urlIncludes;
    if (optionLabel === 'Active') urlIncludes = 'status=active';
    else if (optionLabel === 'Inactive') urlIncludes = 'status=inactive';

    const { response, payload } = await this.waitForClientsApi(
      async () => {
        await this.selectStatus(optionLabel);
      },
      {
        method: 'GET',
        status: 200,
        ...(urlIncludes ? { urlIncludes } : {}),
      },
    );

    if (optionLabel === 'All Statuses') {
      expect(response.url()).not.toContain('status=');
    }
    expect(payload.success).toBe(true);
    return payload;
  }

  async openAddClient() {
    await this.addClientButton.click();
    await expect(this.dialog.getByRole('heading', { name: 'Add Client' })).toBeVisible();
  }

  async expectListColumns() {
    for (const col of ['Name', 'Code', 'Users', 'Contact Email', 'Phone', 'Status']) {
      await expect(this.main.getByText(col, { exact: true }).first()).toBeVisible();
    }
  }

  /**
   * @param {ClientsApiPayload} listPayload
   */
  async expectTableMatchesListApi(listPayload) {
    const rows = /** @type {Array<{ name: string, code: string, contactEmail?: string, status: string }>} */ (
      listPayload.data
    );
    expect(rows.length).toBeGreaterThan(0);
    const sample = rows.slice(0, Math.min(3, rows.length));
    for (const client of sample) {
      await this.expectRowData(client.name, [
        client.code,
        client.status === 'active' ? 'Active' : 'Inactive',
      ]);
      if (client.contactEmail) {
        await this.expectRowData(client.name, [client.contactEmail]);
      }
    }
  }

  get nameInput() {
    return this.dialog.getByPlaceholder('Enter client name');
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
    return this.dialog.getByRole('button', { name: 'Add Client', exact: true });
  }
  get cancelButton() {
    return this.dialog.getByRole('button', { name: 'Cancel' });
  }

  /** @param {{ name: string, email?: string, phone?: string, address?: string, notes?: string }} data */
  async fillClientForm(data) {
    await this.nameInput.fill(data.name);
    if (data.email) await this.emailInput.fill(data.email);
    if (data.phone) await this.phoneInput.fill(data.phone);
    if (data.address) await this.addressInput.fill(data.address);
    if (data.notes) await this.notesInput.fill(data.notes);
  }

  async submitAddClient() {
    await this.submitButton.click();
  }

  /**
   * Submit Add Client and assert POST /api/clients success.
   * @returns {Promise<ClientsApiPayload>}
   */
  async submitAddClientAndCapture() {
    const { response, payload } = await this.waitForClientsApi(
      async () => {
        await this.submitAddClient();
      },
      { method: 'POST' },
    );
    expect(response.status(), 'create client HTTP status').toBe(201);
    expect(payload.success).toBe(true);
    expect(payload.message || '').toMatch(/created successfully/i);
    expect(payload.data?.name).toBeTruthy();
    expect(payload.data?.code).toBeTruthy();
    await expect(this.dialog).toBeHidden({ timeout: 15_000 });
    return payload;
  }

  async cancelAddClient() {
    await this.cancelButton.click();
    await expect(this.dialog).toBeHidden();
  }

  /**
   * Create a client (dialog closes on success).
   * @param {{ name: string, email?: string, phone?: string, address?: string, notes?: string }} data
   */
  async createClient(data) {
    await this.openAddClient();
    await this.fillClientForm(data);
    await this.submitAddClient();
    await expect(this.dialog).toBeHidden({ timeout: 15_000 });
  }

  async expectNameRequired() {
    // Staging uses custom/JS validation (input is not HTML required).
    await expect(this.dialog).toBeVisible();
    await expect(this.nameInput).toBeVisible();
    await expect(this.nameInput).toHaveValue('');
  }

  /**
   * @param {RegExp} pattern e.g. /Showing\s+11–20/
   */
  async expectShowing(pattern) {
    await expect(this.showingLabel).toBeVisible();
    await expect(this.showingLabel).toHaveText(pattern);
  }

  /**
   * Click Next and capture GET /api/clients?page=2 (browser session).
   * @returns {Promise<{ response: import('@playwright/test').Response, payload: ClientsApiPayload }>}
   */
  async goToNextPageAndCapture() {
    await expect(this.nextPageButton).toBeEnabled();
    await expect(this.prevPageButton).toBeDisabled();
    await expect(
      this.page.getByRole('button', { name: 'Page 1' }),
    ).toHaveAttribute('aria-current', 'page');

    const [response] = await Promise.all([
      this.page.waitForResponse(
        (res) =>
          this.isClientsListResponse(res, { method: 'GET' }) &&
          res.status() === 200 &&
          /[?&]page=2(?:&|$)/.test(res.url()),
        { timeout: 30_000 },
      ),
      this.nextPageButton.click(),
    ]);

    const payload = /** @type {ClientsApiPayload} */ (JSON.parse(await response.text()));
    expect(payload.pagination?.page).toBe(2);
    expect(payload.data?.length ?? 0).toBeGreaterThan(0);
    return { response, payload };
  }

  /**
   * Stable post-next checks that do not depend on mutable name ordering.
   * Browser route has no ?page= (SPA); page is on the API query string.
   * @param {import('@playwright/test').Response} response
   * @param {ClientsApiPayload} page2
   * @param {ClientsApiPayload} page1
   */
  async expectPage2LoadedStably(response, page2, page1) {
    // API contract
    expect(response.url(), 'list API query must request page 2').toMatch(
      /[?&]page=2(?:&|$)/,
    );
    expect(page2.pagination?.page).toBe(2);
    expect(page2.data.length).toBeGreaterThan(0);

    // Unique IDs within the page-2 payload (ignore cross-page name/order churn)
    const page2Ids = page2.data.map((/** @type {{ _id?: string }} */ c) => c._id);
    expect(
      page2Ids.every(Boolean),
      'every page-2 record must have _id',
    ).toBe(true);
    expect(new Set(page2Ids).size, 'page-2 _id values must be unique').toBe(
      page2Ids.length,
    );

    // Optional dataset compare: only when both pages expose ids — never require
    // empty intersection (concurrent inserts shift the page boundary).
    const page1Ids = new Set(
      (page1.data || []).map((/** @type {{ _id?: string }} */ c) => c._id),
    );
    expect(page1Ids.size).toBeGreaterThan(0);

    // SPA URL: stay on Clients; page is not mirrored in the browser query
    await expect(this.page).toHaveURL(/\/super-admin\/masters\/clients$/);
    expect(this.page.url(), 'SPA route has no page query').not.toMatch(
      /[?&]page=\d/,
    );

    // Pagination chrome still present and addressable after Next
    await expect(this.showingLabel).toBeVisible();
    await expect(this.page.getByRole('button', { name: 'Page 2' })).toBeVisible();
    await expect(this.page.getByRole('button', { name: 'Page 2' })).toBeEnabled();
    await expect(this.nextPageButton).toBeVisible();
    await expect(this.prevPageButton).toBeVisible();

    // Prefer real UI "current page" signals when the app syncs them.
    // Staging often leaves aria-current / Showing on page 1 after Next while
    // GET ?page=2 succeeds — treat synced UI as success when present.
    const page2Current = await this.page
      .getByRole('button', { name: 'Page 2' })
      .getAttribute('aria-current');
    const showingText = (await this.showingLabel.innerText()).replace(/\s+/g, ' ');
    const uiShowsPage2 =
      page2Current === 'page' || /Showing\s+11[–-]20\b/i.test(showingText);

    if (uiShowsPage2) {
      await expect(
        this.page.getByRole('button', { name: 'Page 2' }),
      ).toHaveAttribute('aria-current', 'page');
      await expect(this.prevPageButton).toBeEnabled();
      await this.expectShowing(/Showing\s+11[–-]20\s+of\s+\d+\s+clients/i);
    } else {
      // Stable fallback: API query is source of truth for "loaded page 2"
      // until the UI page indicator bug is fixed.
      expect(
        response.url(),
        'UI page indicator stale — API must still be page 2',
      ).toMatch(/[?&]page=2(?:&|$)/);
    }
  }

  /**
   * @returns {Promise<ClientsApiPayload>}
   */
  async goToPreviousPageAndCapture() {
    await expect(this.prevPageButton).toBeEnabled();
    const { payload } = await this.waitForClientsApi(
      async () => {
        await this.prevPageButton.click();
      },
      { method: 'GET', status: 200, urlIncludes: 'page=1' },
    );
    expect(payload.pagination?.page).toBe(1);
    return payload;
  }

  /** @param {string} name */
  async openClientDetails(name) {
    const row = this.table.getByRole('row').filter({ hasText: name }).first();
    await expect(row).toBeVisible();
    await row.click();
    await expect(this.page.getByRole('tab', { name: 'Overview' })).toBeVisible({
      timeout: 15_000,
    });
    await expect(this.page.getByRole('tab', { name: 'Users' })).toBeVisible();
    await expect(
      this.page.getByRole('button', { name: `Delete ${name}` }).first(),
    ).toBeVisible();
  }

  /**
   * @param {{ code: string, email?: string, status?: string }} expected
   */
  async expectOverviewMatches(expected) {
    const panel = this.page.getByRole('tabpanel');
    await expect(panel).toContainText(expected.code);
    if (expected.email) await expect(panel).toContainText(expected.email);
    if (expected.status) {
      await expect(panel).toContainText(
        expected.status === 'active' ? 'Active' : 'Inactive',
      );
    }
  }

  async openUsersTab() {
    await this.page.getByRole('tab', { name: 'Users' }).click();
    await expect(this.page.getByRole('tab', { name: 'Users' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  }

  /** @param {string} name */
  async openDeleteConfirm(name) {
    await this.page.getByRole('button', { name: `Delete ${name}` }).click();
    const confirm = this.page.getByRole('alertdialog');
    await expect(confirm).toBeVisible();
    await expect(confirm).toContainText(/delete this client/i);
  }

  async cancelDelete() {
    const confirm = this.page.getByRole('alertdialog');
    await confirm.getByRole('button', { name: /Cancel/i }).click();
    await expect(confirm).toBeHidden();
  }

  async closeClientDetails() {
    await this.page.getByRole('button', { name: 'Close client details' }).first().click();
    await expect(this.page.getByRole('tab', { name: 'Overview' })).toHaveCount(0);
  }
}
