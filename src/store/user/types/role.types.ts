/** Application roles stored on users/{uid}. */
export type UserRole = 'user' | 'admin';

export const DEFAULT_USER_ROLE: UserRole = 'user';

export const USER_ROLES: readonly UserRole[] = ['user', 'admin'] as const;

/** Non-fatal issues resolved by defaulting to {@link DEFAULT_USER_ROLE}. */
export type RoleResolutionIssue =
  | 'missing_role'
  | 'invalid_role'
  | 'profile_document_missing';

export type RoleResolution = {
  role: UserRole;
  issue?: RoleResolutionIssue;
};
