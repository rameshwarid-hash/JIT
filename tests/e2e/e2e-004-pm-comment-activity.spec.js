// @ts-check
/**
 * tests/e2e/e2e-004-pm-comment-activity.spec.js
 * --------------------------------------------
 * E2E_004 — Project Manager opens submitted activity and posts a comment.
 */
import { test, expect } from '../../fixtures/auth.fixture.js';
import { PmActivityLogsPage } from '../../pages/projectManager/PmActivityLogsPage.js';
import { requireE2eState, saveE2eState } from '../../utils/e2eState.js';
import { uniqueName } from '../../utils/uniqueData.js';

test.describe('E2E_004 Project Manager reviews and comments', () => {
  test.setTimeout(120_000);

  test('E2E_004 PM opens activity, verifies details, posts comment', async ({
    page,
    loginAs,
  }) => {
    const state = requireE2eState('Run E2E_001 + E2E_003 before E2E_004');
    test.skip(!state.activity?.workSummary, 'E2E_003 must submit an activity first');

    const comment = uniqueName('E2E PM comment');

    await loginAs({
      email: state.pm.email,
      password: state.pm.password,
      homePath: '/project-manager/dashboard',
      role: 'E2E Project Manager',
    });

    const logs = new PmActivityLogsPage(page);
    await logs.goto();
    await logs.expectLoaded();
    await logs.openActivityContaining(state.activity.workSummary);
    await logs.expectDetailsContain(state.activity.workSummary);
    await logs.expectDetailsContain(state.project.name);
    await logs.postComment(comment);

    saveE2eState({
      ...state,
      activity: { ...state.activity, comment },
    });
  });
});
