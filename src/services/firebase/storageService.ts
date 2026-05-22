import storage from '@react-native-firebase/storage';

import { assertAuthenticatedUserId } from '../../utils/firebase/assertAuthenticated';
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

function buildProfileImageRef(uid: string, localUri: string) {
  const extension = resolveFileExtension(localUri);
  return storage().ref(STORAGE_PATHS.userProfileImage(uid, extension));
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
    await reference.putFile(trimmedUri);
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
  } catch {
    // Best-effort cleanup when replacing or removing profile photos.
  }
}
