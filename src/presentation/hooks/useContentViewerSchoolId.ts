import { useAuth } from '../context/AuthContext';

/**
 * School id used to filter learner-facing content.
 * Admins see all items (returns undefined to skip filtering).
 */
export function useContentViewerSchoolId(): string | null | undefined {
  const { profile, isAdmin, roleLoading } = useAuth();

  if (roleLoading || isAdmin) {
    return undefined;
  }

  return profile?.schoolId ?? null;
}
