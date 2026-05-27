import {
  DEFAULT_USER_ROLE,
  type RoleResolution,
  type RoleResolutionIssue,
  type UserRole,
} from '../../store/user/types/role.types';

export function isValidUserRole(value: unknown): value is UserRole {
  return value === 'user' || value === 'admin';
}

/**
 * Normalizes a raw Firestore role value to a known role.
 * Defaults to "user" for missing, empty, or invalid values.
 */
export function normalizeUserRole(
  rawRole: unknown,
  options?: { profileDocumentMissing?: boolean },
): RoleResolution {
  if (options?.profileDocumentMissing) {
    return {
      role: DEFAULT_USER_ROLE,
      issue: 'profile_document_missing',
    };
  }

  if (rawRole === undefined || rawRole === null || rawRole === '') {
    return { role: DEFAULT_USER_ROLE, issue: 'missing_role' };
  }

  if (isValidUserRole(rawRole)) {
    return { role: rawRole };
  }

  return { role: DEFAULT_USER_ROLE, issue: 'invalid_role' };
}

export function isAdminRole(role: UserRole): boolean {
  return role === 'admin';
}

export function getRoleFromProfile(
  profile: { role: UserRole } | null | undefined,
): UserRole {
  if (!profile) {
    return DEFAULT_USER_ROLE;
  }
  return normalizeUserRole(profile.role).role;
}

export function isAdminFromProfile(
  profile: { role: UserRole } | null | undefined,
): boolean {
  return isAdminRole(getRoleFromProfile(profile));
}

export function roleIssueMessage(issue: RoleResolutionIssue | null): string | null {
  if (!issue) {
    return null;
  }

  switch (issue) {
    case 'missing_role':
      return 'Your account role was missing. Using default access.';
    case 'invalid_role':
      return 'Your account role was invalid. Using default access.';
    case 'profile_document_missing':
      return 'Your profile could not be found. Using default access.';
    default:
      return null;
  }
}
