// @ts-check
/**
 * utils/dateTime.js
 * -----------------
 * Small date helpers for forms, filters, and API payloads.
 * Pure functions — no Playwright dependency.
 */

/**
 * @param {Date} [date]
 * @returns {string} YYYY-MM-DD (local calendar date)
 */
export function toIsoDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * @param {number} days
 * @param {Date} [from]
 * @returns {string} YYYY-MM-DD shifted by `days` (negative = past)
 */
export function isoDatePlusDays(days, from = new Date()) {
  if (typeof days !== 'number' || Number.isNaN(days)) {
    throw new Error('isoDatePlusDays(days) requires a number');
  }
  const copy = new Date(from.getTime());
  copy.setDate(copy.getDate() + days);
  return toIsoDate(copy);
}

/**
 * @param {Date} [date]
 * @returns {string} ISO-8601 UTC timestamp
 */
export function toIsoTimestamp(date = new Date()) {
  return date.toISOString();
}
