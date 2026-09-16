// @ts-check
/**
 * fixtures/index.js
 * -----------------
 * Single import path for specs:
 *   import { test, expect } from '../fixtures/index.js';
 *
 * mergeTests composes independent fixture files (Playwright best practice).
 */
import { mergeTests, expect } from '@playwright/test';
import { test as baseFixture } from './base.fixture.js';
import { test as apiFixture } from './api.fixture.js';
import { test as authFixture } from './auth.fixture.js';

export const test = mergeTests(baseFixture, apiFixture, authFixture);
export { expect };
