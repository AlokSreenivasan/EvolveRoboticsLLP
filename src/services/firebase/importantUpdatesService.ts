import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';

import {
  DEFAULT_IMPORTANT_UPDATES_SECTION,
} from '../../constants/importantUpdatesDefaults';
import type {
  CreateImportantUpdateNoticeInput,
  ImportantUpdateNotice,
  ImportantUpdateNoticeDocument,
  ImportantUpdatesSection,
  ImportantUpdatesSectionDocument,
  UpdateImportantUpdateNoticeInput,
  UpdateImportantUpdatesSectionInput,
} from '../../store/content/types/importantUpdates.types';
import { wrapFirebaseError } from '../../utils/firebase/errors';
import {
  APP_CONTENT_DOCS,
  FIRESTORE_COLLECTIONS,
} from './constants';

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
    .doc(APP_CONTENT_DOCS.importantUpdatesSection);
}

function noticesCollection() {
  return firestore().collection(FIRESTORE_COLLECTIONS.importantUpdates);
}

function mapSection(
  data: ImportantUpdatesSectionDocument | undefined,
): ImportantUpdatesSection {
  if (!data) {
    return DEFAULT_IMPORTANT_UPDATES_SECTION;
  }

  return {
    sectionTitle: data.sectionTitle?.trim() || DEFAULT_IMPORTANT_UPDATES_SECTION.sectionTitle,
    sectionSubtitle:
      data.sectionSubtitle?.trim() ??
      DEFAULT_IMPORTANT_UPDATES_SECTION.sectionSubtitle,
    actionLabel:
      data.actionLabel?.trim() || DEFAULT_IMPORTANT_UPDATES_SECTION.actionLabel,
    updatedAt: isTimestamp(data.updatedAt) ? data.updatedAt : null,
  };
}

function mapNotice(
  id: string,
  data: ImportantUpdateNoticeDocument,
): ImportantUpdateNotice {
  return {
    id,
    tag: data.tag?.trim() ?? '',
    title: data.title?.trim() ?? '',
    subtitle: data.subtitle?.trim() ?? '',
    description: data.description?.trim() ?? '',
    sortOrder: typeof data.sortOrder === 'number' ? data.sortOrder : 0,
    isPublished: data.isPublished === true,
    createdAt: isTimestamp(data.createdAt) ? data.createdAt : null,
    updatedAt: isTimestamp(data.updatedAt) ? data.updatedAt : null,
  };
}

function sortNotices(notices: ImportantUpdateNotice[]): ImportantUpdateNotice[] {
  return [...notices].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function subscribeImportantUpdatesSection(
  listener: (section: ImportantUpdatesSection) => void,
  onError?: (error: unknown) => void,
): () => void {
  return sectionDocRef().onSnapshot(
    snapshot => {
      const data = snapshot.data() as ImportantUpdatesSectionDocument | undefined;
      listener(mapSection(data));
    },
    error => onError?.(error),
  );
}

export function subscribeImportantUpdates(
  listener: (notices: ImportantUpdateNotice[]) => void,
  options?: { includeUnpublished?: boolean },
  onError?: (error: unknown) => void,
): () => void {
  const includeUnpublished = options?.includeUnpublished === true;

  return noticesCollection()
    .orderBy('sortOrder', 'asc')
    .onSnapshot(
      snapshot => {
        const notices = snapshot.docs.map(doc =>
          mapNotice(doc.id, doc.data() as ImportantUpdateNoticeDocument),
        );
        const filtered = includeUnpublished
          ? notices
          : notices.filter(notice => notice.isPublished);
        listener(sortNotices(filtered));
      },
      error => onError?.(error),
    );
}

export async function ensureImportantUpdatesSectionDefaults(): Promise<void> {
  try {
    const snapshot = await sectionDocRef().get();
    if (snapshot.exists) {
      return;
    }

    const payload: ImportantUpdatesSectionDocument = {
      ...DEFAULT_IMPORTANT_UPDATES_SECTION,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    };

    await sectionDocRef().set(payload);
  } catch (error) {
    throw wrapFirebaseError(
      error,
      'FIRESTORE_ERROR',
      'Failed to initialize important updates section.',
    );
  }
}

export async function updateImportantUpdatesSection(
  input: UpdateImportantUpdatesSectionInput,
): Promise<ImportantUpdatesSection> {
  try {
    const payload: ImportantUpdatesSectionDocument = {
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
  const snapshot = await noticesCollection()
    .orderBy('sortOrder', 'desc')
    .limit(1)
    .get();

  if (snapshot.empty) {
    return 0;
  }

  const top = snapshot.docs[0].data() as ImportantUpdateNoticeDocument;
  return (typeof top.sortOrder === 'number' ? top.sortOrder : 0) + 1;
}

export async function createImportantUpdateNotice(
  input: CreateImportantUpdateNoticeInput,
): Promise<ImportantUpdateNotice> {
  try {
    const sortOrder = Math.trunc(await getNextSortOrder());
    const ref = noticesCollection().doc();
    const payload: ImportantUpdateNoticeDocument = {
      tag: input.tag.trim() || 'New Notice',
      title: input.title.trim(),
      subtitle: input.subtitle.trim(),
      description: input.description.trim(),
      sortOrder,
      isPublished: input.isPublished ?? true,
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    };

    await ref.set(payload);

    return mapNotice(ref.id, {
      ...payload,
      createdAt: firestore.Timestamp.now(),
      updatedAt: firestore.Timestamp.now(),
    });
  } catch (error) {
    throw wrapFirebaseError(
      error,
      'FIRESTORE_ERROR',
      'Failed to create notice.',
    );
  }
}

export async function updateImportantUpdateNotice(
  noticeId: string,
  input: UpdateImportantUpdateNoticeInput,
): Promise<void> {
  try {
    const updates: Record<string, unknown> = {
      updatedAt: firestore.FieldValue.serverTimestamp(),
    };

    if (input.tag !== undefined) {
      updates.tag = input.tag.trim();
    }
    if (input.title !== undefined) {
      updates.title = input.title.trim();
    }
    if (input.subtitle !== undefined) {
      updates.subtitle = input.subtitle.trim();
    }
    if (input.description !== undefined) {
      updates.description = input.description.trim();
    }
    if (input.sortOrder !== undefined) {
      updates.sortOrder = input.sortOrder;
    }
    if (input.isPublished !== undefined) {
      updates.isPublished = input.isPublished;
    }

    await noticesCollection().doc(noticeId).update(updates);
  } catch (error) {
    throw wrapFirebaseError(
      error,
      'FIRESTORE_ERROR',
      'Failed to update notice.',
    );
  }
}

export async function deleteImportantUpdateNotice(
  noticeId: string,
): Promise<void> {
  try {
    await noticesCollection().doc(noticeId).delete();
  } catch (error) {
    throw wrapFirebaseError(
      error,
      'FIRESTORE_ERROR',
      'Failed to delete notice.',
    );
  }
}

/** Reassigns sortOrder for all notices based on the provided id order. */
export async function reorderImportantUpdateNotices(
  orderedIds: string[],
): Promise<void> {
  if (orderedIds.length === 0) {
    return;
  }

  try {
    const batch = firestore().batch();

    orderedIds.forEach((id, index) => {
      const ref = noticesCollection().doc(id);
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
      'Failed to reorder notices.',
    );
  }
}

export async function moveImportantUpdateNotice(
  noticeId: string,
  direction: 'up' | 'down',
  currentNotices: ImportantUpdateNotice[],
): Promise<void> {
  const ids = currentNotices.map(notice => notice.id);
  const index = ids.indexOf(noticeId);

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

  await reorderImportantUpdateNotices(nextIds);
}
