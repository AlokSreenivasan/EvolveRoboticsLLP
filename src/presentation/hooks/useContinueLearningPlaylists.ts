import { useEffect, useState } from 'react';

import { useHomeFeedContinueLearning } from '../context/HomeFeedContext';
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

    let ready = false;

    const unsub = subscribeContinueLearningPlaylists(
      nextPlaylists => {
        setPlaylists(nextPlaylists);
        setError(null);
        ready = true;
        setLoading(false);
      },
      { includeUnpublished },
      err => {
        setError(getErrorMessage(err));
        ready = true;
        if (ready) {
          setLoading(false);
        }
      },
    );

    return () => unsub();
  }, [includeUnpublished]);

  if (!includeUnpublished) {
    return {
      playlists: homeFeed.playlists,
      loading: homeFeed.loading,
      error: homeFeed.error,
    };
  }

  return { playlists, loading, error };
}
