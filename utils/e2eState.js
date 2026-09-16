// @ts-check
/**
 * utils/e2eState.js
 * -----------------
 * Persists shared workflow context between E2E specs (project, users, activity).
 * Written by setup-heavy flows (E2E_001 / helpers) and read by later role checks.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STATE_PATH = path.resolve(__dirname, '../test-data/e2e/lastWorkflow.json');

/**
 * @typedef {{
 *   clientName: string,
 *   vendorName: string,
 *   pm: { firstName: string, lastName: string, email: string, password: string, displayName: string },
 *   fr: { firstName: string, lastName: string, email: string, password: string, displayName: string },
 *   project: { name: string, code: string },
 *   activity?: { workSummary: string, critical?: boolean, comment?: string },
 *   updatedAt: string,
 * }} E2eWorkflowState
 */

/** @returns {E2eWorkflowState | null} */
export function loadE2eState() {
  if (!fs.existsSync(STATE_PATH)) return null;
  try {
    return /** @type {E2eWorkflowState} */ (
      JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'))
    );
  } catch {
    return null;
  }
}

/** @param {E2eWorkflowState} state */
export function saveE2eState(state) {
  fs.mkdirSync(path.dirname(STATE_PATH), { recursive: true });
  fs.writeFileSync(
    STATE_PATH,
    JSON.stringify({ ...state, updatedAt: new Date().toISOString() }, null, 2),
  );
}

/**
 * @param {string} reason
 * @returns {E2eWorkflowState}
 */
export function requireE2eState(reason = 'Run E2E_001 first to seed workflow state') {
  const state = loadE2eState();
  if (!state?.project?.name) {
    throw new Error(`Missing E2E workflow state: ${reason}`);
  }
  return state;
}

export const E2E_PASSWORD = 'E2eTest@12345';
export const E2E_FIXTURES = {
  image: path.resolve(__dirname, '../test-data/e2e/fixtures/sample.png'),
  pdf: path.resolve(__dirname, '../test-data/e2e/fixtures/sample.pdf'),
};
