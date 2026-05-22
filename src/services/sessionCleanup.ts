import { clearCachedUserProfile } from './profileCache';
import {
  clearProfileContactNumber,
  clearProfileFullName,
  clearProfilePhotoUri,
} from './profileStorage';

/**
 * Clears all local user session/profile caches after account deletion or sign-out cleanup.
 */
export async function clearLocalUserSessionData(): Promise<void> {
  await Promise.all([
    clearCachedUserProfile(),
    clearProfileFullName(),
    clearProfilePhotoUri(),
    clearProfileContactNumber(),
  ]);
}
