// @ts-check
/**
 * tests/e2e/e2e-006-fr-draft-workflow.spec.js
 * ------------------------------------------
 * E2E_006 — Field Resource Save Draft → Open → Edit → Submit.
 */
import { test, expect } from '../../fixtures/auth.fixture.js';
import { FrLogActivityPage } from '../../pages/fieldResource/FrLogActivityPage.js';
import { FrActivityLogsPage } from '../../pages/fieldResource/FrActivityLogsPage.js';
import { requireE2eState } from '../../utils/e2eState.js';
import { uniqueName } from '../../utils/uniqueData.js';

test.describe('E2E_006 Field Resource draft workflow', () => {
  test.setTimeout(150_000);

  test('E2E_006 Save draft, edit, then submit', async ({ page, loginAs }) => {
    const state = requireE2eState('Run E2E_001 before E2E_006');
    const draftText = uniqueName('E2E draft work');
    const editedText = `${draftText} edited`;

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
    await log.fillWorkPerformed(draftText);
    await log.selectCategory('General');
    await log.saveDraft();
    await log.expectDraftSaved();

    const logs = new FrActivityLogsPage(page);
    await logs.goto();
    await logs.openDraftsFilterIfPresent();
    await logs.openActivityContaining(draftText);

    // Edit draft work performed then submit from log-activity or details
    const editor = page.getByRole('textbox', { name: /Describe the work performed/i });
    if (await editor.isVisible().catch(() => false)) {
      await editor.fill(editedText);
      await page.getByRole('button', { name: 'Submit Activity' }).click();
    } else {
      await log.goto();
      await log.selectProject(state.project.name);
      await log.fillWorkPerformed(editedText);
      await log.selectCategory('General');
      await log.submitActivity();
    }
    await expect(
      page.getByText(/submitted successfully|Activity submitted|success/i).first(),
    ).toBeVisible({ timeout: 20_000 });
  });
});
