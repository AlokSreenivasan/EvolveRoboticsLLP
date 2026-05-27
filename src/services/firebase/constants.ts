export const FIRESTORE_COLLECTIONS = {
  users: 'users',
  appContent: 'appContent',
  importantUpdates: 'importantUpdates',
} as const;

/** Document IDs inside {@link FIRESTORE_COLLECTIONS.appContent}. */
export const APP_CONTENT_DOCS = {
  importantUpdatesSection: 'importantUpdates',
} as const;

export const STORAGE_PATHS = {
  /** Base path: profileImages/{uid} */
  userProfileImage: (uid: string, extension = '.jpg') =>
    `profileImages/${uid}${extension}`,
} as const;
