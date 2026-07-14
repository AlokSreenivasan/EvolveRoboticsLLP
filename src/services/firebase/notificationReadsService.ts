import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

import type {
  NotificationRead,
  NotificationReadDocument,
} from '../../store/content/types/notificationReads.types';
import { getCurrentUserId } from './authService';
import { wrapFirebaseError } from '../../utils/firebase/errors';
import { syncFirestoreAuthSession } from '../../utils/firebase/firestoreSessionSync';
import { FIRESTORE_COLLECTIONS } from './constants';
import {
  collection,
  db,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from './firestoreClient';

const READS_SUBCOLLECTION = 'notificationReads';

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

function readsCollection(uid: string) {
  return collection(
    db,
    FIRESTORE_COLLECTIONS.users,
    uid,
    READS_SUBCOLLECTION,
  );
}

function mapRead(
  notificationId: string,
  data: NotificationReadDocument | undefined,
): NotificationRead {
  return {
    notificationId,
    readAt: isTimestamp(data?.readAt) ? (data?.readAt ?? null) : null,
  };
}

/**
 * Realtime map of notification IDs the signed-in user has marked as read.
 */
export function subscribeNotificationReads(
  listener: (readByNotificationId: Record<string, NotificationRead>) => void,
  onError?: (error: unknown) => void,
): () => void {
  const uid = getCurrentUserId();
  if (!uid) {
    listener({});
    return () => undefined;
  }

  return onSnapshot(
    readsCollection(uid),
    snapshot => {
      const map: Record<string, NotificationRead> = {};
      snapshot.docs.forEach(readDoc => {
        map[readDoc.id] = mapRead(
          readDoc.id,
          readDoc.data() as NotificationReadDocument,
        );
      });
      listener(map);
    },
    error => onError?.(error),
  );
}

export async function markNotificationAsRead(
  notificationId: string,
): Promise<void> {
  const trimmedId = notificationId.trim();
  if (!trimmedId) {
    return;
  }

  try {
    const uid = await syncFirestoreAuthSession();
    const ref = doc(readsCollection(uid), trimmedId);
    const payload: NotificationReadDocument = {
      readAt: serverTimestamp(),
    };
    await setDoc(ref, payload, { merge: true });
  } catch (error) {
    throw wrapFirebaseError(
      error,
      'FIRESTORE_ERROR',
      'Failed to mark notification as read.',
    );
  }
}
