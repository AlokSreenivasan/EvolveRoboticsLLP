import {
  EmailAuthProvider,
  getAuth,
  getIdToken,
  onAuthStateChanged as subscribeToAuthStateChanged,
  reload,
  sendEmailVerification as sendFirebaseEmailVerification,
  sendPasswordResetEmail as sendFirebasePasswordResetEmail,
  signInWithEmailAndPassword as signInWithEmailAndPasswordModular,
  signOut as signOutFirebase,
} from '@react-native-firebase/auth';
import type { FirebaseAuthTypes } from '@react-native-firebase/auth';

import { requiresEmailVerification } from '../../domain/Auth/requiresEmailVerification';
import {
  isGoogleAccountProvider,
  signOutGoogleSdk,
} from '../auth/googleSignInService';
import { getErrorMessage } from '../../utils/firebase/errors';

const firebaseAuth = getAuth();

/**
 * Auth helpers and Firebase Authentication flows (session, password reset).
 */

export async function signInWithEmailPassword(
  email: string,
  password: string,
): Promise<{ needsEmailVerification: boolean }> {
  await signInWithEmailAndPasswordModular(
    firebaseAuth,
    email.trim(),
    password,
  );

  const user = getCurrentUser();
  if (user) {
    await reload(user);
  }

  return {
    needsEmailVerification: requiresEmailVerification(getCurrentUser()),
  };
}

function mapEmailVerificationAuthError(error: {
  code?: string;
  message?: string;
}): string {
  switch (error.code) {
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment and try again.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.';
    default:
      return error.message ?? 'Could not send the verification email. Please try again.';
  }
}

/**
 * Sends Firebase's verification email for the signed-in email/password user.
 */
export async function sendEmailVerificationEmail(): Promise<void> {
  const user = getCurrentUser();
  if (!user) {
    throw new Error('You must be signed in to verify your email.');
  }

  try {
    await sendFirebaseEmailVerification(user);
  } catch (error) {
    const firebaseAuthError = error as { code?: string; message?: string };
    if (firebaseAuthError?.code?.startsWith('auth/')) {
      throw new Error(mapEmailVerificationAuthError(firebaseAuthError));
    }
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Reloads the Firebase user so `emailVerified` reflects a clicked inbox link.
 */
export async function reloadEmailVerificationStatus(): Promise<boolean> {
  const user = getCurrentUser();
  if (!user) {
    return false;
  }

  await reload(user);
  return !requiresEmailVerification(getCurrentUser());
}

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
  return firebaseAuth;
}

export function getCurrentUser(): FirebaseAuthTypes.User | null {
  return firebaseAuth.currentUser;
}

export function getCurrentUserId(): string | null {
  return firebaseAuth.currentUser?.uid ?? null;
}

export function getCurrentUserEmail(): string | null {
  return firebaseAuth.currentUser?.email ?? null;
}

export function onAuthStateChanged(
  listener: (user: FirebaseAuthTypes.User | null) => void,
): () => void {
  return subscribeToAuthStateChanged(firebaseAuth, listener);
}

export async function signOut(): Promise<void> {
  const user = getCurrentUser();
  const hadGoogleProvider = isGoogleAccountProvider(user);

  await signOutFirebase(firebaseAuth);

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
    const credential = EmailAuthProvider.credential(
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

  await reload(user);
  await getIdToken(user, true);

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
    await sendFirebasePasswordResetEmail(firebaseAuth, trimmedEmail);
  } catch (error) {
    throw toPasswordResetError(error);
  }
}
