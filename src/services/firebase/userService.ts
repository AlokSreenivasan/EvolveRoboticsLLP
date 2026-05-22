import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';

import type {
  CreateUserProfileInput,
  UpdateUserProfileInput,
  UserProfile,
  UserProfileDocument,
} from '../../store/user/types';
import { assertAuthenticatedUserId } from '../../utils/firebase/assertAuthenticated';
import {
  FirebaseServiceError,
  wrapFirebaseError,
} from '../../utils/firebase/errors';
import { FIRESTORE_COLLECTIONS } from './constants';

function usersCollection() {
  return firestore().collection(FIRESTORE_COLLECTIONS.users);
}

function mapDocumentToUserProfile(
  uid: string,
  data: UserProfileDocument,
): UserProfile {
  return {
    uid,
    fullName: data.fullName ?? '',
    email: data.email ?? '',
    phoneNumber: data.phoneNumber ?? '',
    profileImage: data.profileImage ?? null,
    createdAt: isTimestamp(data.createdAt) ? data.createdAt : null,
    updatedAt: isTimestamp(data.updatedAt) ? data.updatedAt : null,
  };
}

function isTimestamp(
  value: UserProfileDocument['createdAt'],
): value is FirebaseFirestoreTypes.Timestamp {
  return (
    value != null &&
    typeof value === 'object' &&
    'toDate' in value &&
    typeof (value as FirebaseFirestoreTypes.Timestamp).toDate === 'function'
  );
}

function userDocRef(uid: string) {
  return usersCollection().doc(uid);
}

/**
 * Creates users/{uid} only when the document does not already exist.
 * Prevents duplicate writes on retries.
 */
export async function createUserProfileIfNotExists(
  uid: string,
  input: CreateUserProfileInput,
): Promise<UserProfile> {
  const existing = await getUserProfile(uid);
  if (existing) {
    return existing;
  }
  return createUserProfile(uid, input);
}

/**
 * Creates users/{uid} with server timestamps.
 */
export async function createUserProfile(
  uid: string,
  input: CreateUserProfileInput,
): Promise<UserProfile> {
  try {
    const payload: UserProfileDocument = {
      fullName: input.fullName.trim(),
      email: input.email.trim(),
      phoneNumber: input.phoneNumber.trim(),
      profileImage: input.profileImage ?? null,
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    };

    await userDocRef(uid).set(payload);

    // Return merged profile locally — avoids an extra read after create.
    return {
      uid,
      fullName: payload.fullName,
      email: payload.email,
      phoneNumber: payload.phoneNumber,
      profileImage: payload.profileImage ?? null,
      createdAt: null,
      updatedAt: null,
    };
  } catch (error) {
    throw wrapFirebaseError(
      error,
      'FIRESTORE_ERROR',
      'Failed to create user profile.',
    );
  }
}

/**
 * Reads users/{uid}. Returns null if the document does not exist.
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const snapshot = await userDocRef(uid).get();
    if (!snapshot.exists) {
      return null;
    }
    const data = snapshot.data() as UserProfileDocument | undefined;
    if (!data) {
      return null;
    }
    return mapDocumentToUserProfile(snapshot.id, data);
  } catch (error) {
    throw wrapFirebaseError(
      error,
      'FIRESTORE_ERROR',
      'Failed to load user profile.',
    );
  }
}

/**
 * Fetches the profile for the currently signed-in user.
 */
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const uid = assertAuthenticatedUserId();
  return getUserProfile(uid);
}

/**
 * Updates users/{uid} and returns a merged profile (avoids an extra Firestore read).
 */
export async function updateUserProfile(
  uid: string,
  input: UpdateUserProfileInput,
  baseProfile: UserProfile,
): Promise<UserProfile> {
  try {
    const updates: Record<string, unknown> = {
      updatedAt: firestore.FieldValue.serverTimestamp(),
    };

    if (input.fullName !== undefined) {
      updates.fullName = input.fullName.trim();
    }
    if (input.phoneNumber !== undefined) {
      updates.phoneNumber = input.phoneNumber.trim();
    }
    if (input.profileImage !== undefined) {
      updates.profileImage = input.profileImage;
    }

    await userDocRef(uid).update(updates);

    return mergeUserProfile(baseProfile, input);
  } catch (error) {
    throw wrapFirebaseError(
      error,
      'FIRESTORE_ERROR',
      'Failed to update user profile.',
    );
  }
}

function mergeUserProfile(
  base: UserProfile,
  input: UpdateUserProfileInput,
): UserProfile {
  return {
    ...base,
    fullName:
      input.fullName !== undefined ? input.fullName.trim() : base.fullName,
    phoneNumber:
      input.phoneNumber !== undefined
        ? input.phoneNumber.trim()
        : base.phoneNumber,
    profileImage:
      input.profileImage !== undefined
        ? input.profileImage
        : base.profileImage,
  };
}

/**
 * Updates the profile for the currently signed-in user.
 */
export async function updateCurrentUserProfile(
  input: UpdateUserProfileInput,
  baseProfile: UserProfile,
): Promise<UserProfile> {
  const uid = assertAuthenticatedUserId();
  return updateUserProfile(uid, input, baseProfile);
}
