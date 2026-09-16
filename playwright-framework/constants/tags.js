// @ts-check
/**
 * constants/tags.js
 * -----------------
 * Stable labels for suite filtering (title includes or --grep).
 * Example: test('login @smoke', …)  then: npx playwright test --grep @smoke
 * Keep tags short, lowercase, and documented in README later.
 */
export const TAGS = Object.freeze({
  smoke: '@smoke',
  sanity: '@sanity',
  regression: '@regression',
  api: '@api',
  visual: '@visual',
  critical: '@critical',
  security: '@security',
});
