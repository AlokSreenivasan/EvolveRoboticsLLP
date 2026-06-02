import { useEffect, useMemo, useState } from 'react';

import { subscribeExamAttempts } from '../../services/firebase/examAttemptsService';
import type { ExamAttempt } from '../../services/firebase/examAttemptsService';
import { getErrorMessage } from '../../utils/firebase/errors';

export function useExamAttempts() {
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeExamAttempts(
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

  const displayAttempts = useMemo(() => attempts, [attempts]);

  return { attempts, displayAttempts, loading, error };
}

