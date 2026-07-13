import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

import type { ContinueLearningProgress } from '../../store/content/types/continueLearningProgress.types';
import {
  clampVideoProgress,
  VIDEO_UNLOCK_WATCH_SECONDS,
} from '../../utils/continueLearning/formatVideoProgress';
import { assertAuthenticatedUserId } from '../../utils/firebase/assertAuthenticated';
import { wrapFirebaseError } from '../../utils/firebase/errors';
import { syncFirestoreAuthSession } from '../../utils/firebase/firestoreSessionSync';
import { FIRESTORE_COLLECTIONS } from './constants';
import {
  collection,
  db,
  doc,
  onSnapshot,
  runTransaction,
  serverTimestamp,
} from './firestoreClient';

const PROGRESS_SUBCOLLECTION = 'continueLearningProgress';

function isTimestamp(
  value: unknown,
): value is FirebaseFirestoreTypes.Timestamp {
  return (
    value != null &&
    typeof value === 'object' &&
    'toDate' in value &&
    typeof (value as FirebaseFirestoreTypes.Timestamp).toDate === 'function'
  );
}

function progressCollection(uid: string) {
  return collection(
    db,
    FIRESTORE_COLLECTIONS.users,
    uid,
    PROGRESS_SUBCOLLECTION,
  );
}

function mapWatchSecondsByVideoId(
  value: unknown,
): Record<string, number> {
  if (value == null || typeof value !== 'object') {
    return {};
  }
  const mapped: Record<string, number> = {};
  Object.entries(value as Record<string, unknown>).forEach(([videoId, seconds]) => {
    if (typeof seconds === 'number' && Number.isFinite(seconds)) {
      mapped[videoId] = Math.max(0, Math.min(Math.trunc(seconds), 86400));
    }
  });
  return mapped;
}

function mapProgress(
  playlistId: string,
  data:
    | {
        videosWatched?: number;
        hasStartedWatching?: boolean;
        watchSecondsByVideoId?: unknown;
        updatedAt?: unknown;
      }
    | undefined,
): ContinueLearningProgress {
  return {
    playlistId,
    videosWatched:
      typeof data?.videosWatched === 'number'
        ? Math.max(0, Math.trunc(data.videosWatched))
        : 0,
    hasStartedWatching: data?.hasStartedWatching === true,
    watchSecondsByVideoId: mapWatchSecondsByVideoId(
      data?.watchSecondsByVideoId,
    ),
    updatedAt: isTimestamp(data?.updatedAt) ? (data?.updatedAt ?? null) : null,
  };
}

export function subscribeContinueLearningProgress(
  listener: (progressByPlaylistId: Record<string, ContinueLearningProgress>) => void,
  onError?: (error: unknown) => void,
): () => void {
  const uid = assertAuthenticatedUserId();
  if (!uid) {
    listener({});
    return () => undefined;
  }

  return onSnapshot(
    progressCollection(uid),
    snapshot => {
      const map: Record<string, ContinueLearningProgress> = {};
      snapshot.docs.forEach(progressDoc => {
        map[progressDoc.id] = mapProgress(progressDoc.id, progressDoc.data());
      });
      listener(map);
    },
    error => onError?.(error),
  );
}

/** Sets progress to at least the given 1-based video number (capped at videoCount). */
export async function recordPlaylistVideoProgress(
  playlistId: string,
  videoNumber: number,
  videoCount: number,
): Promise<void> {
  try {
    const uid = await syncFirestoreAuthSession();
    const { total } = clampVideoProgress(0, videoCount);
    const target = Math.min(total, Math.max(1, Math.trunc(videoNumber)));
    const ref = doc(progressCollection(uid), playlistId);

    await runTransaction(db, async transaction => {
      const snapshot = await transaction.get(ref);
      const current = snapshot.exists()
        ? Math.max(0, Math.trunc(snapshot.data()?.videosWatched ?? 0))
        : 0;
      const next = Math.min(total, Math.max(current, target));

      if (snapshot.exists() && next === current) {
        return;
      }

      transaction.set(
        ref,
        {
          videosWatched: next,
          hasStartedWatching: true,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
    });
  } catch (error) {
    throw wrapFirebaseError(
      error,
      'FIRESTORE_ERROR',
      'Failed to update playlist progress.',
    );
  }
}

/** Persists watch time for a single video; next lesson unlocks at 60s (last minute). */
export async function recordVideoWatchSeconds(
  playlistId: string,
  videoId: string,
  watchSeconds: number,
  videoNumber: number,
  videoCount: number,
): Promise<void> {
  try {
    const uid = await syncFirestoreAuthSession();
    const { total } = clampVideoProgress(0, videoCount);
    const targetSeconds = Math.max(
      0,
      Math.min(Math.trunc(watchSeconds), 86400),
    );
    const targetVideoNumber = Math.min(
      total,
      Math.max(1, Math.trunc(videoNumber)),
    );
    const ref = doc(progressCollection(uid), playlistId);

    await runTransaction(db, async transaction => {
      const snapshot = await transaction.get(ref);
      const data = snapshot.data();
      const currentMap = mapWatchSecondsByVideoId(data?.watchSecondsByVideoId);
      const currentSeconds = currentMap[videoId] ?? 0;
      const nextSeconds = Math.max(currentSeconds, targetSeconds);
      const currentVideosWatched = snapshot.exists()
        ? Math.max(0, Math.trunc(data?.videosWatched ?? 0))
        : 0;
      const nextVideosWatched =
        nextSeconds >= VIDEO_UNLOCK_WATCH_SECONDS
          ? Math.min(total, Math.max(currentVideosWatched, targetVideoNumber))
          : currentVideosWatched;

      if (
        snapshot.exists() &&
        nextSeconds === currentSeconds &&
        nextVideosWatched === currentVideosWatched
      ) {
        return;
      }

      transaction.set(
        ref,
        {
          watchSecondsByVideoId: {
            ...currentMap,
            [videoId]: nextSeconds,
          },
          videosWatched: nextVideosWatched,
          hasStartedWatching: true,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
    });
  } catch (error) {
    throw wrapFirebaseError(
      error,
      'FIRESTORE_ERROR',
      'Failed to update video watch time.',
    );
  }
}
