// @ts-check
/**
 * constants/routes.js
 * -------------------
 * Canonical URL paths used by page objects and tests.
 * Change a path once here — every caller stays in sync.
 * Host comes from BASE_URL (env); only paths live here.
 */
export const ROUTES = Object.freeze({
  home: '/',
  login: '/login',
  logout: '/logout',
  dashboard: '/dashboard',
  /** Lightweight readiness check used by API / health smoke */
  health: '/health',
  /** OpenAPI / swagger docs when the product exposes them */
  apiDocs: '/api/docs',
});
