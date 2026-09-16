// @ts-check
/**
 * tests/e2e/e2e-009-rbac.spec.js
 * -----------------------------
 * E2E_009 — Role-based access: unauthorized Super Admin routes blocked for PM/FR.
 */
import { test, expect } from '../../fixtures/auth.fixture.js';
import { users } from '../../test-data/users.js';
import { expectUnauthorizedRedirect } from '../../utils/e2eWorkflow.js';

test.describe('E2E_009 Role-based permissions', () => {
  test('E2E_009 Super Admin can open masters Clients', async ({ page, loginAs }) => {
    await loginAs(users.superAdmin);
    await page.goto('/super-admin/masters/clients');
    await expect(page).toHaveURL(/\/super-admin\/masters\/clients/);
    await expect(
      page.getByRole('heading', { name: 'Clients', level: 1 }),
    ).toBeVisible();
  });

  test('E2E_009 Project Manager cannot access Super Admin Clients', async ({
    page,
    loginAs,
  }) => {
    await loginAs(users.projectManager);
    await expectUnauthorizedRedirect(
      page,
      '/super-admin/masters/clients',
      /\/super-admin\/masters\/clients/,
    );
    await expect(page).toHaveURL(/\/project-manager\//);
  });

  test('E2E_009 Field Resource cannot access Super Admin Clients', async ({
    page,
    loginAs,
  }) => {
    await loginAs(users.fieldResource);
    await expectUnauthorizedRedirect(
      page,
      '/super-admin/masters/clients',
      /\/super-admin\/masters\/clients/,
    );
    await expect(page).toHaveURL(/\/field-resource\//);
  });

  test('E2E_009 Field Resource cannot access Project Manager My Team', async ({
    page,
    loginAs,
  }) => {
    await loginAs(users.fieldResource);
    await page.goto('/project-manager/my-team');
    await expect(page).not.toHaveURL(/\/project-manager\/my-team/);
  });

  test('E2E_009 Project Manager cannot access Create Project (SA)', async ({
    page,
    loginAs,
  }) => {
    await loginAs(users.projectManager);
    await page.goto('/super-admin/projects/create');
    await expect(page).not.toHaveURL(/\/super-admin\/projects\/create/);
  });
});
