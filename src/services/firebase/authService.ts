import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

import {
  isGoogleAccountProvider,
  signOutGoogleSdk,
} from '../auth/googleSignInService';
import { getErrorMessage } from '../../utils/firebase/errors';

/**
 * Auth helpers and Firebase Authentication flows (session, password reset).
 * Login still uses sign-in directly on the login screen.
 */

function mapPasswordResetAuthError(error: {
  code?: string;
  message?: string;
}): string {
  switch (error.code) {
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/missing-email':
      return 'Please enter your email address.';
    case 'auth/user-not-found':
      return 'No account found with this email address.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment and try again.';
    default:
      return error.message ?? 'Could not send reset email. Please try again.';
  }
}

function toPasswordResetError(error: unknown): Error {
  const firebaseAuthError = error as { code?: string; message?: string };
  if (firebaseAuthError?.code?.startsWith('auth/')) {
    return new Error(mapPasswordResetAuthError(firebaseAuthError));
  }
  return new Error(getErrorMessage(error));
}
export function getAuthInstance() {
  return auth();
}

export function getCurrentUser(): FirebaseAuthTypes.User | null {
  return auth().currentUser;
}

export function getCurrentUserId(): string | null {
  return auth().currentUser?.uid ?? null;
}

export function getCurrentUserEmail(): string | null {
  return auth().currentUser?.email ?? null;
}

export function onAuthStateChanged(
  listener: (user: FirebaseAuthTypes.User | null) => void,
): () => void {
  return auth().onAuthStateChanged(listener);
}

export async function signOut(): Promise<void> {
  const user = getCurrentUser();
  const hadGoogleProvider = isGoogleAccountProvider(user);

  await auth().signOut();

  if (hadGoogleProvider) {
    await signOutGoogleSdk();
  }
}

export function hasEmailPasswordProvider(): boolean {
  const user = getCurrentUser();
  if (!user) {
    return false;
  }
  return user.providerData.some(
    provider => provider.providerId === 'password',
  );
}

function mapReauthenticateAuthError(error: {
  code?: string;
  message?: string;
}): string {
  switch (error.code) {
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Password is incorrect.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment and try again.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.';
    case 'auth/user-mismatch':
      return 'Account mismatch. Please sign in again.';
    default:
      return error.message ?? 'Could not verify your identity. Please try again.';
  }
}

function toReauthenticateError(error: unknown): Error {
  const firebaseAuthError = error as { code?: string; message?: string };
  if (firebaseAuthError?.code?.startsWith('auth/')) {
    return new Error(mapReauthenticateAuthError(firebaseAuthError));
  }
  return new Error(getErrorMessage(error));
}

/**
 * Re-authenticates the current user with email/password (required before sensitive actions).
 */
export async function reauthenticateWithPassword(
  currentPassword: string,
): Promise<void> {
  const user = getCurrentUser();
  const email = getCurrentUserEmail();

  if (!user || !email) {
    throw new Error('You must be signed in to continue.');
  }

  if (!hasEmailPasswordProvider()) {
    throw new Error(
      'Re-authentication is only available for email and password accounts.',
    );
  }

  try {
    const credential = auth.EmailAuthProvider.credential(
      email,
      currentPassword,
    );
    await user.reauthenticateWithCredential(credential);
    await refreshAuthSessionForSensitiveOperation();
  } catch (error) {
    throw toReauthenticateError(error);
  }
}

/**
 * Refreshes the auth session so Firestore/Storage on iOS use a current ID token
 * immediately after re-authentication (avoids permission-denied on delete).
 */
export async function refreshAuthSessionForSensitiveOperation(): Promise<void> {
  const user = getCurrentUser();
  if (!user) {
    return;
  }

  await user.reload();
  await user.getIdToken(true);

  if (__DEV__) {
    console.log('[refreshAuthSessionForSensitiveOperation]', { uid: user.uid });
  }
}

/**
 * Sends a Firebase password reset email to the given address.
 * Does not sign the user in or out; safe for the forgot-password flow.
 */
export async function sendPasswordResetEmail(email: string): Promise<void> {
  const trimmedEmail = email.trim();

  if (!trimmedEmail) {
    throw new Error('Please enter your email address.');
  }

  try {
    await auth().sendPasswordResetEmail(trimmedEmail);
  } catch (error) {
    throw toPasswordResetError(error);
  }
}
