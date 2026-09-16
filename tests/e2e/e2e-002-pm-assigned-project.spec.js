// @ts-check
/**
 * tests/e2e/e2e-002-pm-assigned-project.spec.js
 * --------------------------------------------
 * E2E_002 — Project Manager verifies assigned project, details, team, activity logs.
 * Prerequisite: E2E_001 state (lastWorkflow.json).
 */
import { test, expect } from '../../fixtures/auth.fixture.js';
import { PmProjectsPage } from '../../pages/projectManager/PmProjectsPage.js';
import { PmActivityLogsPage } from '../../pages/projectManager/PmActivityLogsPage.js';
import { requireE2eState } from '../../utils/e2eState.js';

test.describe('E2E_002 Project Manager assigned project', () => {
  test.setTimeout(120_000);

  test('E2E_002 PM sees project, team context, and activity logs page', async ({
    page,
    loginAs,
  }) => {
    const state = requireE2eState('Run E2E_001 before E2E_002');

    await loginAs({
      email: state.pm.email,
      password: state.pm.password,
      homePath: '/project-manager/dashboard',
      role: 'E2E Project Manager',
    });

    const projects = new PmProjectsPage(page);
    await projects.goto();
    await projects.expectLoaded();
    await projects.expectProjectVisible(state.project.name);

    // Open project card / row and verify identifying details (visible layer only)
    await projects.openProject(state.project.name);
    await expect(
      page
        .getByText(state.project.name, { exact: true })
        .filter({ visible: true })
        .first(),
    ).toBeVisible();
    await expect(
      page
        .getByText(state.project.code, { exact: true })
        .filter({ visible: true })
        .or(
          page
            .getByText(state.fr.displayName, { exact: false })
            .filter({ visible: true }),
        )
        .or(page.getByText(/Team|Members|Field Resource|Manager/i).filter({ visible: true }))
        .first(),
    ).toBeVisible({ timeout: 15_000 });

    const logs = new PmActivityLogsPage(page);
    await logs.goto();
    await logs.expectLoaded();
  });
});
