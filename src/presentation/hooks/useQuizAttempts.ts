import { useEffect, useMemo, useState } from 'react';

import {
  subscribeQuizAttempts,
  type QuizAttempt,
} from '../../services/firebase/quizAttemptsService';
import { getErrorMessage } from '../../utils/firebase/errors';

export function useQuizAttempts() {
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
  }, []);

  const completedQuizIds = useMemo(
    () => new Set(attempts.map(attempt => attempt.quizId)),
    [attempts],
  );

  const attemptByQuizId = useMemo(() => {
    const map = new Map<string, QuizAttempt>();
    for (const attempt of attempts) {
      if (!map.has(attempt.quizId)) {
        map.set(attempt.quizId, attempt);
      }
    }
    return map;
  }, [attempts]);

  return { attempts, completedQuizIds, attemptByQuizId, loading, error };
}
