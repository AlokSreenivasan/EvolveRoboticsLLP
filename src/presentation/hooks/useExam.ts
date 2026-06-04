import { useEffect, useState } from 'react';

import { subscribeExam } from '../../services/firebase/examsService';
import type { Exam } from '../../store/content/types/exams.types';
import { getErrorMessage } from '../../utils/firebase/errors';
import { useContentSubscribeOptions } from './useContentSubscribeOptions';

export function useExam(examId: string | undefined | null) {
  const subscribeOptions = useContentSubscribeOptions(false);
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const safeExamId = (examId ?? '').trim();
    if (!safeExamId) {
      setExam(null);
      setLoading(false);
      setError('Missing exam id.');
      return;
    }

    setLoading(true);
    const unsub = subscribeExam(
      safeExamId,
      next => {
        setExam(next);
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
  }, [examId, subscribeOptions]);

  return { exam, loading, error };
}

