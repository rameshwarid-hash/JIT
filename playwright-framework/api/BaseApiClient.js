// @ts-check
/**
 * api/BaseApiClient.js
 * --------------------
 * Thin wrapper around Playwright's APIRequestContext.
 * Domain clients extend this — no UI / page usage here.
 */
import { expect } from '@playwright/test';
import { HTTP_STATUS } from '../constants/httpStatus.js';

export class BaseApiClient {
  /**
   * @param {import('@playwright/test').APIRequestContext} request
   *        Prefer the `api` fixture from fixtures/api.fixture.js
   */
  constructor(request) {
    if (!request) {
      throw new Error('BaseApiClient requires an APIRequestContext');
    }
    /** @type {import('@playwright/test').APIRequestContext} */
    this.request = request;
  }

  /** @param {string} path @param {Object} [options] */
  async get(path, options) {
    return this.request.get(path, options);
  }

  /** @param {string} path @param {Object} [options] */
  async post(path, options) {
    return this.request.post(path, options);
  }

  /** @param {string} path @param {Object} [options] */
  async put(path, options) {
    return this.request.put(path, options);
  }

  /** @param {string} path @param {Object} [options] */
  async patch(path, options) {
    return this.request.patch(path, options);
  }

  /** @param {string} path @param {Object} [options] */
  async delete(path, options) {
    return this.request.delete(path, options);
  }

  /**
   * Assert status and return JSON body.
   * @param {import('@playwright/test').APIResponse} response
   * @param {number} [expectedStatus]
   */
  async readJson(response, expectedStatus = HTTP_STATUS.OK) {
    const bodyText = await response.text();
    expect(response.status(), bodyText).toBe(expectedStatus);
    return JSON.parse(bodyText);
  }
}
