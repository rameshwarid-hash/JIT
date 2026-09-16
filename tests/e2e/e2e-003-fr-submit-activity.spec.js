// @ts-check
/**
 * tests/e2e/e2e-003-fr-submit-activity.spec.js
 * -------------------------------------------
 * E2E_003 — Field Resource submits activity with image + PDF.
 */
import { test, expect } from '../../fixtures/auth.fixture.js';
import { FrProjectsPage } from '../../pages/fieldResource/FrProjectsPage.js';
import { FrLogActivityPage } from '../../pages/fieldResource/FrLogActivityPage.js';
import { E2E_FIXTURES, requireE2eState, saveE2eState } from '../../utils/e2eState.js';
import { uniqueName } from '../../utils/uniqueData.js';

test.describe('E2E_003 Field Resource submit activity', () => {
  test.setTimeout(150_000);

  test('E2E_003 FR opens project, uploads files, submits activity', async ({
    page,
    loginAs,
  }) => {
    const state = requireE2eState('Run E2E_001 before E2E_003');
    const workSummary = uniqueName('E2E work performed');

    await loginAs({
      email: state.fr.email,
      password: state.fr.password,
      homePath: '/field-resource/dashboard',
      role: 'E2E Field Resource',
    });

    const projects = new FrProjectsPage(page);
    await projects.goto();
    await projects.expectLoaded();
    await projects.expectProjectVisible(state.project.name);

    const log = new FrLogActivityPage(page);
    await log.goto();
    await log.expectLoaded();
    await log.selectProject(state.project.name);
    await log.fillWorkPerformed(workSummary);
    await log.locationInput.fill('Pune Site');
    await log.selectCategory('General');
    await log.uploadAttachment(E2E_FIXTURES.image, 'Photos');
    await log.uploadAttachment(E2E_FIXTURES.pdf, 'Documents');
    await log.submitActivity();
    await log.expectSubmitSuccess();

    saveE2eState({
      ...state,
      activity: { workSummary, critical: false },
    });
  });
});
