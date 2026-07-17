import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  type NotificationPreferences,
} from '../../constants/notificationPreferences';
import { wrapFirebaseError } from '../../utils/firebase/errors';
import { FIRESTORE_COLLECTIONS } from './constants';
import { db, doc, getDoc, serverTimestamp, setDoc } from './firestoreClient';

const NOTIFICATION_PREFERENCES_DOC_ID = 'current';

function preferencesDocRef(uid: string) {
  return doc(
    db,
    FIRESTORE_COLLECTIONS.users,
    uid,
    'notificationPreferences',
    NOTIFICATION_PREFERENCES_DOC_ID,
  );
}

function parseFirestorePreferences(
  data: Record<string, unknown> | undefined,
): NotificationPreferences {
  if (!data) {
    return { ...DEFAULT_NOTIFICATION_PREFERENCES };
  }

  const merged = { ...DEFAULT_NOTIFICATION_PREFERENCES };
  for (const key of Object.keys(
    DEFAULT_NOTIFICATION_PREFERENCES,
  ) as (keyof NotificationPreferences)[]) {
    const value = data[key];
    if (typeof value === 'boolean') {
      merged[key] = value;
    }
  }
  return merged;
}

export async function syncNotificationPreferencesToFirestore(
  uid: string,
  preferences: NotificationPreferences,
): Promise<void> {
  try {
    await setDoc(
      preferencesDocRef(uid),
      {
        ...preferences,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  } catch (error) {
    throw wrapFirebaseError(
      error,
      'NOTIFICATION_PREFERENCES_SYNC_ERROR',
      'Failed to sync notification preferences.',
    );
  }
}

export async function loadNotificationPreferencesFromFirestore(
  uid: string,
): Promise<NotificationPreferences | null> {
  try {
    const snapshot = await getDoc(preferencesDocRef(uid));
    if (!snapshot.exists()) {
      return null;
    }
    return parseFirestorePreferences(
      snapshot.data() as Record<string, unknown>,
    );
  } catch {
    return null;
  }
}
