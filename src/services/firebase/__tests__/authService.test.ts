import {
  getCurrentUser,
  getCurrentUserEmail,
  getCurrentUserId,
  hasEmailPasswordProvider,
  onAuthStateChanged,
  reauthenticateWithPassword,
  sendPasswordResetEmail,
  sendEmailVerificationEmail,
  signInWithEmailPassword,
  signOut,
} from '../authService';

import * as authModule from '@react-native-firebase/auth';
import * as googleModule from '@react-native-google-signin/google-signin';

// Plain imports resolve to the manual mocks in __mocks__/ and share the
// instance the service module sees (jest.requireMock would create a copy).
const authMock = authModule as any;
const googleMock = googleModule as any;

beforeEach(() => {
  jest.clearAllMocks();
  authMock.__authInstance.currentUser = null;
});

describe('session getters', () => {
  it('returns null when signed out', () => {
    expect(getCurrentUser()).toBeNull();
    expect(getCurrentUserId()).toBeNull();
    expect(getCurrentUserEmail()).toBeNull();
  });

  it('returns the current user, uid, and email when signed in', () => {
    const user = authMock.__createMockUser({ uid: 'u1', email: 'a@b.com' });
    authMock.__authInstance.currentUser = user;

    expect(getCurrentUser()).toBe(user);
    expect(getCurrentUserId()).toBe('u1');
    expect(getCurrentUserEmail()).toBe('a@b.com');
  });
});

describe('signInWithEmailPassword', () => {
  it('trims the email before delegating to Firebase', async () => {
    await signInWithEmailPassword('  user@example.com  ', 'secret');
    expect(authMock.signInWithEmailAndPassword).toHaveBeenCalledWith(
      authMock.__authInstance,
      'user@example.com',
      'secret',
    );
  });

  it('reports when an email/password account still needs inbox verification', async () => {
    const user = authMock.__createMockUser({ emailVerified: false });
    authMock.__authInstance.currentUser = user;

    await expect(
      signInWithEmailPassword('user@example.com', 'secret'),
    ).resolves.toEqual({ needsEmailVerification: true });
    expect(authMock.reload).toHaveBeenCalledWith(user);
  });

  it('does not gate a verified email/password account', async () => {
    authMock.__authInstance.currentUser = authMock.__createMockUser({
      emailVerified: true,
    });

    await expect(
      signInWithEmailPassword('user@example.com', 'secret'),
    ).resolves.toEqual({ needsEmailVerification: false });
  });
});

describe('onAuthStateChanged', () => {
  it('subscribes and emits the current auth state', async () => {
    const listener = jest.fn();
    const unsubscribe = onAuthStateChanged(listener);

    await Promise.resolve();
    expect(listener).toHaveBeenCalledWith(null);
    expect(typeof unsubscribe).toBe('function');
  });
});

describe('signOut', () => {
  it('signs out of Firebase only for email/password accounts', async () => {
    authMock.__authInstance.currentUser = authMock.__createMockUser();

    await signOut();

    expect(authMock.signOut).toHaveBeenCalled();
    expect(googleMock.GoogleSignin.signOut).not.toHaveBeenCalled();
  });

  it('also clears the Google SDK session for Google accounts', async () => {
    authMock.__authInstance.currentUser = authMock.__createMockUser({
      providerData: [{ providerId: 'google.com' }],
    });
    googleMock.GoogleSignin.hasPreviousSignIn.mockReturnValueOnce(true);

    await signOut();

    expect(authMock.signOut).toHaveBeenCalled();
    expect(googleMock.GoogleSignin.signOut).toHaveBeenCalled();
  });
});

describe('hasEmailPasswordProvider', () => {
  it('detects the password provider', () => {
    authMock.__authInstance.currentUser = authMock.__createMockUser();
    expect(hasEmailPasswordProvider()).toBe(true);
  });

  it('is false for Google-only accounts and when signed out', () => {
    expect(hasEmailPasswordProvider()).toBe(false);

    authMock.__authInstance.currentUser = authMock.__createMockUser({
      providerData: [{ providerId: 'google.com' }],
    });
    expect(hasEmailPasswordProvider()).toBe(false);
  });
});

describe('reauthenticateWithPassword', () => {
  it('rejects when signed out', async () => {
    await expect(reauthenticateWithPassword('pw')).rejects.toThrow(
      'You must be signed in to continue.',
    );
  });

  it('rejects for accounts without a password provider', async () => {
    authMock.__authInstance.currentUser = authMock.__createMockUser({
      providerData: [{ providerId: 'google.com' }],
    });

    await expect(reauthenticateWithPassword('pw')).rejects.toThrow(
      'Re-authentication is only available for email and password accounts.',
    );
  });

  it('reauthenticates and refreshes the session token', async () => {
    const user = authMock.__createMockUser();
    authMock.__authInstance.currentUser = user;

    await reauthenticateWithPassword('current-password');

    expect(authMock.EmailAuthProvider.credential).toHaveBeenCalledWith(
      'test@example.com',
      'current-password',
    );
    expect(user.reauthenticateWithCredential).toHaveBeenCalled();
    expect(authMock.reload).toHaveBeenCalledWith(user);
    expect(authMock.getIdToken).toHaveBeenCalledWith(user, true);
  });

  it('maps wrong-password errors to a friendly message', async () => {
    const user = authMock.__createMockUser({
      reauthenticateWithCredential: jest.fn(() =>
        Promise.reject({ code: 'auth/wrong-password' }),
      ),
    });
    authMock.__authInstance.currentUser = user;

    await expect(reauthenticateWithPassword('bad')).rejects.toThrow(
      'Password is incorrect.',
    );
  });

  it('maps too-many-requests errors', async () => {
    const user = authMock.__createMockUser({
      reauthenticateWithCredential: jest.fn(() =>
        Promise.reject({ code: 'auth/too-many-requests' }),
      ),
    });
    authMock.__authInstance.currentUser = user;

    await expect(reauthenticateWithPassword('pw')).rejects.toThrow(
      'Too many attempts. Please wait a moment and try again.',
    );
  });
});

describe('sendPasswordResetEmail', () => {
  it('rejects empty email input', async () => {
    await expect(sendPasswordResetEmail('   ')).rejects.toThrow(
      'Please enter your email address.',
    );
    expect(authMock.sendPasswordResetEmail).not.toHaveBeenCalled();
  });

  it('sends a reset email for a trimmed address', async () => {
    await sendPasswordResetEmail(' user@example.com ');
    expect(authMock.sendPasswordResetEmail).toHaveBeenCalledWith(
      authMock.__authInstance,
      'user@example.com',
    );
  });

  it('maps user-not-found errors to a friendly message', async () => {
    authMock.sendPasswordResetEmail.mockRejectedValueOnce({
      code: 'auth/user-not-found',
    });

    await expect(sendPasswordResetEmail('x@y.com')).rejects.toThrow(
      'No account found with this email address.',
    );
  });

  it('maps invalid-email errors to a friendly message', async () => {
    authMock.sendPasswordResetEmail.mockRejectedValueOnce({
      code: 'auth/invalid-email',
    });

    await expect(sendPasswordResetEmail('bad-email')).rejects.toThrow(
      'Please enter a valid email address.',
    );
  });
});

describe('sendEmailVerificationEmail', () => {
  it('rejects when signed out', async () => {
    await expect(sendEmailVerificationEmail()).rejects.toThrow(
      'You must be signed in to verify your email.',
    );
  });

  it('sends a verification email for the current user', async () => {
    const user = authMock.__createMockUser({ emailVerified: false });
    authMock.__authInstance.currentUser = user;

    await sendEmailVerificationEmail();

    expect(authMock.sendEmailVerification).toHaveBeenCalledWith(user);
  });

  it('maps too-many-requests errors', async () => {
    authMock.__authInstance.currentUser = authMock.__createMockUser({
      emailVerified: false,
    });
    authMock.sendEmailVerification.mockRejectedValueOnce({
      code: 'auth/too-many-requests',
    });

    await expect(sendEmailVerificationEmail()).rejects.toThrow(
      'Too many attempts. Please wait a moment and try again.',
    );
  });
});
