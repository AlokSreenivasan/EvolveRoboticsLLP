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
  uploadCurrentUserProfileImage,
  uploadProfileImage,
} from './storageService';
export { deleteAccount } from './deleteAccountService';
export type { DeleteAccountInput } from './deleteAccountService';
export { changePassword } from './changePasswordService';
export type { ChangePasswordInput } from './changePasswordService';
export { signUpWithProfile } from './signUpService';
export type { SignUpWithProfileInput } from './signUpService';
export {
  createUserProfile,
  createUserProfileIfNotExists,
  deleteUserProfile,
  getCurrentUserProfile,
  getUserProfile,
  updateCurrentUserProfile,
  updateUserProfile,
} from './userService';
// updateCurrentUserProfile requires baseProfile — prefer updateUserProfileWithSync
