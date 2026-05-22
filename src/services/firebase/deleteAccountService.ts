import {
  extractFirebaseErrorDetails,
  logFirebaseOperationError,
  normalizeFirebaseErrorCode,
} from '../../utils/firebase/extractFirebaseError';
import { syncFirestoreAuthSession } from '../../utils/firebase/firestoreSessionSync';
import { FirebaseServiceError, getErrorMessage } from '../../utils/firebase/errors';
import { clearLocalUserSessionData } from '../sessionCleanup';
import {
  getCurrentUser,
  hasEmailPasswordProvider,
  reauthenticateWithPassword,
  refreshAuthSessionForSensitiveOperation,
} from './authService';
import { deleteAllUserProfileImages } from './storageService';
import {
  deleteUserProfileWithSessionSync,
  getUserProfile,
} from './userService';

export type DeleteAccountInput = {
  /** Required for email/password accounts to satisfy Firebase recent-login policy. */
  currentPassword?: string;
};

function mapDeleteAccountAuthError(error: {
  code?: string;
  message?: string;
}): string {
  switch (error.code) {
    case 'auth/requires-recent-login':
      return 'Your session has expired. Enter your password to confirm account deletion.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Password is incorrect.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment and try again.';
    case 'auth/user-not-found':
      return 'Account not found. Please sign in again.';
    default:
      return error.message ?? 'Could not delete account. Please try again.';
  }
}

function mapDeleteAccountError(error: unknown, stage: string): Error {
  const { code, message } = extractFirebaseErrorDetails(error);
  const normalized = normalizeFirebaseErrorCode(code);

  logFirebaseOperationError('deleteAccount', stage, error);

  if (error instanceof FirebaseServiceError) {
    switch (error.code) {
      case 'FIRESTORE_ERROR':
        if (normalized === 'permission-denied') {
          return new Error(
            'Firestore denied profile deletion. Deploy rules with `firebase deploy --only firestore:rules`, then sign in again and retry.',
          );
        }
        if (normalized === 'unauthenticated') {
          return new Error('Your session has expired. Please sign in again.');
        }
        return new Error(
          message ??
            'Could not remove your profile data. Sign in again and retry.',
        );
      case 'NOT_AUTHENTICATED':
        return new Error('Your session has expired. Please sign in again.');
      case 'STORAGE_ERROR':
        return new Error(
          message ??
            'Could not remove your profile photo. You can retry account deletion.',
        );
      default:
        return new Error(error.message);
    }
  }

  const firebaseAuthError = error as { code?: string; message?: string };
  if (firebaseAuthError?.code?.startsWith('auth/')) {
    return new Error(mapDeleteAccountAuthError(firebaseAuthError));
  }

  if (normalized === 'permission-denied') {
    return new Error(
      'Firestore denied profile deletion. Deploy rules with `firebase deploy --only firestore:rules`, then sign in again and retry.',
    );
  }

  if (normalized === 'unauthenticated') {
    return new Error('Your session has expired. Please sign in again.');
  }

  if (normalized === 'requires-recent-login') {
    return new Error(
      'Your session has expired. Enter your password to confirm account deletion.',
    );
  }

  return new Error(
    message ?? getErrorMessage(error) ?? 'Could not delete account. Please try again.',
  );
}

async function deleteUserProfileWithAuthRetry(uid: string): Promise<void> {
  try {
    await deleteUserProfileWithSessionSync(uid);
  } catch (error) {
    const normalized = normalizeFirebaseErrorCode(
      extractFirebaseErrorDetails(error).code,
    );

    if (normalized !== 'permission-denied' && normalized !== 'unauthenticated') {
      throw error;
    }

    logFirebaseOperationError(
      'deleteAccount',
      'deleteFirestoreRetry',
      error,
    );

    await refreshAuthSessionForSensitiveOperation();
    await deleteUserProfileWithSessionSync(uid);
  }
}

/**
 * Permanently deletes user data in a stable cross-platform sequence:
 * Firestore profile → Storage assets → Firebase Auth user → local caches.
 */
export async function deleteAccount(
  input: DeleteAccountInput = {},
): Promise<void> {
  if (!getCurrentUser()) {
    throw new Error('You must be signed in to delete your account.');
  }

  const requiresPassword = hasEmailPasswordProvider();

  if (requiresPassword && !input.currentPassword?.trim()) {
    throw new Error('Enter your current password to confirm account deletion.');
  }

  let profileImageUrl: string | null | undefined;

  try {
    if (requiresPassword && input.currentPassword) {
      await reauthenticateWithPassword(input.currentPassword);
    } else {
      await refreshAuthSessionForSensitiveOperation();
    }

    const uid = await syncFirestoreAuthSession();

    const profile = await getUserProfile(uid).catch(error => {
      logFirebaseOperationError('deleteAccount', 'loadProfile', error);
      return null;
    });
    profileImageUrl = profile?.profileImage;

    await deleteUserProfileWithAuthRetry(uid);
    await deleteAllUserProfileImages(uid, profileImageUrl);

    const authUser = getCurrentUser();
    if (!authUser) {
      throw new Error('Your session ended before account deletion completed.');
    }

    await authUser.delete();
    await clearLocalUserSessionData();
  } catch (error) {
    const stage = inferDeleteAccountFailureStage(error);
    const mapped = mapDeleteAccountError(error, stage);

    if (
      requiresPassword &&
      !input.currentPassword?.trim() &&
      mapped.message.includes('recent-login')
    ) {
      throw new Error(
        'Enter your current password to confirm account deletion.',
      );
    }

    throw mapped;
  }
}

function inferDeleteAccountFailureStage(error: unknown): string {
  if (error instanceof FirebaseServiceError) {
    switch (error.code) {
      case 'FIRESTORE_ERROR':
        return 'deleteFirestore';
      case 'STORAGE_ERROR':
        return 'deleteStorage';
      case 'NOT_AUTHENTICATED':
        return 'authSession';
      default:
        return 'unknown';
    }
  }

  const { code } = extractFirebaseErrorDetails(error);
  if (code?.startsWith('auth/')) {
    return 'deleteAuthUser';
  }
  if (code?.includes('firestore')) {
    return 'deleteFirestore';
  }
  if (code?.includes('storage')) {
    return 'deleteStorage';
  }

  return 'unknown';
}
