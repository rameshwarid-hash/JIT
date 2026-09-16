// @ts-check
/**
 * api/endpoints.js
 * ----------------
 * API path fragments only (host comes from API_BASE_URL / request context).
 * Keep UI paths in constants/routes.js — do not mix the two.
 */
export const API_ENDPOINTS = Object.freeze({
  health: '/health',
  login: '/api/auth/login',
});
