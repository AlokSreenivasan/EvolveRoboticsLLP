import { useAuth } from '../context/AuthContext';

/**
 * Grade used to filter learner-facing content alongside school targeting.
 */
export function useContentViewerGradeId(): string | null | undefined {
  const { profile } = useAuth();
  return profile?.grade ?? null;
}
