import { useEffect, useMemo, useState } from 'react';

import { DEFAULT_PROJECTS_SECTION } from '../../constants/projectsDefaults';
import {
  subscribeProjects,
  subscribeProjectsSection,
} from '../../services/firebase/projectsService';
import type {
  Project,
  ProjectsSection,
} from '../../store/content/types/projects.types';
import { getErrorMessage } from '../../utils/firebase/errors';
import { useContentSubscribeOptions } from './useContentSubscribeOptions';

type UseProjectsOptions = {
  /** When true, includes draft (unpublished) projects — for admin screens. */
  includeUnpublished?: boolean;
};

export function useProjects(options?: UseProjectsOptions) {
  const includeUnpublished = options?.includeUnpublished === true;
  const subscribeOptions = useContentSubscribeOptions(includeUnpublished);
  const [section, setSection] = useState<ProjectsSection>(DEFAULT_PROJECTS_SECTION);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let sectionReady = false;
    let projectsReady = false;

    const markReady = () => {
      if (sectionReady && projectsReady) {
        setLoading(false);
      }
    };

    const unsubSection = subscribeProjectsSection(
      nextSection => {
        setSection(nextSection);
        sectionReady = true;
        markReady();
      },
      err => {
        setError(getErrorMessage(err));
        sectionReady = true;
        markReady();
      },
    );

    const unsubProjects = subscribeProjects(
      nextProjects => {
        setProjects(nextProjects);
        setError(null);
        projectsReady = true;
        markReady();
      },
      subscribeOptions,
      err => {
        setError(getErrorMessage(err));
        projectsReady = true;
        markReady();
      },
    );

    return () => {
      unsubSection();
      unsubProjects();
    };
  }, [subscribeOptions]);

  const displayProjects = useMemo(() => projects, [projects]);

  return {
    section,
    projects,
    displayProjects,
    loading,
    error,
  };
}
