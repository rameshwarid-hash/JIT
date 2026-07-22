// @ts-check
/**
 * utils/uniqueData.js
 * -------------------
 * WHY: Create flows need unique names/emails/codes so tests do not collide
 * when re-run. Never hardcode a single static "Test Vendor" forever.
 */
export function uniqueSuffix() {
  return `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

/**
 * @param {string} prefix
 */
export function uniqueName(prefix) {
  return `${prefix} ${uniqueSuffix()}`;
}

/**
 * @param {string} [localPart]
 */
export function uniqueEmail(localPart = 'auto') {
  return `${localPart}.${uniqueSuffix()}@example.com`;
}
