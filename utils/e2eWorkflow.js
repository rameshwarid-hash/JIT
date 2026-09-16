// @ts-check
/**
 * utils/e2eWorkflow.js
 * --------------------
 * Reusable Super Admin setup steps for E2E business workflows.
 * Uses existing Page Objects — does not re-declare locators.
 */
import { expect } from '@playwright/test';
import { ClientsPage } from '../pages/superAdmin/ClientsPage.js';
import { VendorsPage } from '../pages/superAdmin/VendorsPage.js';
import { EmployeesPage } from '../pages/superAdmin/EmployeesPage.js';
import { CreateProjectPage } from '../pages/superAdmin/CreateProjectPage.js';
import { ProjectsPage } from '../pages/superAdmin/ProjectsPage.js';
import { uniqueEmail, uniqueName, uniqueSuffix } from './uniqueData.js';
import { E2E_PASSWORD, saveE2eState } from './e2eState.js';

/**
 * @param {import('@playwright/test').Page} page
 * @param {{ projectPrefix?: string }} [opts]
 */
export async function saCreateMastersAndPublishProject(page, opts = {}) {
  const suffix = uniqueSuffix();
  const clientName = uniqueName('E2E Client');
  const vendorName = uniqueName('E2E Vendor');
  const pm = {
    firstName: 'E2E',
    lastName: `PM${suffix.split('-')[1] || '1'}`,
    email: uniqueEmail('e2e.pm'),
    password: E2E_PASSWORD,
    get displayName() {
      return `${this.firstName} ${this.lastName}`;
    },
  };
  const fr = {
    firstName: 'E2E',
    lastName: `FR${suffix.split('-')[1] || '1'}`,
    email: uniqueEmail('e2e.fr'),
    password: E2E_PASSWORD,
    get displayName() {
      return `${this.firstName} ${this.lastName}`;
    },
  };
  const project = {
    name: uniqueName(opts.projectPrefix || 'E2E Project'),
    code: `E2E-${uniqueSuffix()}`.slice(0, 24),
  };

  const clients = new ClientsPage(page);
  await clients.goto();
  await clients.createClient({
    name: clientName,
    email: uniqueEmail('e2e.client'),
    phone: '9876543210',
  });
  await clients.search(clientName);
  await clients.expectRowContaining(clientName);

  const vendors = new VendorsPage(page);
  await vendors.goto();
  await vendors.createVendor({
    name: vendorName,
    email: uniqueEmail('e2e.vendor'),
    phone: '9876543210',
  });
  await vendors.search(vendorName);
  await vendors.expectRowContaining(vendorName);

  const employees = new EmployeesPage(page);
  await employees.goto();
  await employees.createEmployee({
    firstName: pm.firstName,
    lastName: pm.lastName,
    email: pm.email,
    password: pm.password,
    role: 'Project Manager',
    phone: '9876543210',
  });
  await employees.search(pm.email);
  await employees.expectRowContaining(pm.email);

  await employees.createEmployee({
    firstName: fr.firstName,
    lastName: fr.lastName,
    email: fr.email,
    password: fr.password,
    role: 'Field Resource',
    phone: '9876543211',
  });
  await employees.search(fr.email);
  await employees.expectRowContaining(fr.email);

  const create = new CreateProjectPage(page);
  await create.goto();
  await create.expectLoaded();
  await create.fillBasicFields({
    name: project.name,
    code: project.code,
    description: 'E2E automation project',
    location: 'Pune',
    notes: 'Created by E2E workflow',
  });
  await create.selectClient(clientName);
  await create.selectVendor(vendorName);
  await create.assignProjectManager(pm.displayName);
  await create.assignFieldResource(fr.displayName);
  await create.publishProject();

  const projects = new ProjectsPage(page);
  await projects.goto();
  await projects.search(project.name);
  await projects.expectRowContaining(project.name);
  await projects.expectRowContaining(project.code);

  const state = {
    clientName,
    vendorName,
    pm: {
      firstName: pm.firstName,
      lastName: pm.lastName,
      email: pm.email,
      password: pm.password,
      displayName: pm.displayName,
    },
    fr: {
      firstName: fr.firstName,
      lastName: fr.lastName,
      email: fr.email,
      password: fr.password,
      displayName: fr.displayName,
    },
    project,
    updatedAt: new Date().toISOString(),
  };
  saveE2eState(state);
  return state;
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {string} path
 * @param {RegExp} forbiddenUrl
 */
export async function expectUnauthorizedRedirect(page, path, forbiddenUrl) {
  await page.goto(path);
  await expect(page).not.toHaveURL(forbiddenUrl);
}
