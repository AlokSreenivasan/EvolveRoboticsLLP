import { useEffect, useMemo, useState } from 'react';

import {
  subscribeQuizAttempts,
  type QuizAttempt,
} from '../../services/firebase/quizAttemptsService';
import { getErrorMessage } from '../../utils/firebase/errors';
import { useHomeFeedOptional } from '../context/HomeFeedContext';

function deriveQuizAttemptViews(attempts: QuizAttempt[]) {
  const completedQuizIds = new Set(attempts.map(attempt => attempt.quizId));
  const attemptByQuizId = new Map<string, QuizAttempt>();
  for (const attempt of attempts) {
    if (!attemptByQuizId.has(attempt.quizId)) {
      attemptByQuizId.set(attempt.quizId, attempt);
    }
  }
  return { completedQuizIds, attemptByQuizId };
}

export function useQuizAttempts() {
  const homeFeed = useHomeFeedOptional();
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (homeFeed) {
      return;
    }

    const unsub = subscribeQuizAttempts(
      next => {
        setAttempts(next);
        setError(null);
        setLoading(false);
      },
      err => {
        setError(getErrorMessage(err));
        setLoading(false);
      },
    );

    return () => unsub();
  }, [homeFeed]);

  const sourceAttempts = homeFeed?.quizAttempts.attempts ?? attempts;
  const sourceLoading = homeFeed?.quizAttempts.loading ?? loading;
  const sourceError = homeFeed?.quizAttempts.error ?? error;
  const derived = useMemo(
    () => deriveQuizAttemptViews(sourceAttempts),
    [sourceAttempts],
  );

  return {
    attempts: sourceAttempts,
    completedQuizIds: derived.completedQuizIds,
    attemptByQuizId: derived.attemptByQuizId,
    loading: sourceLoading,
    error: sourceError,
  };
}
