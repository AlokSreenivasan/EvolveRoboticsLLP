export const FIRESTORE_COLLECTIONS = {
  users: 'users',
  appContent: 'appContent',
  importantUpdates: 'importantUpdates',
  upcomingEvents: 'upcomingEvents',
  continueLearningPlaylists: 'continueLearningPlaylists',
  courses: 'courses',
} as const;

/** Document IDs inside {@link FIRESTORE_COLLECTIONS.appContent}. */
export const APP_CONTENT_DOCS = {
  importantUpdatesSection: 'importantUpdates',
  upcomingEventsSection: 'upcomingEvents',
} as const;

export const STORAGE_PATHS = {
  /** Base path: profileImages/{uid} */
  userProfileImage: (uid: string, extension = '.jpg') =>
    `profileImages/${uid}${extension}`,
  /** continueLearningThumbnails/{uid}/{playlistId}.jpg */
  continueLearningThumbnail: (
    uid: string,
    playlistId: string,
    extension = '.jpg',
  ) => `continueLearningThumbnails/${uid}/${playlistId}${extension}`,
  courseThumbnail: (uid: string, courseId: string, extension = '.jpg') =>
    `courseThumbnails/${uid}/${courseId}${extension}`,
} as const;
