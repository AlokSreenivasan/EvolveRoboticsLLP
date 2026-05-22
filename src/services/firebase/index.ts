export {
  getAuthInstance,
  getCurrentUser,
  getCurrentUserEmail,
  getCurrentUserId,
  onAuthStateChanged,
  signOut as signOutUser,
} from './authService';
export { FIRESTORE_COLLECTIONS, STORAGE_PATHS } from './constants';
export {
  buildOptimisticProfileFromEdit,
  updateUserProfileWithSync,
} from './profileUpdateService';
export type { ProfileEditPayload } from './profileUpdateService';
export {
  deleteProfileImage,
  deleteProfileImageByUrlSafe,
  uploadCurrentUserProfileImage,
  uploadProfileImage,
} from './storageService';
export { signUpWithProfile } from './signUpService';
export type { SignUpWithProfileInput } from './signUpService';
export {
  createUserProfile,
  createUserProfileIfNotExists,
  getCurrentUserProfile,
  getUserProfile,
  updateCurrentUserProfile,
  updateUserProfile,
} from './userService';
// updateCurrentUserProfile requires baseProfile — prefer updateUserProfileWithSync
