import type { UserRole } from '../../store/user/types/role.types';
import { isAdminRole, isSuperAdminRole } from '../role/normalizeUserRole';

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
): boolean {
  if (!currentUserId) {
    return false;
  }
  if (canDeleteAnyClassForumMessage(role)) {
    return true;
  }
  return senderId === currentUserId;
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
