const {
  readEnforceAppCheck,
  buildCallableOpts,
} = require('../callableOpts');

describe('callableOpts', () => {
  it('defaults enforceAppCheck to false', () => {
    expect(readEnforceAppCheck({})).toBe(false);
    expect(buildCallableOpts({})).toEqual({
      invoker: 'public',
      enforceAppCheck: false,
    });
  });

  it('enables App Check for truthy env values', () => {
    expect(readEnforceAppCheck({ ENFORCE_APP_CHECK: 'true' })).toBe(true);
    expect(readEnforceAppCheck({ ENFORCE_APP_CHECK: '1' })).toBe(true);
    expect(readEnforceAppCheck({ ENFORCE_APP_CHECK: 'YES' })).toBe(true);
  });

  it('disables App Check for falsy env values', () => {
    expect(readEnforceAppCheck({ ENFORCE_APP_CHECK: 'false' })).toBe(false);
    expect(readEnforceAppCheck({ ENFORCE_APP_CHECK: '0' })).toBe(false);
  });
});
