/** Minimum seconds watched on a video before the next lesson unlocks. */
export const VIDEO_UNLOCK_WATCH_SECONDS = 60;

/** Next-video controls unlock when this many seconds (or fewer) remain. */
export const VIDEO_NEAR_END_SECONDS = 60;

export function getVideoWatchSeconds(
  watchSecondsByVideoId: Record<string, number>,
  videoId: string,
): number {
  return Math.max(0, Math.trunc(watchSecondsByVideoId[videoId] ?? 0));
}

/** True when playback is in the last minute (or the video has ended). */
export function isPlaybackNearEnd(
  currentTimeSeconds: number,
  durationSeconds: number,
): boolean {
  const duration = Math.max(0, durationSeconds);
  if (duration <= 0) {
    return false;
  }
  const current = Math.max(0, currentTimeSeconds);
  const remaining = duration - current;
  return remaining <= VIDEO_NEAR_END_SECONDS;
}

export function isVideoUnlocked(
  watchSecondsByVideoId: Record<string, number>,
  videos: { videoId: string }[],
  index: number,
): boolean {
  if (index <= 0) {
    return true;
  }
  const previousVideo = videos[index - 1];
  if (!previousVideo) {
    return false;
  }
  return (
    getVideoWatchSeconds(watchSecondsByVideoId, previousVideo.videoId) >=
    VIDEO_UNLOCK_WATCH_SECONDS
  );
}

export function clampVideoProgress(
  videosWatched: number,
  videoCount: number,
): { watched: number; total: number } {
  const total = Math.max(1, Math.trunc(videoCount));
  const watched = Math.max(0, Math.min(Math.trunc(videosWatched), total));
  return { watched, total };
}

export function computeProgressPercent(
  videosWatched: number,
  videoCount: number,
): number {
  const { watched, total } = clampVideoProgress(videosWatched, videoCount);
  return Math.min(100, Math.round((watched / total) * 100));
}

/** True when the user has opened at least one lesson video. */
export function isPlaylistInProgress(
  videosWatched: number,
  hasStartedWatching: boolean,
): boolean {
  if (hasStartedWatching) {
    return true;
  }
  // Legacy docs: opening the playlist alone only ever set videosWatched to 1.
  return videosWatched > 1;
}

/** Standard home card label, e.g. "5/12 Videos". */
export function formatVideoProgressLabel(
  videosWatched: number,
  videoCount: number,
): string {
  const { watched, total } = clampVideoProgress(videosWatched, videoCount);
  return `${watched}/${total} Videos`;
}

/** Playlist card footer, e.g. "12 Videos". */
export function formatPlaylistVideoCountLabel(videoCount: number): string {
  const total = Math.max(1, Math.trunc(videoCount));
  return `${total} ${total === 1 ? 'Video' : 'Videos'}`;
}
