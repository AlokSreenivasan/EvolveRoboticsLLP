import { useAuth } from '../context/AuthContext';

/**
 * Role-focused view of the auth session (loading, admin checks, resolution issues).
 */
export function useUserRole() {
  const {
    role,
    roleLoading,
    isAdmin,
    roleIssue,
    roleIssueMessage,
    user,
    initializing,
  } = useAuth();

  return {
    role,
    roleLoading: Boolean(user) && (initializing || roleLoading),
    isAdmin,
    roleIssue,
    roleIssueMessage,
    isAuthenticated: Boolean(user),
  };
}
