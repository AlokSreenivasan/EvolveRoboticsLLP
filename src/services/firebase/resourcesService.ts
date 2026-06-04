import type {
  DocumentData,
  FirebaseFirestoreTypes,
  UpdateData,
} from '@react-native-firebase/firestore';

import { DEFAULT_RESOURCES_SECTION } from '../../constants/resourcesDefaults';
import type { ContentSubscribeOptions } from '../../store/content/types/schoolAudience.types';
import type {
  CreateResourceNoteInput,
  ResourceNote,
  ResourceNoteDocument,
  ResourcesSection,
  ResourcesSectionDocument,
  UpdateResourceNoteInput,
  UpdateResourcesSectionInput,
} from '../../store/content/types/resources.types';
import {
  applyLearnerContentFilters,
  buildSchoolAudienceWriteFields,
  mapSchoolAudienceFields,
} from './schoolAudienceFirestore';
import { wrapFirebaseError } from '../../utils/firebase/errors';
import { APP_CONTENT_DOCS, FIRESTORE_COLLECTIONS } from './constants';
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
    APP_CONTENT_DOCS.resourcesSection,
  );
}

function notesCollection() {
  return collection(db, FIRESTORE_COLLECTIONS.resourceNotes);
}

function mapSection(
  data: ResourcesSectionDocument | undefined,
): ResourcesSection {
  if (!data) {
    return DEFAULT_RESOURCES_SECTION;
  }

  return {
    sectionTitle:
      data.sectionTitle?.trim() || DEFAULT_RESOURCES_SECTION.sectionTitle,
    sectionSubtitle:
      data.sectionSubtitle?.trim() ?? DEFAULT_RESOURCES_SECTION.sectionSubtitle,
    actionLabel:
      data.actionLabel?.trim() ?? DEFAULT_RESOURCES_SECTION.actionLabel,
    updatedAt: isTimestamp(data.updatedAt) ? data.updatedAt : null,
  };
}

function mapNote(id: string, data: ResourceNoteDocument): ResourceNote {
  return {
    id,
    title: data.title?.trim() ?? '',
    subtitle: data.subtitle?.trim() ?? '',
    pdfUrl: data.pdfUrl?.trim() ?? '',
    sortOrder: typeof data.sortOrder === 'number' ? data.sortOrder : 0,
    isPublished: data.isPublished === true,
    createdAt: isTimestamp(data.createdAt) ? data.createdAt : null,
    updatedAt: isTimestamp(data.updatedAt) ? data.updatedAt : null,
    ...mapSchoolAudienceFields(data),
  };
}

function sortNotes(notes: ResourceNote[]): ResourceNote[] {
  return [...notes].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function subscribeResourcesSection(
  listener: (section: ResourcesSection) => void,
  onError?: (error: unknown) => void,
): () => void {
  return onSnapshot(
    sectionDocRef(),
    snapshot => {
      const data = snapshot.data() as ResourcesSectionDocument | undefined;
      listener(mapSection(data));
    },
    error => onError?.(error),
  );
}

export function subscribeResourceNotes(
  listener: (notes: ResourceNote[]) => void,
  options?: ContentSubscribeOptions,
  onError?: (error: unknown) => void,
): () => void {
  const includeUnpublished = options?.includeUnpublished === true;
  const notesQuery = query(notesCollection(), orderBy('sortOrder', 'asc'));

  return onSnapshot(
    notesQuery,
    snapshot => {
      const notes = snapshot.docs.map(noteDoc =>
        mapNote(noteDoc.id, noteDoc.data() as ResourceNoteDocument),
      );
      let filtered = applyLearnerContentFilters(notes, options);
      if (!includeUnpublished) {
        filtered = filtered.filter(note => note.pdfUrl.length > 0);
      }
      listener(sortNotes(filtered));
    },
    error => onError?.(error),
  );
}

export async function ensureResourcesSectionDefaults(): Promise<void> {
  try {
    const snapshot = await getDoc(sectionDocRef());
    if (snapshot.exists()) {
      return;
    }

    const payload: ResourcesSectionDocument = {
      ...DEFAULT_RESOURCES_SECTION,
      updatedAt: serverTimestamp(),
    };

    await setDoc(sectionDocRef(), payload);
  } catch (error) {
    throw wrapFirebaseError(
      error,
      'FIRESTORE_ERROR',
      'Failed to initialize resources section.',
    );
  }
}

export async function updateResourcesSection(
  input: UpdateResourcesSectionInput,
): Promise<ResourcesSection> {
  try {
    const payload: ResourcesSectionDocument = {
      sectionTitle: input.sectionTitle.trim(),
      sectionSubtitle: input.sectionSubtitle.trim(),
      actionLabel: DEFAULT_RESOURCES_SECTION.actionLabel,
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
      'Failed to update resources screen headings.',
    );
  }
}

async function getNextSortOrder(): Promise<number> {
  const snapshot = await getDocs(
    query(notesCollection(), orderBy('sortOrder', 'desc'), limit(1)),
  );

  if (snapshot.empty) {
    return 0;
  }

  const top = snapshot.docs[0].data() as ResourceNoteDocument;
  return (typeof top.sortOrder === 'number' ? top.sortOrder : 0) + 1;
}

export async function createResourceNote(
  input: CreateResourceNoteInput,
): Promise<ResourceNote> {
  try {
    const sortOrder = Math.trunc(await getNextSortOrder());
    const ref = doc(notesCollection());
    const payload: ResourceNoteDocument = {
      title: input.title.trim(),
      subtitle: input.subtitle?.trim() ?? '',
      pdfUrl: input.pdfUrl.trim(),
      sortOrder,
      isPublished: input.isPublished ?? true,
      ...buildSchoolAudienceWriteFields(input),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(ref, payload);

    return mapNote(ref.id, {
      ...payload,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    throw wrapFirebaseError(error, 'FIRESTORE_ERROR', 'Failed to create note.');
  }
}

export async function updateResourceNote(
  noteId: string,
  input: UpdateResourceNoteInput,
): Promise<void> {
  try {
    const updates: Record<string, unknown> = {
      updatedAt: serverTimestamp(),
    };

    if (input.title !== undefined) {
      updates.title = input.title.trim();
    }
    if (input.subtitle !== undefined) {
      updates.subtitle = input.subtitle.trim();
    }
    if (input.pdfUrl !== undefined) {
      updates.pdfUrl = input.pdfUrl.trim();
    }
    if (input.sortOrder !== undefined) {
      updates.sortOrder = input.sortOrder;
    }
    if (input.isPublished !== undefined) {
      updates.isPublished = input.isPublished;
    }
    if (input.audience !== undefined || input.schoolIds !== undefined) {
      Object.assign(updates, buildSchoolAudienceWriteFields(input));
    }

    await updateDoc(
      doc(notesCollection(), noteId),
      updates as UpdateData<DocumentData>,
    );
  } catch (error) {
    throw wrapFirebaseError(error, 'FIRESTORE_ERROR', 'Failed to update note.');
  }
}

export async function deleteResourceNote(noteId: string): Promise<void> {
  try {
    await deleteDoc(doc(notesCollection(), noteId));
  } catch (error) {
    throw wrapFirebaseError(error, 'FIRESTORE_ERROR', 'Failed to delete note.');
  }
}

export async function reorderResourceNotes(orderedIds: string[]): Promise<void> {
  if (orderedIds.length === 0) {
    return;
  }

  try {
    const batch = writeBatch(db);

    orderedIds.forEach((id, index) => {
      batch.update(doc(notesCollection(), id), {
        sortOrder: Math.trunc(index),
        updatedAt: serverTimestamp(),
      });
    });

    await batch.commit();
  } catch (error) {
    throw wrapFirebaseError(
      error,
      'FIRESTORE_ERROR',
      'Failed to reorder notes.',
    );
  }
}

export async function moveResourceNote(
  noteId: string,
  direction: 'up' | 'down',
  currentNotes: ResourceNote[],
): Promise<void> {
  const ids = currentNotes.map(note => note.id);
  const index = ids.indexOf(noteId);

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

  await reorderResourceNotes(nextIds);
}
