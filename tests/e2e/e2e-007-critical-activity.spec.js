// @ts-check
/**
 * tests/e2e/e2e-007-critical-activity.spec.js
 * ------------------------------------------
 * E2E_007 — FR submits critical activity; PM verifies Critical badge.
 */
import { test, expect } from '../../fixtures/auth.fixture.js';
import { FrLogActivityPage } from '../../pages/fieldResource/FrLogActivityPage.js';
import { PmActivityLogsPage } from '../../pages/projectManager/PmActivityLogsPage.js';
import { requireE2eState } from '../../utils/e2eState.js';
import { uniqueName } from '../../utils/uniqueData.js';
import { LoginPage } from '../../pages/LoginPage.js';

test.describe('E2E_007 Critical activity workflow', () => {
  test.setTimeout(150_000);

  test('E2E_007 FR submits critical; PM sees Critical badge', async ({
    page,
    loginAs,
    logout,
  }) => {
    const state = requireE2eState('Run E2E_001 before E2E_007');
    const workSummary = uniqueName('E2E critical work');

    await loginAs({
      email: state.fr.email,
      password: state.fr.password,
      homePath: '/field-resource/dashboard',
      role: 'E2E Field Resource',
    });

    const log = new FrLogActivityPage(page);
    await log.goto();
    await log.expectLoaded();
    await log.selectProject(state.project.name);
    await log.fillWorkPerformed(workSummary);
    await log.selectCategory('Inspection');
    await log.markCritical();
    await log.submitActivity();
    await log.expectSubmitSuccess();

    await logout();
    await loginAs({
      email: state.pm.email,
      password: state.pm.password,
      homePath: '/project-manager/dashboard',
      role: 'E2E Project Manager',
    });

    const pmLogs = new PmActivityLogsPage(page);
    await pmLogs.goto();
    await pmLogs.expectLoaded();
    await pmLogs.openActivityContaining(workSummary);
    await pmLogs.expectCriticalBadge();
    await pmLogs.expectDetailsContain(workSummary);
  });
});
