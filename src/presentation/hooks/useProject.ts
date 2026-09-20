import { useEffect, useState } from 'react';

import { subscribeProject } from '../../services/firebase/projectsService';
import type { Project } from '../../store/content/types/projects.types';
import { getErrorMessage } from '../../utils/firebase/errors';
import { useContentSubscribeOptions } from './useContentSubscribeOptions';

export function useProject(projectId: string | undefined | null) {
  const subscribeOptions = useContentSubscribeOptions(false);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const safeProjectId = (projectId ?? '').trim();
    if (!safeProjectId) {
      setProject(null);
      setLoading(false);
      setError('Missing project id.');
      return;
    }

    setLoading(true);
    const unsub = subscribeProject(
      safeProjectId,
      next => {
        setProject(next);
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
  }, [projectId, subscribeOptions]);

  return { project, loading, error };
}
