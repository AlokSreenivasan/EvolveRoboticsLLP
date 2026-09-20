import { useEffect, useState } from 'react';

import { useHomeFeedContinueLearning } from '../context/HomeFeedContext';
import { onAuthStateChanged } from '../../services/firebase/authService';
import { subscribeContinueLearningPlaylists } from '../../services/firebase/continueLearningPlaylistsService';
import type { ContinueLearningPlaylist } from '../../store/content/types/continueLearningPlaylists.types';
import { getErrorMessage } from '../../utils/firebase/errors';

type UseContinueLearningPlaylistsOptions = {
  includeUnpublished?: boolean;
};

export function useContinueLearningPlaylists(
  options?: UseContinueLearningPlaylistsOptions,
) {
  const includeUnpublished = options?.includeUnpublished === true;
  const homeFeed = useHomeFeedContinueLearning();
  const [playlists, setPlaylists] = useState<ContinueLearningPlaylist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!includeUnpublished) {
      return;
    }

    let unsubPlaylists: (() => void) | undefined;

    const unsubAuth = onAuthStateChanged(user => {
      unsubPlaylists?.();
      unsubPlaylists = undefined;

      if (!user) {
        setPlaylists([]);
        setError(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      unsubPlaylists = subscribeContinueLearningPlaylists(
        nextPlaylists => {
          setPlaylists(nextPlaylists);
          setError(null);
          setLoading(false);
        },
        { includeUnpublished },
        err => {
          setError(getErrorMessage(err));
          setLoading(false);
        },
      );
    });

    return () => {
      unsubAuth();
      unsubPlaylists?.();
    };
  }, [includeUnpublished]);

  if (!includeUnpublished) {
    return {
      playlists: homeFeed.playlists,
      loading: homeFeed.loading,
      error: homeFeed.error,
      loadMore: homeFeed.loadMore,
      loadingMore: homeFeed.loadingMore,
      hasMore: homeFeed.hasMore,
    };
  }

  return { playlists, loading, error, loadMore: () => undefined, loadingMore: false, hasMore: false };
}
