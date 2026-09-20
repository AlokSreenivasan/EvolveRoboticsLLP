import { useAuth } from '../context/AuthContext';
import { fetchCoursesPage, subscribeCourses } from '../../services/firebase/coursesService';
import { useContentSubscribeOptions } from './useContentSubscribeOptions';
import { usePagedContentList } from './usePagedContentList';

type UseCoursesOptions = {
  /** When true, includes draft (unpublished) courses — for admin screens. */
  includeUnpublished?: boolean;
};

export function useCourses(options?: UseCoursesOptions) {
  const includeUnpublished = options?.includeUnpublished === true;
  const { user } = useAuth();
  const subscribeOptions = useContentSubscribeOptions(includeUnpublished);
  const { items, loading, error, loadMore, loadingMore, hasMore } =
    usePagedContentList({
      subscribe: subscribeCourses,
      fetchPage: fetchCoursesPage,
      options: subscribeOptions,
      enabled: Boolean(user),
    });

  return {
    courses: items,
    loading,
    error,
    loadMore,
    loadingMore,
    hasMore,
  };
}
