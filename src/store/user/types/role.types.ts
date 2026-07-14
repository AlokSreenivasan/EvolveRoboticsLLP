/** Application roles stored on users/{uid}. */
export type UserRole = 'user' | 'admin' | 'superadmin';

export const DEFAULT_USER_ROLE: UserRole = 'user';

export const USER_ROLES: readonly UserRole[] = [
  'user',
  'admin',
  'superadmin',
] as const;

/** Roles a superadmin may assign from the admin dashboard. */
export const ASSIGNABLE_USER_ROLES: readonly UserRole[] = [
  'user',
  'admin',
] as const;

export type AssignableUserRole = (typeof ASSIGNABLE_USER_ROLES)[number];

/** Non-fatal issues resolved by defaulting to {@link DEFAULT_USER_ROLE}. */
export type RoleResolutionIssue =
  | 'missing_role'
  | 'invalid_role'
  | 'profile_document_missing';

export type RoleResolution = {
  role: UserRole;
  issue?: RoleResolutionIssue;
};
