import { useEffect, useState } from 'react';

import { DEFAULT_ASSIGNMENTS_SECTION } from '../../constants/assignmentsDefaults';
import {
  fetchAssignmentsPage,
  subscribeAssignments,
  subscribeAssignmentsSection,
} from '../../services/firebase/assignmentsService';
import type { AssignmentsSection } from '../../store/content/types/assignments.types';
import { getErrorMessage } from '../../utils/firebase/errors';
import { useContentSubscribeOptions } from './useContentSubscribeOptions';
import { usePagedContentList } from './usePagedContentList';

type UseAssignmentsOptions = {
  /** When true, includes draft (unpublished) assignments — for admin screens. */
  includeUnpublished?: boolean;
};

export function useAssignments(options?: UseAssignmentsOptions) {
  const includeUnpublished = options?.includeUnpublished === true;
  const subscribeOptions = useContentSubscribeOptions(includeUnpublished);
  const [section, setSection] = useState<AssignmentsSection>(
    DEFAULT_ASSIGNMENTS_SECTION,
  );
  const [sectionLoading, setSectionLoading] = useState(true);
  const [sectionError, setSectionError] = useState<string | null>(null);
  const assignmentsPage = usePagedContentList({
    subscribe: subscribeAssignments,
    fetchPage: fetchAssignmentsPage,
    options: subscribeOptions,
  });

  useEffect(() => {
    const unsubSection = subscribeAssignmentsSection(
      nextSection => {
        setSection(nextSection);
        setSectionError(null);
        setSectionLoading(false);
      },
      err => {
        setSectionError(getErrorMessage(err));
        setSectionLoading(false);
      },
    );

    return () => unsubSection();
  }, []);

  return {
    section,
    assignments: assignmentsPage.items,
    loading: sectionLoading || assignmentsPage.loading,
    error: sectionError ?? assignmentsPage.error,
    loadMore: assignmentsPage.loadMore,
    loadingMore: assignmentsPage.loadingMore,
    hasMore: assignmentsPage.hasMore,
  };
}
