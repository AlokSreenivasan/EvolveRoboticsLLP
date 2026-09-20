import { useMemo } from 'react';

import {
  fetchQuizCompetitionsPage,
  subscribeQuizCompetitions,
} from '../../services/firebase/quizCompetitionsService';
import { useHomeFeedOptional } from '../context/HomeFeedContext';
import { useContentSubscribeOptions } from './useContentSubscribeOptions';
import { usePagedContentList } from './usePagedContentList';

type UseQuizCompetitionsOptions = {
  /** When true, includes draft (unpublished) quizzes — for admin screens. */
  includeUnpublished?: boolean;
};

export function useQuizCompetitions(options?: UseQuizCompetitionsOptions) {
  const includeUnpublished = options?.includeUnpublished === true;
  const homeFeed = useHomeFeedOptional();
  const subscribeOptions = useContentSubscribeOptions(includeUnpublished);
  const useSharedFeed = !includeUnpublished && homeFeed != null;
  const paged = usePagedContentList({
    subscribe: subscribeQuizCompetitions,
    fetchPage: fetchQuizCompetitionsPage,
    options: subscribeOptions,
    enabled: includeUnpublished,
  });

  const quizzes = useSharedFeed
    ? homeFeed.quizCompetitions.quizzes
    : paged.items;
  const loading = useSharedFeed
    ? homeFeed.quizCompetitions.loading
    : paged.loading;
  const error = useSharedFeed
    ? homeFeed.quizCompetitions.error
    : paged.error;
  const loadMore = useSharedFeed
    ? homeFeed.quizCompetitions.loadMore
    : paged.loadMore;
  const loadingMore = useSharedFeed
    ? homeFeed.quizCompetitions.loadingMore
    : paged.loadingMore;
  const hasMore = useSharedFeed
    ? homeFeed.quizCompetitions.hasMore
    : paged.hasMore;

  const displayQuizzes = useMemo(() => quizzes, [quizzes]);

  return {
    quizzes,
    displayQuizzes,
    loading,
    error,
    loadMore,
    loadingMore,
    hasMore,
  };
}
