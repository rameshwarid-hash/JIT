// @ts-check
/**
 * test-data/users.js
 * ------------------
 * WHY THIS FILE EXISTS:
 * Tests need credentials for 3 roles, but passwords must NEVER be hardcoded
 * inside page objects or spec files.
 *
 * This helper:
 * 1. Reads values from process.env (loaded from .env by playwright.config.js)
 * 2. Exposes clear role names your tests can use: users.superAdmin, etc.
 * 3. Fails early with a clear message if a required env var is missing
 *
 * HOW TESTS WILL USE IT (Step 4):
 *   import { users } from '../test-data/users.js';
 *   await loginPage.login(users.superAdmin.email, users.superAdmin.password);
 */

/**
 * Read one required environment variable.
 * WHY throw instead of returning undefined:
 * A missing password should fail immediately with a helpful message,
 * not later with a confusing "login failed" timeout.
 *
 * @param {string} name
 * @returns {string}
 */
function requiredEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(
      `Missing environment variable: ${name}. ` +
        `Add it to your .env file (see .env.example).`,
    );
  }

  return value;
}

/**
 * Build one user object from env keys.
 *
 * @param {{
 *   role: string,
 *   emailKey: string,
 *   passwordKey: string,
 *   homePath?: string,
 * }} config
 */
function createUser(config) {
  return {
    /**
     * Human-readable role name (useful in test titles / reports)
     */
    role: config.role,

    /**
     * Login email — from .env, never hardcoded here
     */
    email: requiredEnv(config.emailKey),

    /**
     * Login password — from .env, never hardcoded here
     */
    password: requiredEnv(config.passwordKey),

    /**
     * Expected landing path after a successful login (when known).
     * Used by LoginPage.expectLoginSuccess({ urlIncludes: user.homePath }).
     *
     * If unknown, this stays undefined and tests only check that /login was left.
     */
    homePath: config.homePath,
  };
}

/**
 * All JIT roles used by automation.
 *
 * ENV KEY MAPPING (current .env names → role names):
 * - Super Admin      → SUPER_ADMIN_EMAIL / SUPER_ADMIN_PASSWORD
 * - Project Manager  → ADMIN_EMAIL / ADMIN_PASSWORD
 * - Field Resource   → EMPLOYEE_EMAIL / EMPLOYEE_PASSWORD
 *
 * We keep the existing .env key names so you do not have to rename secrets.
 * The exported object uses clear role names for readable tests.
 */
export const users = {
  superAdmin: createUser({
    role: 'Super Admin',
    emailKey: 'SUPER_ADMIN_EMAIL',
    passwordKey: 'SUPER_ADMIN_PASSWORD',
    // Verified on staging: successful Super Admin login lands here
    homePath: '/super-admin/dashboard',
  }),

  projectManager: createUser({
    role: 'Project Manager',
    emailKey: 'ADMIN_EMAIL',
    passwordKey: 'ADMIN_PASSWORD',
    // Verified on staging
    homePath: '/project-manager/dashboard',
  }),

  fieldResource: createUser({
    role: 'Field Resource',
    emailKey: 'EMPLOYEE_EMAIL',
    passwordKey: 'EMPLOYEE_PASSWORD',
    // Verified on staging
    homePath: '/field-resource/dashboard',
  }),
};

/**
 * Optional helper: get a user by role key.
 * Useful later for data-driven tests.
 *
 * @param {'superAdmin' | 'projectManager' | 'fieldResource'} key
 */
export function getUser(key) {
  const user = users[key];

  if (!user) {
    throw new Error(
      `Unknown user key: "${key}". Use: superAdmin | projectManager | fieldResource`,
    );
  }

  return user;
}
