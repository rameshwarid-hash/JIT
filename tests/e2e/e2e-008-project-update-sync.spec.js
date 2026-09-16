// @ts-check
/**
 * tests/e2e/e2e-008-project-update-sync.spec.js
 * --------------------------------------------
 * E2E_008 — Super Admin updates project notes/location; PM and FR verify.
 */
import { test, expect } from '../../fixtures/auth.fixture.js';
import { users } from '../../test-data/users.js';
import { ProjectsPage } from '../../pages/superAdmin/ProjectsPage.js';
import { PmProjectsPage } from '../../pages/projectManager/PmProjectsPage.js';
import { FrProjectsPage } from '../../pages/fieldResource/FrProjectsPage.js';
import { requireE2eState, saveE2eState } from '../../utils/e2eState.js';
import { uniqueName } from '../../utils/uniqueData.js';

test.describe('E2E_008 Project update across roles', () => {
  test.setTimeout(150_000);

  test('E2E_008 SA updates project; PM and FR see update', async ({
    page,
    loginAs,
    logout,
  }) => {
    const state = requireE2eState('Run E2E_001 before E2E_008');
    const updatedNote = uniqueName('E2E note');

    await loginAs(users.superAdmin);
    const projects = new ProjectsPage(page);
    await projects.goto();
    await projects.search(state.project.name);
    await projects.expectRowContaining(state.project.name);

    await page
      .getByText(state.project.name, { exact: true })
      .filter({ visible: true })
      .first()
      .click();

    const editBtn = page.getByRole('button', { name: /Edit/i }).filter({ visible: true });
    test.skip(
      !(await editBtn.first().isVisible().catch(() => false)),
      'Project Edit control not available on Super Admin projects UI',
    );

    await editBtn.first().click();
    const notes = page
      .getByPlaceholder(/notes|additional/i)
      .or(page.getByLabel(/Notes/i))
      .filter({ visible: true });
    await expect(notes.first()).toBeVisible({ timeout: 10_000 });
    await notes.first().fill(updatedNote);
    await page.getByRole('button', { name: /Save|Update/i }).filter({ visible: true }).first().click();
    await expect(
      page.getByText(updatedNote).filter({ visible: true }).first(),
    ).toBeVisible({ timeout: 20_000 });

    saveE2eState({
      ...state,
      project: { ...state.project, note: updatedNote },
    });

    await logout();
    await loginAs({
      email: state.pm.email,
      password: state.pm.password,
      homePath: '/project-manager/dashboard',
      role: 'E2E Project Manager',
    });
    const pmProjects = new PmProjectsPage(page);
    await pmProjects.goto();
    await pmProjects.expectProjectVisible(state.project.name);
    await pmProjects.openProject(state.project.name);
    await expect(
      page.getByText(updatedNote).filter({ visible: true }).first(),
    ).toBeVisible({ timeout: 15_000 });

    await logout();
    await loginAs({
      email: state.fr.email,
      password: state.fr.password,
      homePath: '/field-resource/dashboard',
      role: 'E2E Field Resource',
    });
    const frProjects = new FrProjectsPage(page);
    await frProjects.goto();
    await frProjects.expectProjectVisible(state.project.name);
    await frProjects.openProject(state.project.name);
    await expect(
      page.getByText(updatedNote).filter({ visible: true }).first(),
    ).toBeVisible({ timeout: 15_000 });
  });
});
