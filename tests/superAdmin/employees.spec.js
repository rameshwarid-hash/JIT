// @ts-check
/**
 * tests/superAdmin/employees.spec.js
 * Super Admin — Employees (JIT Super Admin.xlsx / Employee sheet)
 */
import { test, expect } from '../../fixtures/auth.fixture.js';
import { EmployeesPage } from '../../pages/superAdmin/EmployeesPage.js';
import { users } from '../../test-data/users.js';
import { knownEmployee } from '../../test-data/superAdmin/masters.js';
import { uniqueEmail, uniqueSuffix } from '../../utils/uniqueData.js';

test.describe('Super Admin — Employees', () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs(users.superAdmin);
  });

  test('SA_EMP page loads with search and Add Employee', async ({ page }) => {
    const employees = new EmployeesPage(page);
    await employees.goto();
    await employees.expectLoaded();
  });

  test('SA_EMP_001 Search by Employee Name', async ({ page }) => {
    const employees = new EmployeesPage(page);
    await employees.goto();
    await employees.search(knownEmployee.name);
    await employees.expectRowContaining(knownEmployee.name);
  });

  test('SA_EMP_002 Search by Employee Code', async ({ page }) => {
    const employees = new EmployeesPage(page);
    await employees.goto();
    await employees.search(knownEmployee.code);
    await employees.expectRowContaining(knownEmployee.code);
  });

  test('SA_EMP_003 Search by Email', async ({ page }) => {
    const employees = new EmployeesPage(page);
    await employees.goto();
    await employees.search(knownEmployee.email);
    await employees.expectRowContaining(knownEmployee.email);
  });

  test('SA_EMP_004 Search with invalid keyword shows no matches', async ({
    page,
  }) => {
    const employees = new EmployeesPage(page);
    await employees.goto();
    await employees.search('XYZ123NOMATCH999');
    await employees.expectNoResults();
  });

  test('SA_EMP_005 Role dropdown values', async ({ page }) => {
    const employees = new EmployeesPage(page);
    await employees.goto();
    await employees.openRoleFilter();
    await expect(page.getByRole('option', { name: /All Roles/i })).toBeVisible();
    await expect(
      page.getByRole('option', { name: /Field Resource/i }),
    ).toBeVisible();
    await expect(
      page.getByRole('option', { name: /Project Manager/i }),
    ).toBeVisible();
  });

  test('SA_EMP_006 Filter by Field Resource', async ({ page }) => {
    const employees = new EmployeesPage(page);
    await employees.goto();
    await employees.selectRole('Field Resource');
    await employees.expectRowContaining('Field Resource');
  });

  test('SA_EMP_007 Filter by Project Manager', async ({ page }) => {
    const employees = new EmployeesPage(page);
    await employees.goto();
    await employees.selectRole('Project Manager');
    await employees.expectRowContaining('Project Manager');
  });

  test('SA_EMP_009 Add Employee opens popup', async ({ page }) => {
    const employees = new EmployeesPage(page);
    await employees.goto();
    await employees.openAddEmployee();
  });

  test('SA_EMP_010 Employee list columns are displayed', async ({ page }) => {
    const employees = new EmployeesPage(page);
    await employees.goto();
    await employees.expectListColumns();
  });

  test('SA_EMP_017 Pagination info is visible', async ({ page }) => {
    const employees = new EmployeesPage(page);
    await employees.goto();
    await expect(employees.main.getByText(/Showing/i)).toBeVisible();
  });

  test('SA_EMP_020 First Name is mandatory', async ({ page }) => {
    const employees = new EmployeesPage(page);
    await employees.goto();
    await employees.openAddEmployee();
    await employees.submitAddEmployee();
    await expect(employees.dialog).toBeVisible();
  });

  test('SA_EMP_024 Invalid Email format is rejected', async ({ page }) => {
    const employees = new EmployeesPage(page);
    await employees.goto();
    await employees.openAddEmployee();
    await employees.fillEmployeeForm({
      firstName: 'Auto',
      lastName: 'User',
      email: 'bad-email',
      password: 'Password123!',
    });
    await employees.submitAddEmployee();
    await expect(employees.dialog).toBeVisible();
  });

  test('SA_EMP_034 Add Gate Pass control is visible', async ({ page }) => {
    const employees = new EmployeesPage(page);
    await employees.goto();
    await employees.openAddEmployee();
    await expect(employees.addGatePassButton).toBeVisible();
  });

  test('SA_EMP_036 Cancel closes Add Employee without saving', async ({
    page,
  }) => {
    const employees = new EmployeesPage(page);
    await employees.goto();
    await employees.openAddEmployee();
    await employees.firstNameInput.fill('Cancel');
    await employees.cancelAddEmployee();
  });

  test('SA_EMP_035 + SA_EMP_037 Create employee and find in list', async ({
    page,
  }) => {
    const employees = new EmployeesPage(page);
    const suffix = uniqueSuffix();
    const firstName = `Auto${suffix}`;
    const lastName = 'Employee';
    const email = uniqueEmail('emp');

    await employees.goto();
    await employees.openAddEmployee();
    await employees.fillEmployeeForm({
      firstName,
      lastName,
      email,
      password: 'Password123!',
      phone: '9876543210',
    });
    await employees.submitAddEmployee();
    await expect(employees.dialog).toBeHidden({ timeout: 15_000 });

    await employees.search(email);
    await employees.expectRowContaining(email);
  });
});

test.describe('Super Admin — Employees security', () => {
  test('SA_EMP_019 Unauthorized role cannot access Employees', async ({
    page,
    loginAs,
  }) => {
    await loginAs(users.fieldResource);
    await page.goto('/super-admin/masters/employees');
    await expect(page).not.toHaveURL(/\/super-admin\/masters\/employees/);
  });
});
