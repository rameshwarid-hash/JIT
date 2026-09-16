// @ts-check
/**
 * constants/timeouts.js
 * ---------------------
 * Named waits for page objects and custom polling.
 * Global defaults stay in playwright.config.js (expect / action / test).
 * Use these when a specific step needs a clearer intent than a magic number.
 */
export const TIMEOUTS = Object.freeze({
  /** Toasts, short UI transitions */
  short: 5_000,
  /** Typical click → visible result */
  medium: 15_000,
  /** Slow lists, navigation after submit */
  long: 30_000,
  /** Uploads, exports, report generation */
  extraLong: 60_000,
});
