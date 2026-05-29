export {
  getAuthInstance,
  getCurrentUser,
  getCurrentUserEmail,
  getCurrentUserId,
  hasEmailPasswordProvider,
  onAuthStateChanged,
  reauthenticateWithPassword,
  refreshAuthSessionForSensitiveOperation,
  sendPasswordResetEmail,
  signOut as signOutUser,
} from './authService';
export { FIRESTORE_COLLECTIONS, STORAGE_PATHS } from './constants';
export {
  buildOptimisticProfileFromEdit,
  updateUserProfileWithSync,
} from './profileUpdateService';
export type { ProfileEditPayload } from './profileUpdateService';
export {
  deleteAllUserProfileImages,
  deleteProfileImage,
  deleteProfileImageByUrlSafe,
  uploadContinueLearningThumbnail,
  uploadCourseThumbnail,
  uploadCurrentUserProfileImage,
  uploadProfileImage,
} from './storageService';
export { deleteAccount } from './deleteAccountService';
export type { DeleteAccountInput } from './deleteAccountService';
export { changePassword } from './changePasswordService';
export type { ChangePasswordInput } from './changePasswordService';
export { signUpWithProfile } from './signUpService';
export type { SignUpWithProfileInput } from './signUpService';
export { getCurrentUserRole, isAdmin } from './roleService';
export {
  createImportantUpdateNotice,
  deleteImportantUpdateNotice,
  ensureImportantUpdatesSectionDefaults,
  moveImportantUpdateNotice,
  reorderImportantUpdateNotices,
  subscribeImportantUpdates,
  subscribeImportantUpdatesSection,
  updateImportantUpdateNotice,
  updateImportantUpdatesSection,
} from './importantUpdatesService';
export {
  createUpcomingEvent,
  deleteUpcomingEvent,
  ensureUpcomingEventsSectionDefaults,
  moveUpcomingEvent,
  reorderUpcomingEvents,
  subscribeUpcomingEvents,
  subscribeUpcomingEventsSection,
  updateUpcomingEvent,
  updateUpcomingEventsSection,
} from './upcomingEventsService';
export {
  createContinueLearningPlaylist,
  deleteContinueLearningPlaylist,
  extractYouTubePlaylistId,
  isValidYouTubePlaylistUrl,
  resolveYouTubePlaylistUrl,
  moveContinueLearningPlaylist,
  reorderContinueLearningPlaylists,
  subscribeContinueLearningPlaylists,
  updateContinueLearningPlaylist,
} from './continueLearningPlaylistsService';
export {
  createCourse,
  deleteCourse,
  moveCourse,
  reorderCourses,
  subscribeCourses,
  updateCourse,
} from './coursesService';
export {
  recordPlaylistVideoEngagement,
  recordPlaylistVideoProgress,
  subscribeContinueLearningProgress,
} from './continueLearningProgressService';
export {
  createUserProfile,
  createUserProfileIfNotExists,
  deleteUserProfile,
  getCurrentUserProfile,
  getUserProfile,
  getUserProfileWithRoleResolution,
  updateCurrentUserProfile,
  updateUserProfile,
} from './userService';
export type { UserProfileFetchResult } from './userService';
// updateCurrentUserProfile requires baseProfile — prefer updateUserProfileWithSync
