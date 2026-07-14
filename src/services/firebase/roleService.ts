import {
  DEFAULT_USER_ROLE,
  type UserRole,
} from '../../store/user/types/role.types';
import {
  getRoleFromProfile,
  isAdminFromProfile,
  isSuperAdminFromProfile,
  normalizeUserRole,
} from '../../utils/role/normalizeUserRole';
import { getCurrentUserId } from './authService';
import { getUserProfile } from './userService';

/**
 * Fetches and normalizes the signed-in user's role from Firestore.
 * Returns {@link DEFAULT_USER_ROLE} when unauthenticated or the profile is missing.
 */
export async function getCurrentUserRole(): Promise<UserRole> {
  const uid = getCurrentUserId();
  if (!uid) {
    return DEFAULT_USER_ROLE;
  }

  const profile = await getUserProfile(uid);
  if (!profile) {
    return normalizeUserRole(undefined, { profileDocumentMissing: true }).role;
  }

  return getRoleFromProfile(profile);
}

/** Returns true when the signed-in user's normalized role is admin or superadmin. */
export async function isAdmin(): Promise<boolean> {
  const uid = getCurrentUserId();
  if (!uid) {
    return false;
  }

  const profile = await getUserProfile(uid);
  if (!profile) {
    return false;
  }

  return isAdminFromProfile(profile);
}

/** Returns true when the signed-in user's normalized role is superadmin. */
export async function isSuperAdmin(): Promise<boolean> {
  const uid = getCurrentUserId();
  if (!uid) {
    return false;
  }

  const profile = await getUserProfile(uid);
  if (!profile) {
    return false;
  }

  return isSuperAdminFromProfile(profile);
}
