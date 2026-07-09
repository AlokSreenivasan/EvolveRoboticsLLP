import { useEffect, useMemo, useState } from 'react';

import { subscribeQuizCompetitions } from '../../services/firebase/quizCompetitionsService';
import type { QuizCompetition } from '../../store/content/types/quizCompetitions.types';
import { getErrorMessage } from '../../utils/firebase/errors';
import { useContentSubscribeOptions } from './useContentSubscribeOptions';

type UseQuizCompetitionsOptions = {
  /** When true, includes draft (unpublished) quizzes — for admin screens. */
  includeUnpublished?: boolean;
};

export function useQuizCompetitions(options?: UseQuizCompetitionsOptions) {
  const includeUnpublished = options?.includeUnpublished === true;
  const subscribeOptions = useContentSubscribeOptions(includeUnpublished);
  const [quizzes, setQuizzes] = useState<QuizCompetition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeQuizCompetitions(
      next => {
        setQuizzes(next);
        setError(null);
        setLoading(false);
      },
      subscribeOptions,
      err => {
        setError(getErrorMessage(err));
        setLoading(false);
      },
    );

    return () => unsub();
  }, [subscribeOptions]);

  const displayQuizzes = useMemo(() => quizzes, [quizzes]);

  return {
    quizzes,
    displayQuizzes,
    loading,
    error,
  };
}
