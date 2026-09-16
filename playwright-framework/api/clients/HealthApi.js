// @ts-check
/**
 * api/clients/HealthApi.js
 * ------------------------
 * Example domain API client — copy this pattern for OrdersApi, UsersApi, etc.
 */
import { expect } from '@playwright/test';
import { BaseApiClient } from '../BaseApiClient.js';
import { API_ENDPOINTS } from '../endpoints.js';
import { HTTP_STATUS } from '../../constants/httpStatus.js';

export class HealthApi extends BaseApiClient {
  /**
   * GET readiness/health route.
   * @returns {Promise<import('@playwright/test').APIResponse>}
   */
  async getHealth() {
    return this.get(API_ENDPOINTS.health);
  }

  /**
   * Assert a healthy response; return JSON when Content-Type is JSON.
   * @returns {Promise<any | null>}
   */
  async expectHealthy() {
    const response = await this.getHealth();
    const bodyText = await response.text();

    expect(
      [HTTP_STATUS.OK, HTTP_STATUS.NO_CONTENT],
      `Unexpected health status ${response.status()}: ${bodyText.slice(0, 300)}`,
    ).toContain(response.status());

    const contentType = response.headers()['content-type'] || '';
    if (contentType.includes('application/json') && bodyText) {
      return JSON.parse(bodyText);
    }
    return null;
  }
}
