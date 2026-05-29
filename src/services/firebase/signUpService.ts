import {
  createUserWithEmailAndPassword,
  getAuth,
} from '@react-native-firebase/auth';
import type { FirebaseAuthTypes } from '@react-native-firebase/auth';

import type { UserProfile } from '../../store/user/types';
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
      return 'Password must be at least 6 characters.';
    case 'auth/operation-not-allowed':
      return 'Email/password sign-up is not enabled in Firebase.';
    default:
      return error.message ?? 'Sign up failed. Please try again.';
  }
}

function toSignUpError(error: unknown): Error {
  const firebaseAuthError = error as { code?: string; message?: string };
  if (firebaseAuthError?.code?.startsWith('auth/')) {
    return new Error(mapAuthError(firebaseAuthError));
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

    return profile;
  } catch (error) {
    if (credential?.user) {
      await rollbackAuthUser(credential.user);
    }
    throw toSignUpError(error);
  }
}
