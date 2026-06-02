import { useEffect, useState } from 'react';

import { subscribeExam } from '../../services/firebase/examsService';
import type { Exam } from '../../store/content/types/exams.types';
import { getErrorMessage } from '../../utils/firebase/errors';

export function useExam(examId: string | undefined | null) {
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
      err => {
        setError(getErrorMessage(err));
        setLoading(false);
      },
    );

    return () => unsub();
  }, [examId]);

  return { exam, loading, error };
}

