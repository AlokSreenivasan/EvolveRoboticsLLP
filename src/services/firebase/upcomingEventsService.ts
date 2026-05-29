import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';

import { DEFAULT_UPCOMING_EVENTS_SECTION } from '../../constants/upcomingEventsDefaults';
import type {
  CreateUpcomingEventInput,
  UpcomingEvent,
  UpcomingEventDocument,
  UpcomingEventsSection,
  UpcomingEventsSectionDocument,
  UpdateUpcomingEventInput,
  UpdateUpcomingEventsSectionInput,
} from '../../store/content/types/upcomingEvents.types';
import { wrapFirebaseError } from '../../utils/firebase/errors';
import { APP_CONTENT_DOCS, FIRESTORE_COLLECTIONS } from './constants';

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

function sectionDocRef() {
  return firestore()
    .collection(FIRESTORE_COLLECTIONS.appContent)
    .doc(APP_CONTENT_DOCS.upcomingEventsSection);
}

function eventsCollection() {
  return firestore().collection(FIRESTORE_COLLECTIONS.upcomingEvents);
}

function mapSection(
  data: UpcomingEventsSectionDocument | undefined,
): UpcomingEventsSection {
  if (!data) {
    return DEFAULT_UPCOMING_EVENTS_SECTION;
  }

  return {
    sectionTitle:
      data.sectionTitle?.trim() || DEFAULT_UPCOMING_EVENTS_SECTION.sectionTitle,
    sectionSubtitle:
      data.sectionSubtitle?.trim() ??
      DEFAULT_UPCOMING_EVENTS_SECTION.sectionSubtitle,
    actionLabel:
      data.actionLabel?.trim() || DEFAULT_UPCOMING_EVENTS_SECTION.actionLabel,
    updatedAt: isTimestamp(data.updatedAt) ? data.updatedAt : null,
  };
}

function mapEvent(id: string, data: UpcomingEventDocument): UpcomingEvent {
  return {
    id,
    month: data.month?.trim().toUpperCase() ?? '',
    day: data.day?.trim() ?? '',
    title: data.title?.trim() ?? '',
    dateRange: data.dateRange?.trim() ?? '',
    timeRange: data.timeRange?.trim() ?? '',
    daysLeftLabel: data.daysLeftLabel?.trim() ?? '',
    sortOrder: typeof data.sortOrder === 'number' ? data.sortOrder : 0,
    isPublished: data.isPublished === true,
    createdAt: isTimestamp(data.createdAt) ? data.createdAt : null,
    updatedAt: isTimestamp(data.updatedAt) ? data.updatedAt : null,
  };
}

function sortEvents(events: UpcomingEvent[]): UpcomingEvent[] {
  return [...events].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function subscribeUpcomingEventsSection(
  listener: (section: UpcomingEventsSection) => void,
  onError?: (error: unknown) => void,
): () => void {
  return sectionDocRef().onSnapshot(
    snapshot => {
      const data = snapshot.data() as UpcomingEventsSectionDocument | undefined;
      listener(mapSection(data));
    },
    error => onError?.(error),
  );
}

export function subscribeUpcomingEvents(
  listener: (events: UpcomingEvent[]) => void,
  options?: { includeUnpublished?: boolean },
  onError?: (error: unknown) => void,
): () => void {
  const includeUnpublished = options?.includeUnpublished === true;

  return eventsCollection()
    .orderBy('sortOrder', 'asc')
    .onSnapshot(
      snapshot => {
        const events = snapshot.docs.map(doc =>
          mapEvent(doc.id, doc.data() as UpcomingEventDocument),
        );
        const filtered = includeUnpublished
          ? events
          : events.filter(event => event.isPublished);
        listener(sortEvents(filtered));
      },
      error => onError?.(error),
    );
}

export async function ensureUpcomingEventsSectionDefaults(): Promise<void> {
  try {
    const snapshot = await sectionDocRef().get();
    if (snapshot.exists) {
      return;
    }

    const payload: UpcomingEventsSectionDocument = {
      ...DEFAULT_UPCOMING_EVENTS_SECTION,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    };

    await sectionDocRef().set(payload);
  } catch (error) {
    throw wrapFirebaseError(
      error,
      'FIRESTORE_ERROR',
      'Failed to initialize upcoming events section.',
    );
  }
}

export async function updateUpcomingEventsSection(
  input: UpdateUpcomingEventsSectionInput,
): Promise<UpcomingEventsSection> {
  try {
    const payload: UpcomingEventsSectionDocument = {
      sectionTitle: input.sectionTitle.trim(),
      sectionSubtitle: input.sectionSubtitle.trim(),
      actionLabel: input.actionLabel.trim(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    };

    await sectionDocRef().set(payload, { merge: true });

    return {
      sectionTitle: payload.sectionTitle,
      sectionSubtitle: payload.sectionSubtitle,
      actionLabel: payload.actionLabel,
      updatedAt: null,
    };
  } catch (error) {
    throw wrapFirebaseError(
      error,
      'FIRESTORE_ERROR',
      'Failed to update section settings.',
    );
  }
}

async function getNextSortOrder(): Promise<number> {
  const snapshot = await eventsCollection()
    .orderBy('sortOrder', 'desc')
    .limit(1)
    .get();

  if (snapshot.empty) {
    return 0;
  }

  const top = snapshot.docs[0].data() as UpcomingEventDocument;
  return (typeof top.sortOrder === 'number' ? top.sortOrder : 0) + 1;
}

export async function createUpcomingEvent(
  input: CreateUpcomingEventInput,
): Promise<UpcomingEvent> {
  try {
    const sortOrder = Math.trunc(await getNextSortOrder());
    const ref = eventsCollection().doc();
    const payload: UpcomingEventDocument = {
      month: input.month.trim().toUpperCase().slice(0, 20),
      day: input.day.trim().slice(0, 10),
      title: input.title.trim(),
      dateRange: input.dateRange.trim(),
      timeRange: input.timeRange.trim(),
      daysLeftLabel: input.daysLeftLabel.trim(),
      sortOrder,
      isPublished: input.isPublished ?? true,
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    };

    await ref.set(payload);

    return mapEvent(ref.id, {
      ...payload,
      createdAt: firestore.Timestamp.now(),
      updatedAt: firestore.Timestamp.now(),
    });
  } catch (error) {
    throw wrapFirebaseError(error, 'FIRESTORE_ERROR', 'Failed to create event.');
  }
}

export async function updateUpcomingEvent(
  eventId: string,
  input: UpdateUpcomingEventInput,
): Promise<void> {
  try {
    const updates: Record<string, unknown> = {
      updatedAt: firestore.FieldValue.serverTimestamp(),
    };

    if (input.month !== undefined) {
      updates.month = input.month.trim().toUpperCase();
    }
    if (input.day !== undefined) {
      updates.day = input.day.trim();
    }
    if (input.title !== undefined) {
      updates.title = input.title.trim();
    }
    if (input.dateRange !== undefined) {
      updates.dateRange = input.dateRange.trim();
    }
    if (input.timeRange !== undefined) {
      updates.timeRange = input.timeRange.trim();
    }
    if (input.daysLeftLabel !== undefined) {
      updates.daysLeftLabel = input.daysLeftLabel.trim();
    }
    if (input.sortOrder !== undefined) {
      updates.sortOrder = input.sortOrder;
    }
    if (input.isPublished !== undefined) {
      updates.isPublished = input.isPublished;
    }

    await eventsCollection().doc(eventId).update(updates);
  } catch (error) {
    throw wrapFirebaseError(error, 'FIRESTORE_ERROR', 'Failed to update event.');
  }
}

export async function deleteUpcomingEvent(eventId: string): Promise<void> {
  try {
    await eventsCollection().doc(eventId).delete();
  } catch (error) {
    throw wrapFirebaseError(error, 'FIRESTORE_ERROR', 'Failed to delete event.');
  }
}

export async function reorderUpcomingEvents(
  orderedIds: string[],
): Promise<void> {
  if (orderedIds.length === 0) {
    return;
  }

  try {
    const batch = firestore().batch();

    orderedIds.forEach((id, index) => {
      const ref = eventsCollection().doc(id);
      batch.update(ref, {
        sortOrder: Math.trunc(index),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
    });

    await batch.commit();
  } catch (error) {
    throw wrapFirebaseError(
      error,
      'FIRESTORE_ERROR',
      'Failed to reorder events.',
    );
  }
}

export async function moveUpcomingEvent(
  eventId: string,
  direction: 'up' | 'down',
  currentEvents: UpcomingEvent[],
): Promise<void> {
  const ids = currentEvents.map(event => event.id);
  const index = ids.indexOf(eventId);

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

  await reorderUpcomingEvents(nextIds);
}
