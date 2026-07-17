/**
 * Jest config for Firestore security-rules tests.
 * Run via `npm run test:rules` (wraps `firebase emulators:exec`).
 */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/__tests__/rules/**/*.test.js'],
  testTimeout: 20000,
};
