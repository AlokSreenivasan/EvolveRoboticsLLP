import { requiresEmailVerification } from '../requiresEmailVerification';

describe('requiresEmailVerification', () => {
  it('is false when signed out', () => {
    expect(requiresEmailVerification(null)).toBe(false);
  });

  it('is true for unverified email/password accounts', () => {
    expect(
      requiresEmailVerification({
        emailVerified: false,
        providerData: [{ providerId: 'password' }],
      }),
    ).toBe(true);
  });

  it('is false after the email/password inbox is confirmed', () => {
    expect(
      requiresEmailVerification({
        emailVerified: true,
        providerData: [{ providerId: 'password' }],
      }),
    ).toBe(false);
  });

  it('is false for Google-only accounts even if emailVerified is missing', () => {
    expect(
      requiresEmailVerification({
        emailVerified: false,
        providerData: [{ providerId: 'google.com' }],
      }),
    ).toBe(false);
  });

  it('is true for unverified email accounts when providerData is still empty', () => {
    expect(
      requiresEmailVerification({
        emailVerified: false,
        providerData: [],
      }),
    ).toBe(true);
  });
});
