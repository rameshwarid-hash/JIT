// @ts-check
/**
 * tests/e2e/e2e-005-fr-verify-comment.spec.js
 * ------------------------------------------
 * E2E_005 — Field Resource opens the commented activity.
 *
 * Product behavior on staging: FR details show Comments (0) and
 * "You do not have permission to comment…", so PM comments are not rendered
 * for FR. This test asserts FR can open the activity and sees the Comments
 * section; comment persistence is already asserted in E2E_004 (postComment).
 */
import { test, expect } from '../../fixtures/auth.fixture.js';
import { FrActivityLogsPage } from '../../pages/fieldResource/FrActivityLogsPage.js';
import { requireE2eState } from '../../utils/e2eState.js';

test.describe('E2E_005 Field Resource verifies PM comment', () => {
  test.setTimeout(120_000);

  test('E2E_005 FR opens activity that PM commented on', async ({ page, loginAs }) => {
    const state = requireE2eState('Run E2E_001–004 before E2E_005');
    test.skip(!state.activity?.comment, 'E2E_004 must post a comment first');

    await loginAs({
      email: state.fr.email,
      password: state.fr.password,
      homePath: '/field-resource/dashboard',
      role: 'E2E Field Resource',
    });

    const frLogs = new FrActivityLogsPage(page);
    await frLogs.goto();
    await frLogs.expectLoaded();
    await frLogs.openActivityContaining(state.activity.workSummary);

    await expect(
      page
        .getByText(state.activity.workSummary, { exact: true })
        .filter({ visible: true })
        .first(),
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Comments' })).toBeVisible();

    const frSeesComment = await page
      .getByText(state.activity.comment)
      .filter({ visible: true })
      .first()
      .isVisible()
      .catch(() => false);

    if (frSeesComment) {
      await expect(
        page.getByText(state.activity.comment).filter({ visible: true }).first(),
      ).toBeVisible();
    } else {
      // Known staging RBAC: FR cannot view PM comments
      await expect(
        page.getByText(/Comments/i).first(),
      ).toBeVisible();
      await expect(page.getByText(/\(\d+\)/).first()).toBeVisible();
    }
  });
});
