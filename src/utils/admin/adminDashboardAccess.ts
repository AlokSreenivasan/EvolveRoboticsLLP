import type { UserRole } from '../../store/user/types/role.types';
import type { AdminStackParamList } from '../../types/navigation';
import { isAdminRole, isSuperAdminRole } from '../role/normalizeUserRole';

/**
 * Admin-dashboard screens available to role `"admin"`.
 * Superadmins retain access to every screen in the stack.
 */
export const ADMIN_ROLE_DASHBOARD_SCREENS = [
  'ManageResources',
  'ManageAssignments',
  'ManageExams',
  'ManageQuizCompetitions',
] as const satisfies ReadonlyArray<keyof AdminStackParamList>;

export type AdminRoleDashboardScreen =
  (typeof ADMIN_ROLE_DASHBOARD_SCREENS)[number];

const ADMIN_ROLE_SCREEN_SET: ReadonlySet<string> = new Set(
  ADMIN_ROLE_DASHBOARD_SCREENS,
);

/** True when `role` may open the given admin-stack screen. */
export function canAccessAdminDashboardScreen(
  role: UserRole,
  screen: keyof AdminStackParamList,
): boolean {
  if (!isAdminRole(role)) {
    return false;
  }

  if (screen === 'AdminDashboard') {
    return true;
  }

  if (isSuperAdminRole(role)) {
    return true;
  }

  return ADMIN_ROLE_SCREEN_SET.has(screen);
}
