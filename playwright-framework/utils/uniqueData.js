// @ts-check
/**
 * utils/uniqueData.js
 * -------------------
 * Build collision-resistant names/emails for parallel runs.
 * Pure functions — no Playwright, no env, no I/O.
 */

/**
 * Time + random fragment so two workers rarely collide.
 * @returns {string}
 */
export function uniqueSuffix() {
  const time = Date.now();
  const random = Math.floor(Math.random() * 1_000_000)
    .toString()
    .padStart(6, '0');
  return `${time}-${random}`;
}

/**
 * Human-readable unique label for UI fields (client name, order note, …).
 * @param {string} prefix
 * @returns {string}
 */
export function uniqueName(prefix) {
  if (!prefix || typeof prefix !== 'string') {
    throw new Error('uniqueName(prefix) requires a non-empty string prefix');
  }
  return `${prefix} ${uniqueSuffix()}`;
}

/**
 * Unique email for sign-up / user-create flows.
 * Uses example.com (RFC 2606) so we never hit a real inbox by accident.
 * @param {string} [localPart]
 * @returns {string}
 */
export function uniqueEmail(localPart = 'auto') {
  const safeLocal = String(localPart)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._+-]/g, '.');
  return `${safeLocal}.${uniqueSuffix()}@example.com`;
}
