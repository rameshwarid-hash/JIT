// @ts-check
/**
 * test-data/factories/user.factory.js
 * -----------------------------------
 * Builds unique user payloads for create/sign-up flows (parallel-safe).
 * Does not read credentials from env — that is personas.js.
 */
import { uniqueEmail, uniqueSuffix } from '../../utils/uniqueData.js';

/**
 * @typedef {{
 *   firstName: string,
 *   lastName: string,
 *   email: string,
 *   displayName: string,
 * }} UserFactoryResult
 */

/**
 * @param {Partial<UserFactoryResult>} [overrides]
 * @returns {UserFactoryResult}
 */
export function buildUser(overrides = {}) {
  const firstName = overrides.firstName ?? 'Auto';
  const lastName = overrides.lastName ?? `User${uniqueSuffix().slice(-6)}`;
  const email = overrides.email ?? uniqueEmail('user');
  const displayName = overrides.displayName ?? `${firstName} ${lastName}`;

  return {
    firstName,
    lastName,
    email,
    displayName,
  };
}
