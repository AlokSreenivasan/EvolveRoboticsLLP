import { useMemo } from 'react';

import {
  fetchExamsPage,
  subscribeExams,
} from '../../services/firebase/examsService';
import { useContentSubscribeOptions } from './useContentSubscribeOptions';
import { usePagedContentList } from './usePagedContentList';

type UseExamsOptions = {
  /** When true, includes draft (unpublished) exams — for admin screens. */
  includeUnpublished?: boolean;
};

export function useExams(options?: UseExamsOptions) {
  const includeUnpublished = options?.includeUnpublished === true;
  const subscribeOptions = useContentSubscribeOptions(includeUnpublished);
  const { items, loading, error, loadMore, loadingMore, hasMore } =
    usePagedContentList({
      subscribe: subscribeExams,
      fetchPage: fetchExamsPage,
      options: subscribeOptions,
    });

  const displayExams = useMemo(() => items, [items]);

  return {
    exams: items,
    displayExams,
    loading,
    error,
    loadMore,
    loadingMore,
    hasMore,
  };
}
