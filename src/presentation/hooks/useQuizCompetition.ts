import { useEffect, useState } from 'react';

import { subscribeQuizCompetition } from '../../services/firebase/quizCompetitionsService';
import type { QuizCompetition } from '../../store/content/types/quizCompetitions.types';
import { getErrorMessage } from '../../utils/firebase/errors';
import { useContentSubscribeOptions } from './useContentSubscribeOptions';

export function useQuizCompetition(quizId: string | undefined | null) {
  const subscribeOptions = useContentSubscribeOptions(false);
  const [quiz, setQuiz] = useState<QuizCompetition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const safeQuizId = (quizId ?? '').trim();
    if (!safeQuizId) {
      setQuiz(null);
      setLoading(false);
      setError('Missing quiz id.');
      return;
    }

    setLoading(true);
    const unsub = subscribeQuizCompetition(
      safeQuizId,
      next => {
        setQuiz(next);
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
  }, [quizId, subscribeOptions]);

  return { quiz, loading, error };
}
