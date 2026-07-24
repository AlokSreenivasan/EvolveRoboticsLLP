import {
  isGoogleAccountProvider,
  isGoogleSignInCancelled,
  signInWithGoogle,
  signOutGoogleSdk,
} from '../googleSignInService';

import * as authModule from '@react-native-firebase/auth';
import * as googleModule from '@react-native-google-signin/google-signin';
import * as userService from '../../firebase/userService';

jest.mock('../../firebase/userService', () => ({
  createUserProfileIfNotExists: jest.fn(() =>
    Promise.resolve({
      uid: 'test-uid',
      fullName: 'Test User',
      email: 'test@example.com',
      phoneNumber: '',
      profileImage: null,
      schoolId: null,
      grade: null,
      track: null,
      role: 'student',
      createdAt: null,
      updatedAt: null,
    }),
  ),
}));

// Plain imports resolve to the manual mocks in __mocks__/ and share the
// instance the service module sees (jest.requireMock would create a copy).
const authMock = authModule as any;
const googleMock = googleModule as any;
const createUserProfileIfNotExists =
  userService.createUserProfileIfNotExists as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  authMock.__authInstance.currentUser = null;
  authMock.signInWithCredential.mockImplementation(() =>
    Promise.resolve({
      user: authMock.__createMockUser({
        providerData: [{ providerId: 'google.com' }],
        photoURL: 'https://example.com/photo.jpg',
      }),
    }),
  );
});

describe('isGoogleAccountProvider', () => {
  it('detects google provider data', () => {
    expect(
      isGoogleAccountProvider(
        authMock.__createMockUser({
          providerData: [{ providerId: 'google.com' }],
        }),
      ),
    ).toBe(true);
  });

  it('is false for password accounts and missing users', () => {
    expect(isGoogleAccountProvider(authMock.__createMockUser())).toBe(false);
    expect(isGoogleAccountProvider(null)).toBe(false);
    expect(isGoogleAccountProvider(undefined)).toBe(false);
  });
});

describe('signInWithGoogle', () => {
  it('exchanges the Google idToken for a Firebase credential', async () => {
    await signInWithGoogle();

    expect(googleMock.GoogleSignin.hasPlayServices).toHaveBeenCalled();
    expect(googleMock.GoogleSignin.signIn).toHaveBeenCalled();
    expect(authMock.GoogleAuthProvider.credential).toHaveBeenCalledWith(
      'mock-google-id-token',
    );
    expect(authMock.signInWithCredential).toHaveBeenCalled();
    expect(createUserProfileIfNotExists).toHaveBeenCalledWith('test-uid', {
      fullName: 'Test User',
      email: 'test@example.com',
      phoneNumber: '',
      profileImage: 'https://example.com/photo.jpg',
    });
  });

  it('still completes sign-in if Firestore profile creation fails', async () => {
    createUserProfileIfNotExists.mockRejectedValueOnce(
      new Error('permission-denied'),
    );

    await expect(signInWithGoogle()).resolves.toBeUndefined();
    expect(authMock.signInWithCredential).toHaveBeenCalled();
  });

  it('throws a cancellation error when the user dismisses the dialog', async () => {
    googleMock.GoogleSignin.signIn.mockResolvedValueOnce({ type: 'cancelled' });

    let thrown: unknown;
    try {
      await signInWithGoogle();
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeDefined();
    expect(isGoogleSignInCancelled(thrown)).toBe(true);
    expect(authMock.signInWithCredential).not.toHaveBeenCalled();
    expect(createUserProfileIfNotExists).not.toHaveBeenCalled();
  });

  it('falls back to getTokens when the sign-in response has no idToken', async () => {
    googleMock.GoogleSignin.signIn.mockResolvedValueOnce({
      type: 'success',
      data: { idToken: null, user: {} },
    });

    await signInWithGoogle();

    expect(googleMock.GoogleSignin.getTokens).toHaveBeenCalled();
    expect(authMock.GoogleAuthProvider.credential).toHaveBeenCalledWith(
      'mock-google-id-token',
    );
  });

  it('throws when no idToken can be obtained at all', async () => {
    googleMock.GoogleSignin.signIn.mockResolvedValueOnce({
      type: 'success',
      data: { idToken: null, user: {} },
    });
    googleMock.GoogleSignin.getTokens.mockResolvedValueOnce({ idToken: null });

    await expect(signInWithGoogle()).rejects.toThrow(
      'Google Sign-In failed. Missing idToken.',
    );
  });
});

describe('signOutGoogleSdk', () => {
  it('signs out of the Google SDK when a previous session exists', async () => {
    googleMock.GoogleSignin.hasPreviousSignIn.mockReturnValueOnce(true);

    await signOutGoogleSdk();

    expect(googleMock.GoogleSignin.signOut).toHaveBeenCalled();
  });

  it('does nothing without a previous session', async () => {
    googleMock.GoogleSignin.hasPreviousSignIn.mockReturnValueOnce(false);

    await signOutGoogleSdk();

    expect(googleMock.GoogleSignin.signOut).not.toHaveBeenCalled();
  });

  it('swallows SDK errors (Firebase session is already cleared)', async () => {
    googleMock.GoogleSignin.hasPreviousSignIn.mockImplementationOnce(() => {
      throw new Error('native failure');
    });

    await expect(signOutGoogleSdk()).resolves.toBeUndefined();
  });
});

describe('isGoogleSignInCancelled', () => {
  it('matches only the cancellation status code', () => {
    expect(
      isGoogleSignInCancelled({ code: googleMock.statusCodes.SIGN_IN_CANCELLED }),
    ).toBe(true);
    expect(isGoogleSignInCancelled({ code: 'OTHER' })).toBe(false);
    expect(isGoogleSignInCancelled(new Error('plain'))).toBe(false);
    expect(isGoogleSignInCancelled(null)).toBe(false);
  });
});
