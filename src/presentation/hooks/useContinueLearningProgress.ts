import { useEffect, useMemo, useState } from 'react';

import { useHomeFeedOptional } from '../context/HomeFeedContext';
import { subscribeContinueLearningProgress } from '../../services/firebase/continueLearningProgressService';
import type { ContinueLearningProgress } from '../../store/content/types/continueLearningProgress.types';
import { getErrorMessage } from '../../utils/firebase/errors';
import { useAuth } from '../context/AuthContext';

export function useContinueLearningProgress() {
  const homeFeed = useHomeFeedOptional();
  const { user } = useAuth();
  const [progressByPlaylistId, setProgressByPlaylistId] = useState<
    Record<string, ContinueLearningProgress>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (homeFeed) {
      return;
    }

    if (!user) {
      setProgressByPlaylistId({});
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    const unsub = subscribeContinueLearningProgress(
      next => {
        setProgressByPlaylistId(next);
        setError(null);
        setLoading(false);
      },
      err => {
        setError(getErrorMessage(err));
        setLoading(false);
      },
    );

    return () => unsub();
  }, [homeFeed, user]);

  const localGetVideosWatched = useMemo(
    () => (playlistId: string) =>
      progressByPlaylistId[playlistId]?.videosWatched ?? 0,
    [progressByPlaylistId],
  );

  if (homeFeed) {
    return {
      progressByPlaylistId: homeFeed.progress.progressByPlaylistId,
      getVideosWatched: homeFeed.progress.getVideosWatched,
      loading: homeFeed.progress.loading,
      error: homeFeed.progress.error,
    };
  }

  return {
    progressByPlaylistId,
    getVideosWatched: localGetVideosWatched,
    loading,
    error,
  };
}
