import {
  deleteObject,
  getDownloadURL,
  getStorage,
  putFile,
  ref,
  refFromURL,
} from '@react-native-firebase/storage';

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

const firebaseStorage = getStorage();

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
  return ref(firebaseStorage, STORAGE_PATHS.userProfileImage(uid, extension));
}

function buildContinueLearningThumbnailRef(
  uid: string,
  playlistId: string,
  localUri: string,
) {
  const extension = resolveFileExtension(localUri);
  return ref(
    firebaseStorage,
    STORAGE_PATHS.continueLearningThumbnail(uid, playlistId, extension),
  );
}

function buildCourseThumbnailRef(
  uid: string,
  courseId: string,
  localUri: string,
) {
  const extension = resolveFileExtension(localUri);
  return ref(
    firebaseStorage,
    STORAGE_PATHS.courseThumbnail(uid, courseId, extension),
  );
}

function buildProjectImageRef(
  uid: string,
  projectId: string,
  imageIndex: number,
  localUri: string,
) {
  const extension = resolveFileExtension(localUri);
  const fileStem = `${projectId}_${imageIndex}_${Date.now()}`;
  return ref(
    firebaseStorage,
    STORAGE_PATHS.projectImage(uid, fileStem, extension),
  );
}

function buildProjectMarkdownRef(uid: string, projectId: string) {
  return ref(firebaseStorage, STORAGE_PATHS.projectMarkdown(uid, projectId));
}

function buildResourceNotePdfRef(uid: string, noteId: string) {
  return ref(firebaseStorage, STORAGE_PATHS.resourceNotePdf(uid, noteId));
}

function buildAssignmentPdfRef(uid: string, assignmentId: string) {
  return ref(firebaseStorage, STORAGE_PATHS.assignmentPdf(uid, assignmentId));
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
    await putFile(reference, trimmedUri, {
      contentType: resolveContentType(trimmedUri),
    });
    return getDownloadURL(reference);
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
    await putFile(reference, trimmedUri, {
      contentType: resolveContentType(trimmedUri),
    });
    return getDownloadURL(reference);
  } catch (error) {
    throw wrapFirebaseError(
      error,
      'UPLOAD_FAILED',
      'Failed to upload playlist thumbnail.',
    );
  }
}

/** Uploads a resource note PDF; requires Storage rules for resourceNotes. */
export async function uploadResourceNotePdf(
  noteId: string,
  localFileUri: string,
): Promise<string> {
  try {
    const trimmedUri = localFileUri.trim();
    if (!trimmedUri) {
      throw new Error('A valid local PDF URI is required.');
    }
    if (!noteId.trim()) {
      throw new Error('A note id is required.');
    }

    const uid = await syncFirestoreAuthSession();

    const reference = buildResourceNotePdfRef(uid, noteId.trim());
    await putFile(reference, trimmedUri, {
      contentType: 'application/pdf',
    });
    return getDownloadURL(reference);
  } catch (error) {
    throw wrapFirebaseError(
      error,
      'UPLOAD_FAILED',
      'Failed to upload PDF note.',
    );
  }
}

/** Uploads an assignment PDF; requires Storage rules for assignments. */
export async function uploadAssignmentPdf(
  assignmentId: string,
  localFileUri: string,
): Promise<string> {
  try {
    const trimmedUri = localFileUri.trim();
    if (!trimmedUri) {
      throw new Error('A valid local PDF URI is required.');
    }
    if (!assignmentId.trim()) {
      throw new Error('An assignment id is required.');
    }

    const uid = await syncFirestoreAuthSession();

    const reference = buildAssignmentPdfRef(uid, assignmentId.trim());
    await putFile(reference, trimmedUri, {
      contentType: 'application/pdf',
    });
    return getDownloadURL(reference);
  } catch (error) {
    throw wrapFirebaseError(
      error,
      'UPLOAD_FAILED',
      'Failed to upload assignment PDF.',
    );
  }
}

export async function deleteAssignmentPdfByUrlSafe(
  pdfUrl: string | null | undefined,
): Promise<void> {
  if (!isFirebaseStorageUrl(pdfUrl)) {
    return;
  }

  try {
    await deleteObject(refFromURL(firebaseStorage, pdfUrl!.trim()));
  } catch (error) {
    const { code } = extractFirebaseErrorDetails(error);
    if (isFirebaseNotFoundError(code)) {
      return;
    }
    logFirebaseOperationError(
      'deleteAssignmentPdfByUrlSafe',
      'deleteByUrl',
      error,
    );
  }
}

export async function deleteResourceNotePdfByUrlSafe(
  pdfUrl: string | null | undefined,
): Promise<void> {
  if (!isFirebaseStorageUrl(pdfUrl)) {
    return;
  }

  try {
    await deleteObject(refFromURL(firebaseStorage, pdfUrl!.trim()));
  } catch (error) {
    const { code } = extractFirebaseErrorDetails(error);
    if (isFirebaseNotFoundError(code)) {
      return;
    }
    logFirebaseOperationError(
      'deleteResourceNotePdfByUrlSafe',
      'deleteByUrl',
      error,
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
    await putFile(reference, trimmedUri, {
      contentType: resolveContentType(trimmedUri),
    });
    return getDownloadURL(reference);
  } catch (error) {
    throw wrapFirebaseError(
      error,
      'UPLOAD_FAILED',
      'Failed to upload course thumbnail.',
    );
  }
}

/** Uploads a project gallery image at slot 0–4; requires Storage rules for projectImages. */
export async function uploadProjectImage(
  projectId: string,
  localFileUri: string,
  imageIndex = 0,
): Promise<string> {
  try {
    const trimmedUri = localFileUri.trim();
    if (!trimmedUri) {
      throw new Error('A valid local image URI is required.');
    }
    if (!projectId.trim()) {
      throw new Error('A project id is required.');
    }
    if (!Number.isInteger(imageIndex) || imageIndex < 0 || imageIndex > 4) {
      throw new Error('Project image index must be an integer from 0 to 4.');
    }

    const uid = await syncFirestoreAuthSession();

    const reference = buildProjectImageRef(
      uid,
      projectId.trim(),
      imageIndex,
      trimmedUri,
    );
    await putFile(reference, trimmedUri, {
      contentType: resolveContentType(trimmedUri),
    });
    return getDownloadURL(reference);
  } catch (error) {
    throw wrapFirebaseError(
      error,
      'UPLOAD_FAILED',
      'Failed to upload project image.',
    );
  }
}

export async function deleteProjectImageByUrlSafe(
  imageUrl: string | null | undefined,
): Promise<void> {
  if (!isFirebaseStorageUrl(imageUrl)) {
    return;
  }

  try {
    await deleteObject(refFromURL(firebaseStorage, imageUrl!.trim()));
  } catch (error) {
    const { code } = extractFirebaseErrorDetails(error);
    if (isFirebaseNotFoundError(code)) {
      return;
    }
    logFirebaseOperationError(
      'deleteProjectImageByUrlSafe',
      'deleteByUrl',
      error,
    );
  }
}

/** Best-effort delete of every gallery URL for a project. */
export async function deleteProjectImagesByUrlsSafe(
  imageUrls: Array<string | null | undefined>,
): Promise<void> {
  await Promise.all(imageUrls.map(url => deleteProjectImageByUrlSafe(url)));
}

/** Uploads a project markdown brief; requires Storage rules for projectMarkdown. */
export async function uploadProjectMarkdown(
  projectId: string,
  localFileUri: string,
): Promise<string> {
  try {
    const trimmedUri = localFileUri.trim();
    if (!trimmedUri) {
      throw new Error('A valid local markdown URI is required.');
    }
    if (!projectId.trim()) {
      throw new Error('A project id is required.');
    }

    const uid = await syncFirestoreAuthSession();

    const reference = buildProjectMarkdownRef(uid, projectId.trim());
    await putFile(reference, trimmedUri, {
      contentType: 'text/markdown',
    });
    return getDownloadURL(reference);
  } catch (error) {
    throw wrapFirebaseError(
      error,
      'UPLOAD_FAILED',
      'Failed to upload project markdown.',
    );
  }
}

export async function deleteProjectMarkdownByUrlSafe(
  markdownUrl: string | null | undefined,
): Promise<void> {
  if (!isFirebaseStorageUrl(markdownUrl)) {
    return;
  }

  try {
    await deleteObject(refFromURL(firebaseStorage, markdownUrl!.trim()));
  } catch (error) {
    const { code } = extractFirebaseErrorDetails(error);
    if (isFirebaseNotFoundError(code)) {
      return;
    }
    logFirebaseOperationError(
      'deleteProjectMarkdownByUrlSafe',
      'deleteByUrl',
      error,
    );
  }
}

/**
 * Deletes the default profile image object for a user (best-effort).
 */
export async function deleteProfileImage(uid: string): Promise<void> {
  try {
    await deleteObject(
      ref(firebaseStorage, STORAGE_PATHS.userProfileImage(uid)),
    );
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
    await deleteObject(refFromURL(firebaseStorage, imageUrl!.trim()));
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
    await deleteObject(
      ref(firebaseStorage, STORAGE_PATHS.userProfileImage(uid, extension)),
    );
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
