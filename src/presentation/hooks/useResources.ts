import { useEffect, useState } from 'react';

import { DEFAULT_RESOURCES_SECTION } from '../../constants/resourcesDefaults';
import {
  fetchResourceNotesPage,
  subscribeResourceNotes,
  subscribeResourcesSection,
} from '../../services/firebase/resourcesService';
import type { ResourcesSection } from '../../store/content/types/resources.types';
import { getErrorMessage } from '../../utils/firebase/errors';
import { useContentSubscribeOptions } from './useContentSubscribeOptions';
import { usePagedContentList } from './usePagedContentList';

type UseResourcesOptions = {
  /** When true, includes draft (unpublished) notes — for admin screens. */
  includeUnpublished?: boolean;
};

export function useResources(options?: UseResourcesOptions) {
  const includeUnpublished = options?.includeUnpublished === true;
  const subscribeOptions = useContentSubscribeOptions(includeUnpublished);
  const [section, setSection] = useState<ResourcesSection>(
    DEFAULT_RESOURCES_SECTION,
  );
  const [sectionLoading, setSectionLoading] = useState(true);
  const [sectionError, setSectionError] = useState<string | null>(null);
  const notesPage = usePagedContentList({
    subscribe: subscribeResourceNotes,
    fetchPage: fetchResourceNotesPage,
    options: subscribeOptions,
  });

  useEffect(() => {
    const unsubSection = subscribeResourcesSection(
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
    notes: notesPage.items,
    loading: sectionLoading || notesPage.loading,
    error: sectionError ?? notesPage.error,
    loadMore: notesPage.loadMore,
    loadingMore: notesPage.loadingMore,
    hasMore: notesPage.hasMore,
  };
}
