// @ts-check
/**
 * config/env.config.js
 * ---------------------
 * Single source of truth for environment loading.
 * Playwright config, API clients, and tests import from here —
 * never hardcode URLs or secrets in page objects / specs.
 */
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/** Absolute path to this file (ESM has no __filename by default). */
const __filename = fileURLToPath(import.meta.url);

/** Directory that contains this file → …/config */
const __dirname = path.dirname(__filename);

/** Framework root → …/playwright-framework */
const ROOT_DIR = path.resolve(__dirname, '..');

/**
 * Maps logical environment names → dotenv files at the repo root.
 * Select with: TEST_ENV=qa npm test  (or ENV=staging)
 */
const ENV_FILES = Object.freeze({
  local: '.env',
  qa: '.env.qa',
  staging: '.env.staging',
  production: '.env.production',
});

/**
 * Resolves which named environment is active.
 * Defaults to "local" so beginners can run without extra flags.
 * @returns {keyof typeof ENV_FILES}
 */
function resolveEnvName() {
  const raw = (process.env.TEST_ENV || process.env.ENV || 'local').toLowerCase();

  if (!(raw in ENV_FILES)) {
    throw new Error(
      `Unknown TEST_ENV/ENV "${raw}". Allowed: ${Object.keys(ENV_FILES).join(', ')}`,
    );
  }

  return /** @type {keyof typeof ENV_FILES} */ (raw);
}

/**
 * Loads the matching .env* file into process.env (if the file exists).
 * Missing file is a warning only — so we can scaffold the framework
 * before env files are created in a later step.
 * @returns {keyof typeof ENV_FILES}
 */
function loadEnvFile() {
  const envName = resolveEnvName();
  const envFileName = ENV_FILES[envName];
  const envPath = path.join(ROOT_DIR, envFileName);

  if (!fs.existsSync(envPath)) {
    console.warn(
      `[config] ${envFileName} not found at project root. ` +
        `Create it before running tests (TEST_ENV=${envName}).`,
    );
    return envName;
  }

  const result = dotenv.config({ path: envPath, override: true });

  if (result.error) {
    throw result.error;
  }

  return envName;
}

/** Active env name after attempting to load the file. */
const activeEnv = loadEnvFile();

/**
 * Read a required variable or fail fast with a clear message.
 * @param {string} name
 * @returns {string}
 */
function required(name) {
  const value = process.env[name];

  if (value === undefined || value === '') {
    throw new Error(
      `Missing required environment variable "${name}" (TEST_ENV=${activeEnv}). ` +
        `Add it to ${ENV_FILES[activeEnv]}.`,
    );
  }

  return value;
}

/**
 * Read an optional variable with a fallback.
 * @param {string} name
 * @param {string} [fallback]
 * @returns {string}
 */
function optional(name, fallback = '') {
  const value = process.env[name];
  return value === undefined || value === '' ? fallback : value;
}

/**
 * Public config object used across the framework.
 * Getters delay "required" checks until a value is actually used.
 */
export const env = {
  /** @type {keyof typeof ENV_FILES} */
  name: activeEnv,

  /** UI base URL for Playwright `use.baseURL` and page.goto('/path'). */
  get baseURL() {
    return required('BASE_URL');
  },

  /** API host; falls back to BASE_URL when API_BASE_URL is unset. */
  get apiBaseURL() {
    return optional('API_BASE_URL', required('BASE_URL'));
  },

  required,
  optional,
};

export { ROOT_DIR, ENV_FILES };
