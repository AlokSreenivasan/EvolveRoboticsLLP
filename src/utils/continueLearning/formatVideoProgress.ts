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
