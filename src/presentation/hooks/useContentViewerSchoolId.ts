import { useAuth } from '../context/AuthContext';

/**
 * School id used to filter learner-facing content by school targeting.
 */
export function useContentViewerSchoolId(): string | null | undefined {
  const { profile } = useAuth();
  return profile?.schoolId ?? null;
}
