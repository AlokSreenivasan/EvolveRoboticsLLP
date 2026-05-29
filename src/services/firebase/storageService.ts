import storage from '@react-native-firebase/storage';

import { assertAuthenticatedUserId } from '../../utils/firebase/assertAuthenticated';
import { syncFirestoreAuthSession } from '../../utils/firebase/firestoreSessionSync';
import {
  extractFirebaseErrorDetails,
  isFirebaseNotFoundError,
  logFirebaseOperationError,
} from '../../utils/firebase/extractFirebaseError';
import { wrapFirebaseError } from '../../utils/firebase/errors';
import { isFirebaseStorageUrl } from '../../utils/profile/isFirebaseStorageUrl';
import { STORAGE_PATHS } from './constants';

function resolveFileExtension(localUri: string): string {
  const match = localUri.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
  const ext = match?.[1]?.toLowerCase();
  if (ext === 'png') {
    return '.png';
  }
  if (ext === 'webp') {
    return '.webp';
  }
  if (ext === 'heic' || ext === 'heif') {
    return '.jpg';
  }
  return '.jpg';
}

function resolveContentType(localUri: string): string {
  const ext = resolveFileExtension(localUri).replace('.', '');
  if (ext === 'png') {
    return 'image/png';
  }
  if (ext === 'webp') {
    return 'image/webp';
  }
  return 'image/jpeg';
}

function buildProfileImageRef(uid: string, localUri: string) {
  const extension = resolveFileExtension(localUri);
  return storage().ref(STORAGE_PATHS.userProfileImage(uid, extension));
}

function buildContinueLearningThumbnailRef(
  uid: string,
  playlistId: string,
  localUri: string,
) {
  const extension = resolveFileExtension(localUri);
  return storage().ref(
    STORAGE_PATHS.continueLearningThumbnail(uid, playlistId, extension),
  );
}

function buildCourseThumbnailRef(
  uid: string,
  courseId: string,
  localUri: string,
) {
  const extension = resolveFileExtension(localUri);
  return storage().ref(
    STORAGE_PATHS.courseThumbnail(uid, courseId, extension),
  );
}

/**
 * Uploads a local image URI to Firebase Storage and returns the download URL.
 * Works with file paths returned by react-native-image-picker on iOS and Android.
 */
export async function uploadProfileImage(
  uid: string,
  localFileUri: string,
): Promise<string> {
  try {
    const trimmedUri = localFileUri.trim();
    if (!trimmedUri) {
      throw new Error('A valid local image URI is required.');
    }

    const reference = buildProfileImageRef(uid, trimmedUri);
    await reference.putFile(trimmedUri, {
      contentType: resolveContentType(trimmedUri),
    });
    return reference.getDownloadURL();
  } catch (error) {
    throw wrapFirebaseError(
      error,
      'UPLOAD_FAILED',
      'Failed to upload profile image.',
    );
  }
}

/**
 * Uploads a profile image for the currently signed-in user.
 */
export async function uploadCurrentUserProfileImage(
  localFileUri: string,
): Promise<string> {
  const uid = assertAuthenticatedUserId();
  return uploadProfileImage(uid, localFileUri);
}

/** Uploads a playlist thumbnail; requires Storage rules for continueLearningThumbnails. */
export async function uploadContinueLearningThumbnail(
  playlistId: string,
  localFileUri: string,
): Promise<string> {
  try {
    const trimmedUri = localFileUri.trim();
    if (!trimmedUri) {
      throw new Error('A valid local image URI is required.');
    }
    if (!playlistId.trim()) {
      throw new Error('A playlist id is required.');
    }

    const uid = await syncFirestoreAuthSession();

    const reference = buildContinueLearningThumbnailRef(
      uid,
      playlistId.trim(),
      trimmedUri,
    );
    await reference.putFile(trimmedUri, {
      contentType: resolveContentType(trimmedUri),
    });
    return reference.getDownloadURL();
  } catch (error) {
    throw wrapFirebaseError(
      error,
      'UPLOAD_FAILED',
      'Failed to upload playlist thumbnail.',
    );
  }
}

/** Uploads a course catalog thumbnail; requires Storage rules for courseThumbnails. */
export async function uploadCourseThumbnail(
  courseId: string,
  localFileUri: string,
): Promise<string> {
  try {
    const trimmedUri = localFileUri.trim();
    if (!trimmedUri) {
      throw new Error('A valid local image URI is required.');
    }
    if (!courseId.trim()) {
      throw new Error('A course id is required.');
    }

    const uid = await syncFirestoreAuthSession();

    const reference = buildCourseThumbnailRef(uid, courseId.trim(), trimmedUri);
    await reference.putFile(trimmedUri, {
      contentType: resolveContentType(trimmedUri),
    });
    return reference.getDownloadURL();
  } catch (error) {
    throw wrapFirebaseError(
      error,
      'UPLOAD_FAILED',
      'Failed to upload course thumbnail.',
    );
  }
}

/**
 * Deletes the default profile image object for a user (best-effort).
 */
export async function deleteProfileImage(uid: string): Promise<void> {
  try {
    await storage().ref(STORAGE_PATHS.userProfileImage(uid)).delete();
  } catch (error) {
    throw wrapFirebaseError(
      error,
      'STORAGE_ERROR',
      'Failed to delete profile image.',
    );
  }
}

/**
 * Deletes a remote profile image by download URL. Ignores missing objects.
 */
export async function deleteProfileImageByUrlSafe(
  imageUrl: string | null | undefined,
): Promise<void> {
  if (!isFirebaseStorageUrl(imageUrl)) {
    return;
  }

  try {
    await storage().refFromURL(imageUrl!.trim()).delete();
  } catch (error) {
    const { code } = extractFirebaseErrorDetails(error);
    if (isFirebaseNotFoundError(code)) {
      return;
    }
    logFirebaseOperationError(
      'deleteProfileImageByUrlSafe',
      'deleteByUrl',
      error,
    );
  }
}

const PROFILE_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'] as const;

async function deleteProfileImageRefSafe(
  uid: string,
  extension: string,
): Promise<void> {
  try {
    await storage()
      .ref(STORAGE_PATHS.userProfileImage(uid, extension))
      .delete();
  } catch (error) {
    const { code } = extractFirebaseErrorDetails(error);
    if (isFirebaseNotFoundError(code)) {
      return;
    }
    logFirebaseOperationError(
      'deleteAllUserProfileImages',
      `deleteRef:${extension}`,
      error,
    );
  }
}

/**
 * Removes all known profile image objects for a user (best-effort, never throws).
 */
export async function deleteAllUserProfileImages(
  uid: string,
  profileImageUrl?: string | null,
): Promise<void> {
  try {
    await deleteProfileImageByUrlSafe(profileImageUrl);

    for (const extension of PROFILE_IMAGE_EXTENSIONS) {
      await deleteProfileImageRefSafe(uid, extension);
    }
  } catch (error) {
    logFirebaseOperationError('deleteAllUserProfileImages', 'cleanup', error);
  }
}
