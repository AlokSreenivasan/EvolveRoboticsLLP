export const FIRESTORE_COLLECTIONS = {
  users: 'users',
  appContent: 'appContent',
  importantUpdates: 'importantUpdates',
  upcomingEvents: 'upcomingEvents',
  continueLearningPlaylists: 'continueLearningPlaylists',
  courses: 'courses',
  resourceNotes: 'resourceNotes',
  assignments: 'assignments',
  exams: 'exams',
  examAnswerKeys: 'examAnswerKeys',
  quizCompetitions: 'quizCompetitions',
  quizAnswerKeys: 'quizAnswerKeys',
  notifications: 'notifications',
  schools: 'schools',
  chatKeywords: 'chatKeywords',
  projects: 'projects',
} as const;

/** Document IDs inside {@link FIRESTORE_COLLECTIONS.appContent}. */
export const APP_CONTENT_DOCS = {
  importantUpdatesSection: 'importantUpdates',
  upcomingEventsSection: 'upcomingEvents',
  resourcesSection: 'resources',
  assignmentsSection: 'assignments',
  projectsSection: 'projects',
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
  resourceNotePdf: (uid: string, noteId: string) =>
    `resourceNotes/${uid}/${noteId}.pdf`,
  assignmentPdf: (uid: string, assignmentId: string) =>
    `assignments/${uid}/${assignmentId}.pdf`,
  /** projectImages/{uid}/{fileStem}.jpg — fileStem includes projectId + slot/unique id */
  projectImage: (uid: string, fileStem: string, extension = '.jpg') =>
    `projectImages/${uid}/${fileStem}${extension}`,
  /** projectMarkdown/{uid}/{projectId}.md */
  projectMarkdown: (uid: string, projectId: string) =>
    `projectMarkdown/${uid}/${projectId}.md`,
} as const;
