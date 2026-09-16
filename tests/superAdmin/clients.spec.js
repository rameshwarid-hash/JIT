// @ts-check
/**
 * tests/superAdmin/clients.spec.js
 * Super Admin — Clients (JIT Super Admin.xlsx / Client sheet)
 *
 * High-priority coverage: list/search/filter API↔UI, pagination, create CRUD,
 * details overview, delete-cancel, RBAC. Sort is not offered by the UI/API.
 */
import { test, expect } from '../../fixtures/auth.fixture.js';
import { ClientsPage } from '../../pages/superAdmin/ClientsPage.js';
import { users } from '../../test-data/users.js';
import { knownClient } from '../../test-data/superAdmin/masters.js';
import { uniqueName, uniqueEmail } from '../../utils/uniqueData.js';

test.describe('Super Admin — Clients', () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs(users.superAdmin);
  });

  test('SA_CL page loads with search, Add Client, and list API', async ({ page }) => {
    const clients = new ClientsPage(page);
    const list = await clients.gotoAndLoadList();
    expect(list.pagination?.total).toBeGreaterThan(0);
    await clients.expectTableMatchesListApi(list);
  });

  test('SA_CL_001 Search by Client Name (UI + API)', async ({ page }) => {
    const clients = new ClientsPage(page);
    await clients.goto();
    const payload = await clients.searchAndCapture(knownClient.name);
    expect(payload.pagination?.total).toBeGreaterThan(0);
    expect(payload.data.some((/** @type {{ name: string }} */ c) => c.name === knownClient.name)).toBe(
      true,
    );
    await clients.expectRowData(knownClient.name, [knownClient.code, 'Active']);
  });

  test('SA_CL_002 Search by Client Code (UI + API)', async ({ page }) => {
    const clients = new ClientsPage(page);
    await clients.goto();
    const payload = await clients.searchAndCapture(knownClient.code);
    expect(
      payload.data.some((/** @type {{ code: string }} */ c) => c.code === knownClient.code),
    ).toBe(true);
    await clients.expectRowContaining(knownClient.code);
    await clients.expectRowContaining(knownClient.name);
  });

  test('SA_CL_003 Search with invalid value shows no matches', async ({
    page,
  }) => {
    const clients = new ClientsPage(page);
    await clients.goto();
    const payload = await clients.searchAndCapture('XYZ123NOMATCH999');
    expect(payload.data).toEqual([]);
    expect(payload.pagination?.total ?? 0).toBe(0);
    await clients.expectNoResults();
  });

  test('SA_CL_004 Status dropdown values', async ({ page }) => {
    const clients = new ClientsPage(page);
    await clients.goto();
    await clients.openStatusFilter();
    await expect(page.getByRole('option', { name: 'All Statuses' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Active', exact: true })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Inactive', exact: true })).toBeVisible();
  });

  test('SA_CL_005 Filter by Active (API status=active + row statuses)', async ({
    page,
  }) => {
    const clients = new ClientsPage(page);
    await clients.goto();
    const payload = await clients.selectStatusAndCapture('Active');
    expect(payload.data.length).toBeGreaterThan(0);
    expect(
      payload.data.every((/** @type {{ status: string }} */ c) => c.status === 'active'),
    ).toBe(true);
    await clients.expectAllVisibleStatuses('Active');
  });

  test('SA_CL_006 Filter by Inactive (API + empty or inactive-only rows)', async ({
    page,
  }) => {
    const clients = new ClientsPage(page);
    await clients.goto();
    const payload = await clients.selectStatusAndCapture('Inactive');
    expect(
      payload.data.every((/** @type {{ status: string }} */ c) => c.status === 'inactive'),
    ).toBe(true);

    if ((payload.pagination?.total ?? 0) === 0) {
      await clients.expectNoResults();
    } else {
      await clients.expectAllVisibleStatuses('Inactive');
    }
  });

  test('SA_CL_007 Add Client opens popup', async ({ page }) => {
    const clients = new ClientsPage(page);
    await clients.goto();
    await clients.openAddClient();
    await expect(clients.nameInput).toBeVisible();
    await expect(clients.submitButton).toBeVisible();
  });

  test('SA_CL_008 Client list columns are displayed', async ({ page }) => {
    const clients = new ClientsPage(page);
    await clients.goto();
    await clients.expectListColumns();
  });

  test('SA_CL_009 Pagination next loads page 2', async ({ page }) => {
    const clients = new ClientsPage(page);
    const page1 = await clients.gotoAndLoadList();
    test.skip(
      (page1.pagination?.totalPages ?? 0) < 2,
      'Need ≥2 pages of clients to validate pagination',
    );

    const { response, payload: page2 } = await clients.goToNextPageAndCapture();
    await clients.expectPage2LoadedStably(response, page2, page1);
  });

  test('SA_CL_010 + SA_CL_011 Open client details Overview matches seed data', async ({
    page,
  }) => {
    const clients = new ClientsPage(page);
    await clients.goto();
    await clients.searchAndCapture(knownClient.code);
    await clients.openClientDetails(knownClient.name);
    await clients.expectOverviewMatches({
      code: knownClient.code,
      email: 'iq@clients.example.com',
      status: 'active',
    });
  });

  test('SA_CL_012 Users tab is selectable from client details', async ({ page }) => {
    const clients = new ClientsPage(page);
    await clients.goto();
    await clients.searchAndCapture(knownClient.code);
    await clients.openClientDetails(knownClient.name);
    await clients.openUsersTab();
  });

  test('SA_CL_015 + SA_CL_016 Delete confirmation Cancel keeps client', async ({
    page,
  }) => {
    const clients = new ClientsPage(page);
    const name = uniqueName('Auto Client DelCancel');
    const email = uniqueEmail('client');

    await clients.goto();
    await clients.openAddClient();
    await clients.fillClientForm({ name, email, phone: '9876543210' });
    const created = await clients.submitAddClientAndCapture();

    await clients.searchAndCapture(name);
    await clients.openClientDetails(name);

    let deleteCalled = false;
    const onResponse = (/** @type {import('@playwright/test').Response} */ res) => {
      if (
        res.request().method() === 'DELETE' &&
        res.url().includes('/api/clients/')
      ) {
        deleteCalled = true;
      }
    };
    page.on('response', onResponse);
    try {
      await clients.openDeleteConfirm(name);
      await clients.cancelDelete();
      expect(deleteCalled, 'Cancel must not call DELETE /api/clients/:id').toBe(false);
    } finally {
      page.off('response', onResponse);
    }

    // Fresh navigation avoids a no-op search when the box already holds `name`
    await clients.goto();
    const stillThere = await clients.searchAndCapture(name);
    expect(
      stillThere.data.some(
        (/** @type {{ _id: string }} */ c) => c._id === created.data._id,
      ),
    ).toBe(true);
  });

  test('SA_CL_019 Close details panel returns to list chrome', async ({ page }) => {
    const clients = new ClientsPage(page);
    await clients.goto();
    await clients.searchAndCapture(knownClient.code);
    await clients.openClientDetails(knownClient.name);
    await clients.closeClientDetails();
    await expect(clients.addClientButton).toBeVisible();
    await expect(clients.pageTitle).toBeVisible();
  });

  test('SA_CL_023 Client Name is mandatory — dialog stays open', async ({ page }) => {
    const clients = new ClientsPage(page);
    await clients.goto();
    await clients.openAddClient();

    let postSeen = false;
    const onResponse = (/** @type {import('@playwright/test').Response} */ res) => {
      if (
        res.request().method() === 'POST' &&
        new URL(res.url()).pathname.replace(/\/$/, '') === '/api/clients'
      ) {
        postSeen = true;
      }
    };
    page.on('response', onResponse);
    try {
      await clients.submitAddClient();
      await clients.expectNameRequired();
      expect(postSeen, 'empty name must not POST /api/clients').toBe(false);
    } finally {
      page.off('response', onResponse);
    }
  });

  test('SA_CL_025 Client Code is auto-generated', async ({ page }) => {
    const clients = new ClientsPage(page);
    await clients.goto();
    await clients.openAddClient();
    await expect(clients.codeInput).toBeDisabled();
  });

  test('SA_CL_028 Invalid Contact Email is rejected', async ({ page }) => {
    const clients = new ClientsPage(page);
    await clients.goto();
    await clients.openAddClient();
    await clients.fillClientForm({
      name: uniqueName('Auto Client'),
      email: 'not-an-email',
    });

    let postSeen = false;
    const onResponse = (/** @type {import('@playwright/test').Response} */ res) => {
      if (
        res.request().method() === 'POST' &&
        new URL(res.url()).pathname.replace(/\/$/, '') === '/api/clients'
      ) {
        postSeen = true;
      }
    };
    page.on('response', onResponse);
    try {
      await clients.submitAddClient();
      await expect(clients.dialog).toBeVisible();
      expect(postSeen, 'invalid email must not POST /api/clients').toBe(false);
    } finally {
      page.off('response', onResponse);
    }
  });

  test('SA_CL_034 Cancel closes Add Client without saving', async ({ page }) => {
    const clients = new ClientsPage(page);
    const name = uniqueName('Cancel Client');
    await clients.goto();
    await clients.openAddClient();
    await clients.nameInput.fill(name);
    await clients.cancelAddClient();

    const payload = await clients.searchAndCapture(name);
    expect(payload.data).toEqual([]);
    await clients.expectNoResults();
  });

  test('SA_CL_033 + SA_CL_035 Create client via API and appear in list', async ({
    page,
  }) => {
    const clients = new ClientsPage(page);
    const name = uniqueName('Auto Client');
    const email = uniqueEmail('client');

    await clients.goto();
    await clients.openAddClient();
    await clients.fillClientForm({
      name,
      email,
      phone: '9876543210',
      address: 'Mumbai',
      notes: 'Created by automation',
    });
    const created = await clients.submitAddClientAndCapture();
    expect(created.data.name).toBe(name);
    expect(created.data.contactEmail).toBe(email);
    expect(created.data.status).toBe('active');

    const list = await clients.searchAndCapture(name);
    expect(list.data.some((/** @type {{ _id: string }} */ c) => c._id === created.data._id)).toBe(
      true,
    );
    await clients.expectRowData(name, [created.data.code, email, 'Active']);
  });
});

test.describe('Super Admin — Clients security', () => {
  test('SA_CL_021 Project Manager cannot access Clients', async ({
    page,
    loginAs,
  }) => {
    await loginAs(users.projectManager);
    await page.goto('/super-admin/masters/clients');
    await expect(page).not.toHaveURL(/\/super-admin\/masters\/clients/);
    await expect(page).toHaveURL(/\/project-manager\//);
  });

  test('SA_CL_021b Field Resource cannot access Clients', async ({
    page,
    loginAs,
  }) => {
    await loginAs(users.fieldResource);
    await page.goto('/super-admin/masters/clients');
    await expect(page).not.toHaveURL(/\/super-admin\/masters\/clients/);
    await expect(page).toHaveURL(/\/field-resource\//);
  });
});

/**
 * Not automated / known gaps:
 * - Column sort: no aria-sort and no sort query on GET /api/clients
 * - SA_CL_017/018 destructive delete of linked clients (unstable dependencies)
 * - SA_CL_030 invalid phone: API accepts alphabetic phones (product gap)
 * - Duplicate client names: API returns 201 for duplicate "Internal QA"
 * - SA_CL_009: Next loads page 2 via API query; SPA has no ?page=. UI
 *   aria-current / Showing often stay on page 1 (product desync) — test uses
 *   API page=2 + unique _ids as the stable contract, and stronger UI checks
 *   when the indicator does sync.
 */
