// @ts-check
/**
 * test-data/loginData.js
 * ----------------------
 * WHY THIS FILE STILL EXISTS:
 * You already created this empty file as part of the project skeleton.
 *
 * The real credentials helper lives in users.js (clearer name for 3 roles).
 * This file simply re-exports it so either import path works:
 *
 *   import { users } from '../test-data/users.js';      // preferred
 *   import { users } from '../test-data/loginData.js';  // also fine
 */
export { users, getUser } from './users.js';
