import { useEffect, useMemo, useState } from 'react';

import { DEFAULT_PROJECTS_SECTION } from '../../constants/projectsDefaults';
import {
  fetchProjectsPage,
  subscribeProjects,
  subscribeProjectsSection,
} from '../../services/firebase/projectsService';
import type { ProjectsSection } from '../../store/content/types/projects.types';
import { getErrorMessage } from '../../utils/firebase/errors';
import { useContentSubscribeOptions } from './useContentSubscribeOptions';
import { usePagedContentList } from './usePagedContentList';

type UseProjectsOptions = {
  /** When true, includes draft (unpublished) projects — for admin screens. */
  includeUnpublished?: boolean;
};

export function useProjects(options?: UseProjectsOptions) {
  const includeUnpublished = options?.includeUnpublished === true;
  const subscribeOptions = useContentSubscribeOptions(includeUnpublished);
  const [section, setSection] = useState<ProjectsSection>(DEFAULT_PROJECTS_SECTION);
  const [sectionLoading, setSectionLoading] = useState(true);
  const [sectionError, setSectionError] = useState<string | null>(null);
  const projectsPage = usePagedContentList({
    subscribe: subscribeProjects,
    fetchPage: fetchProjectsPage,
    options: subscribeOptions,
  });

  useEffect(() => {
    const unsubSection = subscribeProjectsSection(
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

  const displayProjects = useMemo(
    () => projectsPage.items,
    [projectsPage.items],
  );

  return {
    section,
    projects: projectsPage.items,
    displayProjects,
    loading: sectionLoading || projectsPage.loading,
    error: sectionError ?? projectsPage.error,
    loadMore: projectsPage.loadMore,
    loadingMore: projectsPage.loadingMore,
    hasMore: projectsPage.hasMore,
  };
}
