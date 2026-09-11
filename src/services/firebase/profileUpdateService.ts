import type { UserProfile } from '../../store/user/types';
import type { CourseTrack } from '../../store/content/types/courses.types';
import { isLocalImageUri } from '../../utils/profile/mapUserProfile';
import { wrapFirebaseError } from '../../utils/firebase/errors';
import { getCurrentUser } from './authService';
import {
  deleteProfileImageByUrlSafe,
  uploadProfileImage,
} from './storageService';
import { updateUserProfile } from './userService';

export type ProfileEditPayload = {
  fullName: string;
  phoneNumber: string;
  track: CourseTrack | null;
  /** Local picker URI or existing remote download URL. */
  photoUri: string | null;
  schoolId: string | null;
  grade: string | null;
  birthYear?: number | null;
  parentalConsentAtMs?: number | null;
};

function buildOptimisticProfile(
  current: UserProfile,
  payload: ProfileEditPayload,
  nextImageUrl: string | null,
): UserProfile {
  return {
    ...current,
    fullName: payload.fullName.trim(),
    phoneNumber: payload.phoneNumber.trim(),
    track: payload.track,
    profileImage: nextImageUrl,
    schoolId: payload.schoolId,
    grade: payload.grade,
    ...(payload.birthYear !== undefined ? { birthYear: payload.birthYear } : {}),
    ...(payload.parentalConsentAtMs !== undefined
      ? { parentalConsentAtMs: payload.parentalConsentAtMs }
      : {}),
  };
}

function shouldReplaceStoredImage(
  previousUrl: string | null,
  nextUrl: string | null,
): boolean {
  if (!previousUrl?.trim()) {
    return false;
  }
  if (!nextUrl?.trim()) {
    return true;
  }
  return previousUrl.trim() !== nextUrl.trim();
}

async function syncAuthDisplayName(fullName: string): Promise<void> {
  const currentUser = getCurrentUser();
  if (!currentUser || currentUser.displayName === fullName) {
    return;
  }
  try {
    await currentUser.updateProfile({ displayName: fullName });
  } catch {
    // Non-blocking; Firestore remains source of truth for profile fields.
  }
}

/**
 * Uploads image when needed, updates Firestore once, and optionally removes the prior Storage object.
 */
export async function updateUserProfileWithSync(
  currentProfile: UserProfile,
  payload: ProfileEditPayload,
): Promise<UserProfile> {
  const uid = currentProfile.uid;
  const previousImageUrl = currentProfile.profileImage;
  let nextImageUrl = payload.photoUri?.trim() || null;

  try {
    if (isLocalImageUri(payload.photoUri) && payload.photoUri) {
      nextImageUrl = await uploadProfileImage(uid, payload.photoUri);
    }

    const updated = await updateUserProfile(
      uid,
      {
        fullName: payload.fullName,
        phoneNumber: payload.phoneNumber,
        track: payload.track,
        profileImage: nextImageUrl,
        schoolId: payload.schoolId,
        grade: payload.grade,
        ...(payload.birthYear !== undefined
          ? { birthYear: payload.birthYear }
          : {}),
        ...(payload.parentalConsentAtMs !== undefined
          ? { parentalConsentAtMs: payload.parentalConsentAtMs }
          : {}),
      },
      currentProfile,
    );

    if (shouldReplaceStoredImage(previousImageUrl, nextImageUrl)) {
      await deleteProfileImageByUrlSafe(previousImageUrl);
    }

    await syncAuthDisplayName(updated.fullName);

    return updated;
  } catch (error) {
    throw wrapFirebaseError(
      error,
      'FIRESTORE_ERROR',
      'Failed to save profile changes.',
    );
  }
}

export function buildOptimisticProfileFromEdit(
  currentProfile: UserProfile,
  payload: ProfileEditPayload,
): UserProfile {
  const nextImage =
    isLocalImageUri(payload.photoUri) && payload.photoUri
      ? payload.photoUri
      : payload.photoUri?.trim() || null;

  return buildOptimisticProfile(currentProfile, payload, nextImage);
}
