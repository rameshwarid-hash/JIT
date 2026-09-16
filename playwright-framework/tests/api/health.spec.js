// @ts-check
/**
 * tests/api/health.spec.js
 * ------------------------
 * API smoke: readiness endpoint responds successfully.
 * Uses the `api` fixture (no browser). Adjust API_ENDPOINTS.health if needed.
 */
import { test, expect } from '../../fixtures/index.js';
import { HealthApi } from '../../api/clients/HealthApi.js';
import { HTTP_STATUS } from '../../constants/httpStatus.js';
import { TAGS } from '../../constants/tags.js';

test.describe('API — Health', () => {
  // API tests do not need a browser project matrix — run once via any project
  // or filter later with: npx playwright test tests/api --project=chromium

  test(`health endpoint returns success ${TAGS.smoke} ${TAGS.api}`, async ({
    api,
    appEnv,
  }) => {
    expect(appEnv.apiBaseURL).toBeTruthy();

    const healthApi = new HealthApi(api);
    const response = await healthApi.getHealth();

    expect(
      [HTTP_STATUS.OK, HTTP_STATUS.NO_CONTENT],
      `body: ${(await response.text()).slice(0, 300)}`,
    ).toContain(response.status());
  });
});
