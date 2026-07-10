import { useMemo } from 'react';

import {
  computeUserStreakStats,
} from '../../utils/gamification/computeUserStreakStats';
import { useContinueLearningProgress } from './useContinueLearningProgress';
import { useQuizAttempts } from './useQuizAttempts';

export function useUserStreakStats() {
  const { progressByPlaylistId, loading: progressLoading } =
    useContinueLearningProgress();
  const { attempts, loading: attemptsLoading } = useQuizAttempts();

  const stats = useMemo(
    () =>
      computeUserStreakStats(
        Object.values(progressByPlaylistId),
        attempts,
      ),
    [attempts, progressByPlaylistId],
  );

  return {
    stats,
    loading: progressLoading || attemptsLoading,
  };
}
