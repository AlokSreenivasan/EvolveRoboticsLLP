import { useEffect, useMemo, useState } from 'react';

import { subscribeExams } from '../../services/firebase/examsService';
import type { Exam } from '../../store/content/types/exams.types';
import { getErrorMessage } from '../../utils/firebase/errors';
import { useContentSubscribeOptions } from './useContentSubscribeOptions';

type UseExamsOptions = {
  /** When true, includes draft (unpublished) exams — for admin screens. */
  includeUnpublished?: boolean;
};

export function useExams(options?: UseExamsOptions) {
  const includeUnpublished = options?.includeUnpublished === true;
  const subscribeOptions = useContentSubscribeOptions(includeUnpublished);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeExams(
      next => {
        setExams(next);
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

  const displayExams = useMemo(() => exams, [exams]);

  return {
    exams,
    displayExams,
    loading,
    error,
  };
}

