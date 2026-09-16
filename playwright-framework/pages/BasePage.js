// @ts-check
/**
 * pages/BasePage.js
 * -----------------
 * Shared behaviour for every page object (navigation helpers).
 * Domain pages extend this — keep it thin (no product-specific locators).
 */
import { expect } from '@playwright/test';
import { TIMEOUTS } from '../constants/timeouts.js';

export class BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    /** @type {import('@playwright/test').Page} */
    this.page = page;
  }

  /**
   * Navigate using baseURL + path (path should come from constants/routes).
   * @param {string} path
   */
  async goto(path) {
    await this.page.goto(path);
  }

  /**
   * @param {string | RegExp} url
   * @param {number} [timeout]
   */
  async expectUrl(url, timeout = TIMEOUTS.long) {
    await expect(this.page).toHaveURL(url, { timeout });
  }

  /**
   * @param {string | RegExp} title
   */
  async expectTitle(title) {
    await expect(this.page).toHaveTitle(title);
  }
}
