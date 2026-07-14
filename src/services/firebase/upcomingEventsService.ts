import type {
  DocumentData,
  FirebaseFirestoreTypes,
  UpdateData,
} from '@react-native-firebase/firestore';

import { DEFAULT_UPCOMING_EVENTS_SECTION } from '../../constants/upcomingEventsDefaults';
import type { ContentSubscribeOptions } from '../../store/content/types/schoolAudience.types';
import type {
  CreateUpcomingEventInput,
  UpcomingEvent,
  UpcomingEventDocument,
  UpcomingEventsSection,
  UpcomingEventsSectionDocument,
  UpdateUpcomingEventInput,
  UpdateUpcomingEventsSectionInput,
} from '../../store/content/types/upcomingEvents.types';
import {
  applyLearnerContentFilters,
  buildTrackAwareSchoolAudienceWriteFields,
  mapContentTrack,
  mapSchoolAudienceFields,
  shouldApplyTrackAwareSchoolAudienceUpdate,
} from './schoolAudienceFirestore';
import { isCourseTrack } from '../../store/content/types/courses.types';
import { parseStoredEventYear } from '../../utils/upcomingEventDate';
import { wrapFirebaseError } from '../../utils/firebase/errors';
import { APP_CONTENT_DOCS, FIRESTORE_COLLECTIONS } from './constants';
import { buildSortedContentListQuery } from './contentListQuery';
import {
  collection,
  db,
  deleteDoc,
  doc,
  getDoc,
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

function sectionDocRef() {
  return doc(
    db,
    FIRESTORE_COLLECTIONS.appContent,
    APP_CONTENT_DOCS.upcomingEventsSection,
  );
}

function eventsCollection() {
  return collection(db, FIRESTORE_COLLECTIONS.upcomingEvents);
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
    year: parseStoredEventYear(data.year),
    title: data.title?.trim() ?? '',
    dateRange: data.dateRange?.trim() ?? '',
    timeRange: data.timeRange?.trim() ?? '',
    daysLeftLabel: data.daysLeftLabel?.trim() ?? '',
    track: mapContentTrack(data),
    sortOrder: typeof data.sortOrder === 'number' ? data.sortOrder : 0,
    isPublished: data.isPublished === true,
    createdAt: isTimestamp(data.createdAt) ? data.createdAt : null,
    updatedAt: isTimestamp(data.updatedAt) ? data.updatedAt : null,
    ...mapSchoolAudienceFields(data),
  };
}

function sortEvents(events: UpcomingEvent[]): UpcomingEvent[] {
  return [...events].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function subscribeUpcomingEventsSection(
  listener: (section: UpcomingEventsSection) => void,
  onError?: (error: unknown) => void,
): () => void {
  return onSnapshot(
    sectionDocRef(),
    snapshot => {
      const data = snapshot.data() as UpcomingEventsSectionDocument | undefined;
      listener(mapSection(data));
    },
    error => onError?.(error),
  );
}

export function subscribeUpcomingEvents(
  listener: (events: UpcomingEvent[]) => void,
  options?: ContentSubscribeOptions,
  onError?: (error: unknown) => void,
): () => void {
  const eventsQuery = buildSortedContentListQuery(eventsCollection(), options);

  return onSnapshot(
    eventsQuery,
    snapshot => {
      const events = snapshot.docs.map(eventDoc =>
        mapEvent(eventDoc.id, eventDoc.data() as UpcomingEventDocument),
      );
      listener(sortEvents(applyLearnerContentFilters(events, options)));
    },
    error => onError?.(error),
  );
}

export async function ensureUpcomingEventsSectionDefaults(): Promise<void> {
  try {
    const snapshot = await getDoc(sectionDocRef());
    if (snapshot.exists()) {
      return;
    }

    const payload: UpcomingEventsSectionDocument = {
      ...DEFAULT_UPCOMING_EVENTS_SECTION,
      updatedAt: serverTimestamp(),
    };

    await setDoc(sectionDocRef(), payload);
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
      updatedAt: serverTimestamp(),
    };

    await setDoc(sectionDocRef(), payload, { merge: true });

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
  const snapshot = await getDocs(
    query(eventsCollection(), orderBy('sortOrder', 'desc'), limit(1)),
  );

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
    if (!isCourseTrack(input.track)) {
      throw wrapFirebaseError(
        new Error('Event track is required.'),
        'FIRESTORE_ERROR',
        'Select whether this event is for kids or professionals.',
      );
    }

    const sortOrder = Math.trunc(await getNextSortOrder());
    const ref = doc(eventsCollection());
    const payload: UpcomingEventDocument = {
      month: input.month.trim().toUpperCase().slice(0, 20),
      day: input.day.trim().slice(0, 10),
      year: Math.trunc(input.year),
      title: input.title.trim(),
      dateRange: input.dateRange.trim(),
      timeRange: input.timeRange.trim(),
      daysLeftLabel: input.daysLeftLabel.trim(),
      track: input.track,
      sortOrder,
      isPublished: input.isPublished ?? true,
      ...buildTrackAwareSchoolAudienceWriteFields(input.track, input),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(ref, payload);

    return mapEvent(ref.id, {
      ...payload,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
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
      updatedAt: serverTimestamp(),
    };

    if (input.month !== undefined) {
      updates.month = input.month.trim().toUpperCase();
    }
    if (input.day !== undefined) {
      updates.day = input.day.trim();
    }
    if (input.year !== undefined) {
      updates.year = Math.trunc(input.year);
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
    if (input.track !== undefined) {
      if (!isCourseTrack(input.track)) {
        throw wrapFirebaseError(
          new Error('Event track is required.'),
          'FIRESTORE_ERROR',
          'Select whether this event is for kids or professionals.',
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

    await updateDoc(doc(eventsCollection(), eventId), updates as UpdateData<DocumentData>);
  } catch (error) {
    throw wrapFirebaseError(error, 'FIRESTORE_ERROR', 'Failed to update event.');
  }
}

export async function deleteUpcomingEvent(eventId: string): Promise<void> {
  try {
    await deleteDoc(doc(eventsCollection(), eventId));
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
    const batch = writeBatch(db);

    orderedIds.forEach((id, index) => {
      batch.update(doc(eventsCollection(), id), {
        sortOrder: Math.trunc(index),
        updatedAt: serverTimestamp(),
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
