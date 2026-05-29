import { useCallback, useEffect, useState } from 'react';

import { fetchYouTubePlaylistVideos } from '../../services/youtube/youtubePlaylistService';
import type { YouTubePlaylistVideo } from '../../store/content/types/youtubePlaylist.types';

type UseYouTubePlaylistVideosResult = {
  videos: YouTubePlaylistVideo[];
  loading: boolean;
  error: string | null;
  reload: () => void;
};

export function useYouTubePlaylistVideos(
  playlistUrl: string | undefined,
): UseYouTubePlaylistVideosResult {
  const [videos, setVideos] = useState<YouTubePlaylistVideo[]>([]);
  const [loading, setLoading] = useState(Boolean(playlistUrl?.trim()));
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => {
    setReloadToken(token => token + 1);
  }, []);

  useEffect(() => {
    const url = playlistUrl?.trim();
    if (!url) {
      setVideos([]);
      setLoading(false);
      setError('This course has no playlist link.');
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchYouTubePlaylistVideos(url)
      .then(result => {
        if (cancelled) {
          return;
        }
        if (result.length === 0) {
          setError('No videos found in this playlist.');
        }
        setVideos(result);
      })
      .catch(err => {
        if (cancelled) {
          return;
        }
        setVideos([]);
        setError(
          err instanceof Error ? err.message : 'Failed to load playlist videos.',
        );
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [playlistUrl, reloadToken]);

  return { videos, loading, error, reload };
}
