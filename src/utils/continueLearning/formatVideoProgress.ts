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

/** Standard home card label, e.g. "5/12 Videos". */
export function formatVideoProgressLabel(
  videosWatched: number,
  videoCount: number,
): string {
  const { watched, total } = clampVideoProgress(videosWatched, videoCount);
  return `${watched}/${total} Videos`;
}
