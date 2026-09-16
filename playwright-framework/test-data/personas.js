// @ts-check
/**
 * test-data/personas.js
 * --------------------
 * Named users for tests. Credentials come ONLY from env (.env*).
 * Specs call: await loginAs(personas.admin) — never hardcode passwords.
 */
import { env } from '../config/env.config.js';
import { ROUTES } from '../constants/routes.js';

/**
 * @typedef {{
 *   role: string,
 *   email: string,
 *   password: string,
 *   homePath: string | RegExp,
 * }} Persona
 */

/**
 * Build one persona from required env keys.
 * @param {{
 *   role: string,
 *   emailKey: string,
 *   passwordKey: string,
 *   homePath?: string | RegExp,
 * }} config
 * @returns {Persona}
 */
function createPersona(config) {
  return {
    role: config.role,
    email: env.required(config.emailKey),
    password: env.required(config.passwordKey),
    homePath: config.homePath ?? ROUTES.dashboard,
  };
}

/**
 * Lazy getters: missing env vars fail only when that persona is used.
 * Lets API-only tests run without filling ADMIN_PASSWORD locally.
 */
export const personas = {
  /** Elevated / back-office user */
  get admin() {
    return createPersona({
      role: 'Admin',
      emailKey: 'ADMIN_EMAIL',
      passwordKey: 'ADMIN_PASSWORD',
      homePath: ROUTES.dashboard,
    });
  },

  /** Standard end-user */
  get user() {
    return createPersona({
      role: 'User',
      emailKey: 'USER_EMAIL',
      passwordKey: 'USER_PASSWORD',
      homePath: ROUTES.dashboard,
    });
  },
};

/**
 * @param {'admin' | 'user'} key
 * @returns {Persona}
 */
export function getPersona(key) {
  const persona = personas[key];
  if (!persona) {
    throw new Error(`Unknown persona "${key}". Use: admin | user`);
  }
  return persona;
}
