/**
 * Shared callable options for Cloud Functions.
 * Kept free of Firebase init so unit tests can import without side effects.
 */

function readEnforceAppCheck(env = process.env) {
  const raw = String(env.ENFORCE_APP_CHECK || '')
    .trim()
    .toLowerCase();
  if (raw === '1' || raw === 'true' || raw === 'yes') {
    return true;
  }
  if (raw === '0' || raw === 'false' || raw === 'no') {
    return false;
  }
  // Default off until Firebase Console App Check providers are live.
  return false;
}

function buildCallableOpts(env = process.env) {
  return {
    invoker: 'public',
    enforceAppCheck: readEnforceAppCheck(env),
  };
}

module.exports = {
  readEnforceAppCheck,
  buildCallableOpts,
};
