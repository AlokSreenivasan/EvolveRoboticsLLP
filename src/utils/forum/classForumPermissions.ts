import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

import type { UserRole } from '../../store/user/types/role.types';
import { isAdminRole, isSuperAdminRole } from '../role/normalizeUserRole';

/** How long a normal user may delete their own class-forum message after sending. */
export const CLASS_FORUM_OWN_DELETE_WINDOW_MS = 15_000;

/** Global facilitators (admin) and superadmins may moderate any class. */
export function canModerateClassForum(role: UserRole): boolean {
  return isAdminRole(role);
}

export function canLockClassForum(role: UserRole): boolean {
  return isAdminRole(role);
}

export function canPinClassForumMessage(role: UserRole): boolean {
  return isAdminRole(role);
}

export function canDeleteAnyClassForumMessage(role: UserRole): boolean {
  return isAdminRole(role);
}

export function canBrowseAllClassForumChannels(role: UserRole): boolean {
  return isAdminRole(role);
}

export function canDeleteOwnClassForumMessage(
  role: UserRole,
  senderId: string,
  currentUserId: string | null | undefined,
  createdAt?: FirebaseFirestoreTypes.Timestamp | null,
  nowMs: number = Date.now(),
): boolean {
  if (!currentUserId) {
    return false;
  }
  if (canDeleteAnyClassForumMessage(role)) {
    return true;
  }
  if (senderId !== currentUserId) {
    return false;
  }
  if (!createdAt) {
    return false;
  }
  try {
    return nowMs - createdAt.toMillis() < CLASS_FORUM_OWN_DELETE_WINDOW_MS;
  } catch {
    return false;
  }
}

export function canPostInClassForum(
  role: UserRole,
  isLocked: boolean,
): boolean {
  if (isSuperAdminRole(role) || isAdminRole(role)) {
    return true;
  }
  return !isLocked;
}

export function forumRoleLabel(role: UserRole): string {
  if (role === 'superadmin') {
    return 'Superadmin';
  }
  if (role === 'admin') {
    return 'Facilitator';
  }
  return 'Student';
}
