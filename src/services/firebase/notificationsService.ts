import type {
  DocumentData,
  FirebaseFirestoreTypes,
  UpdateData,
} from '@react-native-firebase/firestore';

import type { ContentSubscribeOptions } from '../../store/content/types/schoolAudience.types';
import {
  DEFAULT_NOTIFICATION_CATEGORY,
  normalizeNotificationCategory,
} from '../../constants/notificationCategories';
import type {
  AppNotification,
  AppNotificationDocument,
  CreateAppNotificationInput,
  UpdateAppNotificationInput,
} from '../../store/content/types/notifications.types';
import {
  applyLearnerContentFilters,
  buildTrackAwareSchoolAudienceWriteFields,
  mapContentTrack,
  mapSchoolAudienceFields,
  shouldApplyTrackAwareSchoolAudienceUpdate,
} from './schoolAudienceFirestore';
import { isCourseTrack } from '../../store/content/types/courses.types';
import { wrapFirebaseError } from '../../utils/firebase/errors';
import { FIRESTORE_COLLECTIONS } from './constants';
import {
  collection,
  db,
  deleteDoc,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  writeBatch,
} from './firestoreClient';

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

function notificationsCollection() {
  return collection(db, FIRESTORE_COLLECTIONS.notifications);
}

function mapNotification(
  id: string,
  data: AppNotificationDocument,
): AppNotification {
  return {
    id,
    title: data.title?.trim() ?? '',
    body: data.body?.trim() ?? '',
    category: normalizeNotificationCategory(data.category),
    track: mapContentTrack(data),
    sortOrder: typeof data.sortOrder === 'number' ? data.sortOrder : 0,
    isPublished: data.isPublished === true,
    lastSentAt: isTimestamp(data.lastSentAt) ? data.lastSentAt : null,
    createdAt: isTimestamp(data.createdAt) ? data.createdAt : null,
    updatedAt: isTimestamp(data.updatedAt) ? data.updatedAt : null,
    ...mapSchoolAudienceFields(data),
  };
}

function sortNotifications(items: AppNotification[]): AppNotification[] {
  return [...items].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function subscribeNotifications(
  listener: (notifications: AppNotification[]) => void,
  options?: ContentSubscribeOptions,
  onError?: (error: unknown) => void,
): () => void {
  const notificationsQuery = query(
    notificationsCollection(),
    orderBy('sortOrder', 'asc'),
  );

  return onSnapshot(
    notificationsQuery,
    snapshot => {
      const items = snapshot.docs.map(notificationDoc =>
        mapNotification(
          notificationDoc.id,
          notificationDoc.data() as AppNotificationDocument,
        ),
      );

      listener(
        sortNotifications(applyLearnerContentFilters(items, options)),
      );
    },
    error => onError?.(error),
  );
}

async function getNextSortOrder(): Promise<number> {
  const snapshot = await getDocs(
    query(notificationsCollection(), orderBy('sortOrder', 'desc'), limit(1)),
  );

  if (snapshot.empty) {
    return 0;
  }

  const top = snapshot.docs[0].data() as AppNotificationDocument;
  return (typeof top.sortOrder === 'number' ? top.sortOrder : 0) + 1;
}

export async function createNotification(
  input: CreateAppNotificationInput,
): Promise<AppNotification> {
  try {
    if (!isCourseTrack(input.track)) {
      throw wrapFirebaseError(
        new Error('Notification track is required.'),
        'FIRESTORE_ERROR',
        'Select whether this notification is for kids or professionals.',
      );
    }

    const sortOrder = Math.trunc(await getNextSortOrder());
    const ref = doc(notificationsCollection());
    const payload: AppNotificationDocument = {
      title: input.title.trim(),
      body: input.body.trim(),
      category: input.category ?? DEFAULT_NOTIFICATION_CATEGORY,
      track: input.track,
      sortOrder,
      isPublished: input.isPublished ?? true,
      ...buildTrackAwareSchoolAudienceWriteFields(input.track, input),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(ref, payload);

    return mapNotification(ref.id, {
      ...payload,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    throw wrapFirebaseError(
      error,
      'FIRESTORE_ERROR',
      'Failed to create notification.',
    );
  }
}

export async function updateNotification(
  notificationId: string,
  input: UpdateAppNotificationInput,
): Promise<void> {
  try {
    const updates: Record<string, unknown> = {
      updatedAt: serverTimestamp(),
    };

    if (input.title !== undefined) {
      updates.title = input.title.trim();
    }
    if (input.body !== undefined) {
      updates.body = input.body.trim();
    }
    if (input.category !== undefined) {
      updates.category = input.category;
    }
    if (input.sortOrder !== undefined) {
      updates.sortOrder = input.sortOrder;
    }
    if (input.isPublished !== undefined) {
      updates.isPublished = input.isPublished;
    }
    if (input.track !== undefined) {
      if (!isCourseTrack(input.track)) {
        throw wrapFirebaseError(
          new Error('Notification track is required.'),
          'FIRESTORE_ERROR',
          'Select whether this notification is for kids or professionals.',
        );
      }
      updates.track = input.track;
    }
    if (shouldApplyTrackAwareSchoolAudienceUpdate(input)) {
      Object.assign(
        updates,
        buildTrackAwareSchoolAudienceWriteFields(
          input.track === 'professionals' ? 'professionals' : input.track ?? 'kids',
          input,
        ),
      );
    }

    await updateDoc(
      doc(notificationsCollection(), notificationId),
      updates as UpdateData<DocumentData>,
    );
  } catch (error) {
    throw wrapFirebaseError(
      error,
      'FIRESTORE_ERROR',
      'Failed to update notification.',
    );
  }
}

export async function deleteNotification(notificationId: string): Promise<void> {
  try {
    await deleteDoc(doc(notificationsCollection(), notificationId));
  } catch (error) {
    throw wrapFirebaseError(
      error,
      'FIRESTORE_ERROR',
      'Failed to delete notification.',
    );
  }
}

export async function reorderNotifications(
  orderedIds: string[],
): Promise<void> {
  if (orderedIds.length === 0) {
    return;
  }

  try {
    const batch = writeBatch(db);

    orderedIds.forEach((id, index) => {
      batch.update(doc(notificationsCollection(), id), {
        sortOrder: Math.trunc(index),
        updatedAt: serverTimestamp(),
      });
    });

    await batch.commit();
  } catch (error) {
    throw wrapFirebaseError(
      error,
      'FIRESTORE_ERROR',
      'Failed to reorder notifications.',
    );
  }
}

export async function moveNotification(
  notificationId: string,
  direction: 'up' | 'down',
  currentNotifications: AppNotification[],
): Promise<void> {
  const ids = currentNotifications.map(item => item.id);
  const index = ids.indexOf(notificationId);

  if (index < 0) {
    return;
  }

  const targetIndex = direction === 'up' ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= ids.length) {
    return;
  }

  const nextIds = [...ids];
  const [removed] = nextIds.splice(index, 1);
  nextIds.splice(targetIndex, 0, removed);

  await reorderNotifications(nextIds);
}
