// @ts-check
/**
 * tests/superAdmin/clients.spec.js
 * Super Admin — Clients (JIT Super Admin.xlsx / Client sheet)
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

  test('SA_CL page loads with search and Add Client', async ({ page }) => {
    const clients = new ClientsPage(page);
    await clients.goto();
    await clients.expectLoaded();
  });

  test('SA_CL_001 Search by Client Name', async ({ page }) => {
    const clients = new ClientsPage(page);
    await clients.goto();
    await clients.search(knownClient.name);
    await clients.expectRowContaining(knownClient.name);
  });

  test('SA_CL_002 Search by Client Code', async ({ page }) => {
    const clients = new ClientsPage(page);
    await clients.goto();
    await clients.search(knownClient.code);
    await clients.expectRowContaining(knownClient.code);
  });

  test('SA_CL_003 Search with invalid value shows no matches', async ({
    page,
  }) => {
    const clients = new ClientsPage(page);
    await clients.goto();
    await clients.search('XYZ123NOMATCH999');
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

  test('SA_CL_005 Filter by Active', async ({ page }) => {
    const clients = new ClientsPage(page);
    await clients.goto();
    await clients.selectStatus('Active');
    await clients.expectRowContaining('Active');
  });

  test('SA_CL_007 Add Client opens popup', async ({ page }) => {
    const clients = new ClientsPage(page);
    await clients.goto();
    await clients.openAddClient();
  });

  test('SA_CL_008 Client list columns are displayed', async ({ page }) => {
    const clients = new ClientsPage(page);
    await clients.goto();
    await clients.expectListColumns();
  });

  test('SA_CL_009 Pagination controls are visible when many clients exist', async ({
    page,
  }) => {
    const clients = new ClientsPage(page);
    await clients.goto();
    await expect(clients.main.getByText(/Showing/i)).toBeVisible();
  });

  test('SA_CL_023 Client Name is mandatory', async ({ page }) => {
    const clients = new ClientsPage(page);
    await clients.goto();
    await clients.openAddClient();
    await clients.submitAddClient();
    await expect(clients.dialog).toBeVisible();
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
      email: 'client@test',
    });
    await clients.submitAddClient();
    await expect(clients.dialog).toBeVisible();
  });

  test('SA_CL_034 Cancel closes Add Client without saving', async ({ page }) => {
    const clients = new ClientsPage(page);
    await clients.goto();
    await clients.openAddClient();
    await clients.nameInput.fill(uniqueName('Cancel Client'));
    await clients.cancelAddClient();
  });

  test('SA_CL_033 + SA_CL_035 Create client and find in list', async ({
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
    await clients.submitAddClient();
    await expect(clients.dialog).toBeHidden({ timeout: 15_000 });

    await clients.search(name);
    await clients.expectRowContaining(name);
  });
});

test.describe('Super Admin — Clients security', () => {
  test('SA_CL_021 Unauthorized role cannot access Clients', async ({
    page,
    loginAs,
  }) => {
    await loginAs(users.projectManager);
    await page.goto('/super-admin/masters/clients');
    await expect(page).not.toHaveURL(/\/super-admin\/masters\/clients/);
  });
});
