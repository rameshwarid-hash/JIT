// @ts-check
/**
 * tests/e2e/e2e-001-sa-project-setup.spec.js
 * -----------------------------------------
 * E2E_001 — Super Admin end-to-end project setup:
 * Login → Client → Vendor → PM → FR → Project → Assign → Publish → Verify
 */
import { test, expect } from '../../fixtures/auth.fixture.js';
import { users } from '../../test-data/users.js';
import { saCreateMastersAndPublishProject } from '../../utils/e2eWorkflow.js';
import { loadE2eState } from '../../utils/e2eState.js';

test.describe('E2E_001 Super Admin project setup workflow', () => {
  test.describe.configure({ mode: 'serial' });
  test.setTimeout(180_000);

  test('E2E_001 Create masters, assign users, publish project', async ({
    page,
    loginAs,
  }) => {
    // Arrange: Super Admin session
    await loginAs(users.superAdmin);

    // Act: full business setup (masters + publish)
    const state = await saCreateMastersAndPublishProject(page);

    // Assert: persisted state for downstream E2E specs
    const saved = loadE2eState();
    expect(saved?.project.name).toBe(state.project.name);
    expect(saved?.pm.email).toBe(state.pm.email);
    expect(saved?.fr.email).toBe(state.fr.email);
    expect(saved?.clientName).toBe(state.clientName);
    expect(saved?.vendorName).toBe(state.vendorName);
  });
});
