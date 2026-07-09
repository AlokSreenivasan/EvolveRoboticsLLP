import type {
  DocumentData,
  FirebaseFirestoreTypes,
  UpdateData,
} from '@react-native-firebase/firestore';

import type {
  CreateUserProfileInput,
  UpdateUserProfileInput,
  UserProfile,
  UserProfileDocument,
} from '../../store/user/types';
import {
  DEFAULT_USER_ROLE,
  type RoleResolution,
} from '../../store/user/types/role.types';
import { normalizeUserRole } from '../../utils/role/normalizeUserRole';

export type UserProfileFetchResult = {
  profile: UserProfile | null;
  roleResolution: RoleResolution;
};
import { assertAuthenticatedUserId } from '../../utils/firebase/assertAuthenticated';
import {
  extractFirebaseErrorDetails,
  isFirebaseNotFoundError,
  logFirebaseOperationError,
  normalizeFirebaseErrorCode,
} from '../../utils/firebase/extractFirebaseError';
import {
  assertAuthUidMatches,
  syncFirestoreAuthSession,
} from '../../utils/firebase/firestoreSessionSync';
import {
  FirebaseServiceError,
  wrapFirebaseError,
} from '../../utils/firebase/errors';
import { FIRESTORE_COLLECTIONS } from './constants';
import {
  collection,
  db,
  doc,
  getDoc,
  getDocFromServer,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
} from './firestoreClient';

function usersCollection() {
  return collection(db, FIRESTORE_COLLECTIONS.users);
}

function mapDocumentToUserProfile(
  uid: string,
  data: UserProfileDocument,
): UserProfile {
  const { role } = normalizeUserRole(data.role);

  return {
    uid,
    fullName: data.fullName ?? '',
    email: data.email ?? '',
    phoneNumber: data.phoneNumber ?? '',
    profileImage: data.profileImage ?? null,
    schoolId: data.schoolId ?? null,
    grade: data.grade ?? null,
    track: data.track ?? null,
    role,
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
  return doc(usersCollection(), uid);
}

function normalizeOptionalString(
  value: string | null | undefined,
): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function buildProfileCreateInput(
  baseProfile: UserProfile,
  input: UpdateUserProfileInput,
): CreateUserProfileInput {
  return {
    fullName: (input.fullName ?? baseProfile.fullName).trim(),
    email: baseProfile.email.trim(),
    phoneNumber: (input.phoneNumber ?? baseProfile.phoneNumber).trim(),
    profileImage:
      input.profileImage !== undefined
        ? normalizeOptionalString(input.profileImage)
        : baseProfile.profileImage,
    schoolId:
      input.schoolId !== undefined
        ? normalizeOptionalString(input.schoolId)
        : baseProfile.schoolId,
    grade:
      input.grade !== undefined
        ? normalizeOptionalString(input.grade)
        : baseProfile.grade,
    track: input.track !== undefined ? input.track : baseProfile.track,
  };
}

function buildProfileUpdatePayload(
  input: UpdateUserProfileInput,
): Record<string, unknown> {
  const updates: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  };

  if (input.fullName !== undefined) {
    updates.fullName = input.fullName.trim();
  }
  if (input.phoneNumber !== undefined) {
    updates.phoneNumber = input.phoneNumber.trim();
  }
  if (input.profileImage !== undefined) {
    updates.profileImage = normalizeOptionalString(input.profileImage);
  }
  if (input.schoolId !== undefined) {
    updates.schoolId = normalizeOptionalString(input.schoolId);
  }
  if (input.grade !== undefined) {
    updates.grade = normalizeOptionalString(input.grade);
  }
  if (input.track !== undefined) {
    updates.track = input.track;
  }

  return updates;
}

function mapProfileUpdateFirestoreError(error: unknown): FirebaseServiceError {
  const normalized = normalizeFirebaseErrorCode(
    extractFirebaseErrorDetails(error).code,
  );

  if (normalized === 'permission-denied') {
    return new FirebaseServiceError(
      'FIRESTORE_ERROR',
      'Firestore denied this profile save. Sign out and sign in again, then retry. If it persists, ask an admin to deploy the latest firestore.rules.',
      error,
    );
  }

  if (normalized === 'unauthenticated') {
    return new FirebaseServiceError(
      'NOT_AUTHENTICATED',
      'Your session has expired. Please sign in again.',
      error,
    );
  }

  return wrapFirebaseError(
    error,
    'FIRESTORE_ERROR',
    'Failed to update user profile.',
  );
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
      schoolId: input.schoolId ?? null,
      grade: input.grade ?? null,
      track: input.track ?? null,
      role: DEFAULT_USER_ROLE,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(userDocRef(uid), payload);

    // Return merged profile locally — avoids an extra read after create.
    return {
      uid,
      fullName: payload.fullName,
      email: payload.email,
      phoneNumber: payload.phoneNumber,
      profileImage: payload.profileImage ?? null,
      schoolId: payload.schoolId,
      grade: payload.grade ?? null,
      track: payload.track ?? null,
      role: DEFAULT_USER_ROLE,
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
 * Reads users/{uid} with role normalization metadata (single Firestore read).
 */
export async function getUserProfileWithRoleResolution(
  uid: string,
): Promise<UserProfileFetchResult> {
  try {
    const snapshot = await getDoc(userDocRef(uid));
    if (!snapshot.exists()) {
      return {
        profile: null,
        roleResolution: normalizeUserRole(undefined, {
          profileDocumentMissing: true,
        }),
      };
    }

    const data = snapshot.data() as UserProfileDocument | undefined;
    if (!data) {
      return {
        profile: null,
        roleResolution: normalizeUserRole(undefined, {
          profileDocumentMissing: true,
        }),
      };
    }

    return {
      profile: mapDocumentToUserProfile(snapshot.id, data),
      roleResolution: normalizeUserRole(data.role),
    };
  } catch (error) {
    throw wrapFirebaseError(
      error,
      'FIRESTORE_ERROR',
      'Failed to load user profile.',
    );
  }
}

/**
 * Reads users/{uid}. Returns null if the document does not exist.
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const { profile } = await getUserProfileWithRoleResolution(uid);
  return profile;
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
    await syncFirestoreAuthSession();
    assertAuthUidMatches(uid);

    const snapshot = await getDoc(userDocRef(uid));
    if (!snapshot.exists()) {
      return createUserProfile(uid, buildProfileCreateInput(baseProfile, input));
    }

    const updates = buildProfileUpdatePayload(input);
    await updateDoc(userDocRef(uid), updates as UpdateData<DocumentData>);

    return mergeUserProfile(baseProfile, input);
  } catch (error) {
    throw mapProfileUpdateFirestoreError(error);
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
        ? normalizeOptionalString(input.profileImage)
        : base.profileImage,
    schoolId:
      input.schoolId !== undefined
        ? normalizeOptionalString(input.schoolId)
        : base.schoolId,
    grade:
      input.grade !== undefined
        ? normalizeOptionalString(input.grade)
        : base.grade,
    track: input.track !== undefined ? input.track : base.track,
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

/**
 * Permanently deletes users/{uid}. Caller must be authenticated as that user.
 * Idempotent: missing documents are treated as already deleted.
 */
function mapDeleteProfileFirestoreError(
  error: unknown,
  message?: string,
): FirebaseServiceError {
  const normalized = normalizeFirebaseErrorCode(
    extractFirebaseErrorDetails(error).code,
  );

  if (normalized === 'permission-denied') {
    return new FirebaseServiceError(
      'FIRESTORE_ERROR',
      'Firestore denied profile deletion. Deploy security rules (firebase deploy --only firestore:rules), sign in again, and retry.',
      error,
    );
  }

  if (normalized === 'unauthenticated') {
    return new FirebaseServiceError(
      'NOT_AUTHENTICATED',
      message ?? 'Your session has expired. Please sign in again.',
      error,
    );
  }

  return wrapFirebaseError(
    error,
    'FIRESTORE_ERROR',
    message ?? 'Failed to delete user profile.',
  );
}

/**
 * Permanently deletes users/{uid} using a transaction so read+delete share the same
 * authenticated server context (more reliable on iOS than a standalone delete() call).
 */
export async function deleteUserProfile(uid: string): Promise<void> {
  assertAuthUidMatches(uid);
  const ref = userDocRef(uid);

  try {
    const serverSnapshot = await getDocFromServer(ref);
    if (!serverSnapshot.exists()) {
      return;
    }
  } catch (error) {
    const { code, message } = extractFirebaseErrorDetails(error);
    const normalized = normalizeFirebaseErrorCode(code);

    if (isFirebaseNotFoundError(code)) {
      return;
    }

    logFirebaseOperationError('deleteUserProfile', 'serverRead', error);

    if (normalized === 'permission-denied' || normalized === 'unauthenticated') {
      throw mapDeleteProfileFirestoreError(error, message);
    }
  }

  try {
    await runTransaction(db, async transaction => {
      const snapshot = await transaction.get(ref);
      if (snapshot.exists()) {
        transaction.delete(ref);
      }
    });
  } catch (error) {
    const { code, message } = extractFirebaseErrorDetails(error);

    if (isFirebaseNotFoundError(code)) {
      return;
    }

    logFirebaseOperationError('deleteUserProfile', 'transactionDelete', error);
    throw mapDeleteProfileFirestoreError(error, message);
  }
}

/**
 * Deletes users/{uid} after forcing a server-side auth handshake (iOS recovery path).
 */
export async function deleteUserProfileWithSessionSync(uid: string): Promise<void> {
  const syncedUid = await syncFirestoreAuthSession();
  assertAuthUidMatches(uid);

  if (syncedUid !== uid) {
    throw new FirebaseServiceError(
      'NOT_AUTHENTICATED',
      'Session mismatch detected. Sign in again and retry account deletion.',
    );
  }

  await deleteUserProfile(uid);
}
