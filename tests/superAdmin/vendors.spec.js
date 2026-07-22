// @ts-check
/**
 * tests/superAdmin/vendors.spec.js
 * Super Admin — Vendors (JIT Super Admin.xlsx / Vendors sheet)
 * Reuses LoginPage via auth.fixture — no duplicated login.
 */
import { test, expect } from '../../fixtures/auth.fixture.js';
import { VendorsPage } from '../../pages/superAdmin/VendorsPage.js';
import { users } from '../../test-data/users.js';
import { knownVendor } from '../../test-data/superAdmin/masters.js';
import { uniqueName, uniqueEmail } from '../../utils/uniqueData.js';

test.describe('Super Admin — Vendors', () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs(users.superAdmin);
  });

  test('SA_VEN page loads with search and Add Vendor', async ({ page }) => {
    const vendors = new VendorsPage(page);
    await vendors.goto();
    await vendors.expectLoaded();
  });

  test('SA_VEN_001 Search by Vendor Name', async ({ page }) => {
    const vendors = new VendorsPage(page);
    await vendors.goto();
    await vendors.search(knownVendor.name);
    await vendors.expectRowContaining(knownVendor.name);
  });

  test('SA_VEN_002 Search by Vendor Code', async ({ page }) => {
    const vendors = new VendorsPage(page);
    await vendors.goto();
    await vendors.search(knownVendor.code);
    await vendors.expectRowContaining(knownVendor.code);
  });

  test('SA_VEN_003 Search with invalid keyword shows no matches', async ({
    page,
  }) => {
    const vendors = new VendorsPage(page);
    await vendors.goto();
    await vendors.search('XYZ123NOMATCH999');
    await vendors.expectNoResults();
  });

  test('SA_VEN_004 Status dropdown shows All Statuses, Active, Inactive', async ({
    page,
  }) => {
    const vendors = new VendorsPage(page);
    await vendors.goto();
    await vendors.openStatusFilter();
    await expect(page.getByRole('option', { name: 'All Statuses' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Active', exact: true })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Inactive', exact: true })).toBeVisible();
  });

  test('SA_VEN_005 Filter by Active', async ({ page }) => {
    const vendors = new VendorsPage(page);
    await vendors.goto();
    await vendors.selectStatus('Active');
    await vendors.expectRowContaining('Active');
  });

  test('SA_VEN_007 Add Vendor opens popup', async ({ page }) => {
    const vendors = new VendorsPage(page);
    await vendors.goto();
    await vendors.openAddVendor();
  });

  test('SA_VEN_008 Vendor list columns are displayed', async ({ page }) => {
    const vendors = new VendorsPage(page);
    await vendors.goto();
    await vendors.expectListColumns();
  });

  test('SA_VEN_009 Vendor Name is mandatory', async ({ page }) => {
    const vendors = new VendorsPage(page);
    await vendors.goto();
    await vendors.openAddVendor();
    await vendors.submitAddVendor();
    // HTML5 or app validation — name field should still be in an invalid/required state
    await expect(vendors.dialog).toBeVisible();
    await expect(vendors.nameInput).toBeVisible();
  });

  test('SA_VEN_011 Vendor Code is auto-generated (disabled)', async ({ page }) => {
    const vendors = new VendorsPage(page);
    await vendors.goto();
    await vendors.openAddVendor();
    await expect(vendors.codeInput).toBeDisabled();
  });

  test('SA_VEN_014 Invalid Contact Email is rejected', async ({ page }) => {
    const vendors = new VendorsPage(page);
    await vendors.goto();
    await vendors.openAddVendor();
    await vendors.fillVendorForm({
      name: uniqueName('Auto Vendor'),
      email: 'vendor@test',
    });
    await vendors.submitAddVendor();
    await expect(vendors.dialog).toBeVisible();
  });

  test('SA_VEN_020 Cancel closes Add Vendor without saving', async ({ page }) => {
    const vendors = new VendorsPage(page);
    await vendors.goto();
    await vendors.openAddVendor();
    await vendors.nameInput.fill(uniqueName('Cancel Vendor'));
    await vendors.cancelAddVendor();
  });

  test('SA_VEN_019 + SA_VEN_021 Create vendor and find in list', async ({
    page,
  }) => {
    const vendors = new VendorsPage(page);
    const name = uniqueName('Auto Vendor');
    const email = uniqueEmail('vendor');

    await vendors.goto();
    await vendors.openAddVendor();
    await vendors.fillVendorForm({
      name,
      email,
      phone: '9876543210',
      address: 'Pune',
      notes: 'Created by automation',
    });
    await vendors.submitAddVendor();
    await expect(vendors.dialog).toBeHidden({ timeout: 15_000 });

    await vendors.search(name);
    await vendors.expectRowContaining(name);
  });
});

test.describe('Super Admin — Vendors security', () => {
  test('SA_VEN_022 Unauthorized role cannot access Vendors', async ({
    page,
    loginAs,
  }) => {
    await loginAs(users.projectManager);
    await page.goto('/super-admin/masters/vendors');
    await expect(page).not.toHaveURL(/\/super-admin\/masters\/vendors/);
  });
});
