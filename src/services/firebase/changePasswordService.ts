import { EmailAuthProvider } from '@react-native-firebase/auth';

import {
  getCurrentUser,
  getCurrentUserEmail,
  hasEmailPasswordProvider,
} from './authService';
import { getErrorMessage } from '../../utils/firebase/errors';

export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
};

function mapChangePasswordAuthError(error: {
  code?: string;
  message?: string;
}): string {
  switch (error.code) {
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Current password is incorrect.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.';
    case 'auth/requires-recent-login':
      return 'Your session has expired. Please sign in again and try updating your password.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment and try again.';
    case 'auth/user-mismatch':
      return 'Account mismatch. Please sign in again.';
    case 'auth/user-not-found':
      return 'Account not found. Please sign in again.';
    default:
      return error.message ?? 'Could not update password. Please try again.';
  }
}

function toChangePasswordError(error: unknown): Error {
  const firebaseAuthError = error as { code?: string; message?: string };
  if (firebaseAuthError?.code?.startsWith('auth/')) {
    return new Error(mapChangePasswordAuthError(firebaseAuthError));
  }
  return new Error(getErrorMessage(error));
}

/**
 * Re-authenticates with the current password, then updates to the new password.
 * Keeps the user signed in on success; does not touch Firestore profile data.
 */
export async function changePassword(input: ChangePasswordInput): Promise<void> {
  const user = getCurrentUser();
  const email = getCurrentUserEmail();

  if (!user || !email) {
    throw new Error('You must be signed in to change your password.');
  }

  if (!hasEmailPasswordProvider()) {
    throw new Error(
      'Password change is only available for accounts signed in with email and password.',
    );
  }

  try {
    const credential = EmailAuthProvider.credential(
      email,
      input.currentPassword,
    );
    await user.reauthenticateWithCredential(credential);
    await user.updatePassword(input.newPassword);
  } catch (error) {
    throw toChangePasswordError(error);
  }
}
