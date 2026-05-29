import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';

import type { ContinueLearningProgress } from '../../store/content/types/continueLearningProgress.types';
import { clampVideoProgress } from '../../utils/continueLearning/formatVideoProgress';
import { assertAuthenticatedUserId } from '../../utils/firebase/assertAuthenticated';
import { wrapFirebaseError } from '../../utils/firebase/errors';
import { syncFirestoreAuthSession } from '../../utils/firebase/firestoreSessionSync';
import { FIRESTORE_COLLECTIONS } from './constants';

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
  return firestore()
    .collection(FIRESTORE_COLLECTIONS.users)
    .doc(uid)
    .collection(PROGRESS_SUBCOLLECTION);
}

function mapProgress(
  playlistId: string,
  data: { videosWatched?: number; updatedAt?: unknown } | undefined,
): ContinueLearningProgress {
  return {
    playlistId,
    videosWatched:
      typeof data?.videosWatched === 'number'
        ? Math.max(0, Math.trunc(data.videosWatched))
        : 0,
    updatedAt: isTimestamp(data?.updatedAt) ? data.updatedAt : null,
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

  return progressCollection(uid).onSnapshot(
    snapshot => {
      const map: Record<string, ContinueLearningProgress> = {};
      snapshot.docs.forEach(doc => {
        map[doc.id] = mapProgress(doc.id, doc.data());
      });
      listener(map);
    },
    error => onError?.(error),
  );
}

/** Increments watched count when the user opens the playlist (capped at videoCount). */
export async function recordPlaylistVideoEngagement(
  playlistId: string,
  videoCount: number,
): Promise<void> {
  try {
    const uid = await syncFirestoreAuthSession();
    const { total } = clampVideoProgress(0, videoCount);
    const ref = progressCollection(uid).doc(playlistId);

    await firestore().runTransaction(async transaction => {
      const snapshot = await transaction.get(ref);
      const current = snapshot.exists
        ? Math.max(0, Math.trunc(snapshot.data()?.videosWatched ?? 0))
        : 0;
      const next = Math.min(total, current + 1);

      if (snapshot.exists && next === current) {
        return;
      }

      transaction.set(
        ref,
        {
          videosWatched: next,
          updatedAt: firestore.FieldValue.serverTimestamp(),
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
