// @ts-check
/**
 * test-data/superAdmin/masters.js
 * -------------------------------
 * Known staging seed data for search/filter tests.
 * Prefer searching existing records over hardcoding fragile IDs in assertions.
 */
export const knownVendor = {
  name: 'InfraEquip Rentals',
  code: 'IER-002',
};

export const knownClient = {
  name: 'Internal QA',
  code: 'IQ',
};

export const knownEmployee = {
  name: 'Rahul Patel',
  email: 'rahul.patel@jitechnovation.com',
  code: 'JIT-EM-005',
};

export const knownProject = {
  // TODO: Actual project name/code if search needs a stable seed — discovered at runtime when possible
  nameHint: 'Hemang',
};
