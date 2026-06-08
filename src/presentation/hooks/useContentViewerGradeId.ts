import { useAuth } from '../context/AuthContext';

/**
 * Grade used to filter learner-facing content alongside school targeting.
 * Admins see all items (returns undefined to skip filtering).
 */
export function useContentViewerGradeId(): string | null | undefined {
  const { profile, isAdmin, roleLoading } = useAuth();

  if (roleLoading || isAdmin) {
    return undefined;
  }

  return profile?.grade ?? null;
}
