export const FIRESTORE_COLLECTIONS = {
  users: 'users',
} as const;

export const STORAGE_PATHS = {
  /** Base path: profileImages/{uid} */
  userProfileImage: (uid: string, extension = '.jpg') =>
    `profileImages/${uid}${extension}`,
} as const;
