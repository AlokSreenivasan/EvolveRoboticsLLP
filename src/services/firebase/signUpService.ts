import {
  createUserWithEmailAndPassword,
  getAuth,
  sendEmailVerification,
} from '@react-native-firebase/auth';
import type { FirebaseAuthTypes } from '@react-native-firebase/auth';

import { PASSWORD_REQUIREMENTS_MESSAGE } from '../../domain/Auth/validation/isValidPassword';
import type { UserProfile } from '../../store/user/types';
import {
  extractFirebaseErrorDetails,
  normalizeFirebaseErrorCode,
} from '../../utils/firebase/extractFirebaseError';
import { getErrorMessage } from '../../utils/firebase/errors';
import { uploadProfileImage } from './storageService';
import { createUserProfileIfNotExists } from './userService';

const firebaseAuth = getAuth();

export type SignUpWithProfileInput = {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
  /** Local file URI from image picker; uploaded only when provided. */
  profileImageLocalUri?: string | null;
};

function mapAuthError(error: { code?: string; message?: string }): string {
  switch (error.code) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/weak-password':
      return PASSWORD_REQUIREMENTS_MESSAGE;
    case 'auth/operation-not-allowed':
      return 'Email/password sign-up is not enabled in Firebase.';
    default:
      return error.message ?? 'Sign up failed. Please try again.';
  }
}

function mapProfilePersistenceError(error: unknown): string | null {
  const details = extractFirebaseErrorDetails(error);
  const nested =
    error instanceof Error && 'cause' in error
      ? extractFirebaseErrorDetails((error as { cause?: unknown }).cause)
      : { code: undefined, message: undefined };
  const codes = [details.code, nested.code]
    .map(normalizeFirebaseErrorCode)
    .filter(Boolean);
  const message = `${details.message ?? ''} ${nested.message ?? ''}`;

  if (
    codes.includes('unavailable') ||
    /firestore\/unavailable/i.test(message) ||
    /The service is currently unavailable/i.test(message)
  ) {
    return (
      'Cloud Firestore is not set up for this Firebase project. ' +
      'In Firebase Console → Build → Firestore Database, create the default database, ' +
      'then deploy rules (firebase deploy --only firestore) and try again.'
    );
  }

  if (codes.includes('permission-denied')) {
    return (
      'Firestore denied profile creation. Deploy security rules for this project ' +
      '(firebase deploy --only firestore:rules) and try again.'
    );
  }

  return null;
}

function toSignUpError(error: unknown): Error {
  const firebaseAuthError = error as { code?: string; message?: string };
  if (firebaseAuthError?.code?.startsWith('auth/')) {
    return new Error(mapAuthError(firebaseAuthError));
  }
  const profileMessage = mapProfilePersistenceError(error);
  if (profileMessage) {
    return new Error(profileMessage);
  }
  return new Error(getErrorMessage(error));
}

async function rollbackAuthUser(user: FirebaseAuthTypes.User): Promise<void> {
  try {
    await user.delete();
  } catch {
    // Best-effort cleanup when Firestore/Storage fails after Auth creation.
  }
}

/**
 * Production sign-up: Firebase Auth → optional Storage upload → Firestore users/{uid}.
 * Rolls back the Auth user if profile persistence fails (retry-safe).
 */
export async function signUpWithProfile(
  input: SignUpWithProfileInput,
): Promise<UserProfile> {
  const email = input.email.trim();
  const fullName = input.fullName.trim();
  const phoneNumber = input.phoneNumber.trim();
  const localImageUri = input.profileImageLocalUri?.trim() || null;

  let credential: FirebaseAuthTypes.UserCredential | null = null;

  try {
    credential = await createUserWithEmailAndPassword(
      firebaseAuth,
      email,
      input.password,
    );

    const { uid } = credential.user;

    await credential.user.updateProfile({
      displayName: fullName,
    });

    let profileImageUrl: string | null = null;
    if (localImageUri) {
      profileImageUrl = await uploadProfileImage(uid, localImageUri);
    }

    const profile = await createUserProfileIfNotExists(uid, {
      fullName,
      email,
      phoneNumber,
      profileImage: profileImageUrl,
    });

    try {
      await sendEmailVerification(credential.user);
    } catch {
      // Account is created; the verify-email screen can resend.
    }

    return profile;
  } catch (error) {
    if (credential?.user) {
      await rollbackAuthUser(credential.user);
    }
    throw toSignUpError(error);
  }
}
