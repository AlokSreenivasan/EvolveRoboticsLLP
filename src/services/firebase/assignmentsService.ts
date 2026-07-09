import type {
  DocumentData,
  FirebaseFirestoreTypes,
  UpdateData,
} from '@react-native-firebase/firestore';

import { DEFAULT_ASSIGNMENTS_SECTION } from '../../constants/assignmentsDefaults';
import type { ContentSubscribeOptions } from '../../store/content/types/schoolAudience.types';
import type {
  Assignment,
  AssignmentDocument,
  AssignmentsSection,
  AssignmentsSectionDocument,
  CreateAssignmentInput,
  UpdateAssignmentInput,
  UpdateAssignmentsSectionInput,
} from '../../store/content/types/assignments.types';
import {
  applyLearnerContentFilters,
  buildTrackAwareSchoolAudienceWriteFields,
  mapContentTrack,
  mapSchoolAudienceFields,
  shouldApplyTrackAwareSchoolAudienceUpdate,
} from './schoolAudienceFirestore';
import { isCourseTrack } from '../../store/content/types/courses.types';
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
    APP_CONTENT_DOCS.assignmentsSection,
  );
}

function assignmentsCollection() {
  return collection(db, FIRESTORE_COLLECTIONS.assignments);
}

function mapSection(
  data: AssignmentsSectionDocument | undefined,
): AssignmentsSection {
  if (!data) {
    return DEFAULT_ASSIGNMENTS_SECTION;
  }

  return {
    sectionTitle:
      data.sectionTitle?.trim() || DEFAULT_ASSIGNMENTS_SECTION.sectionTitle,
    sectionSubtitle:
      data.sectionSubtitle?.trim() ?? DEFAULT_ASSIGNMENTS_SECTION.sectionSubtitle,
    actionLabel:
      data.actionLabel?.trim() ?? DEFAULT_ASSIGNMENTS_SECTION.actionLabel,
    updatedAt: isTimestamp(data.updatedAt) ? data.updatedAt : null,
  };
}

function mapAssignment(
  id: string,
  data: AssignmentDocument,
): Assignment {
  return {
    id,
    title: data.title?.trim() ?? '',
    subtitle: data.subtitle?.trim() ?? '',
    dueDateLabel: data.dueDateLabel?.trim() ?? '',
    pdfUrl: data.pdfUrl?.trim() ?? '',
    track: mapContentTrack(data),
    sortOrder: typeof data.sortOrder === 'number' ? data.sortOrder : 0,
    isPublished: data.isPublished === true,
    createdAt: isTimestamp(data.createdAt) ? data.createdAt : null,
    updatedAt: isTimestamp(data.updatedAt) ? data.updatedAt : null,
    ...mapSchoolAudienceFields(data),
  };
}

function sortAssignments(items: Assignment[]): Assignment[] {
  return [...items].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function subscribeAssignmentsSection(
  listener: (section: AssignmentsSection) => void,
  onError?: (error: unknown) => void,
): () => void {
  return onSnapshot(
    sectionDocRef(),
    snapshot => {
      const data = snapshot.data() as AssignmentsSectionDocument | undefined;
      listener(mapSection(data));
    },
    error => onError?.(error),
  );
}

export function subscribeAssignments(
  listener: (assignments: Assignment[]) => void,
  options?: ContentSubscribeOptions,
  onError?: (error: unknown) => void,
): () => void {
  const includeUnpublished = options?.includeUnpublished === true;
  const assignmentsQuery = query(
    assignmentsCollection(),
    orderBy('sortOrder', 'asc'),
  );

  return onSnapshot(
    assignmentsQuery,
    snapshot => {
      const items = snapshot.docs.map(itemDoc =>
        mapAssignment(itemDoc.id, itemDoc.data() as AssignmentDocument),
      );
      let filtered = applyLearnerContentFilters(items, options);
      if (!includeUnpublished) {
        filtered = filtered.filter(item => item.pdfUrl.length > 0);
      }
      listener(sortAssignments(filtered));
    },
    error => onError?.(error),
  );
}

export async function ensureAssignmentsSectionDefaults(): Promise<void> {
  try {
    const snapshot = await getDoc(sectionDocRef());
    if (snapshot.exists()) {
      return;
    }

    const payload: AssignmentsSectionDocument = {
      ...DEFAULT_ASSIGNMENTS_SECTION,
      updatedAt: serverTimestamp(),
    };

    await setDoc(sectionDocRef(), payload);
  } catch (error) {
    throw wrapFirebaseError(
      error,
      'FIRESTORE_ERROR',
      'Failed to initialize assignments section.',
    );
  }
}

export async function updateAssignmentsSection(
  input: UpdateAssignmentsSectionInput,
): Promise<AssignmentsSection> {
  try {
    const payload: AssignmentsSectionDocument = {
      sectionTitle: input.sectionTitle.trim(),
      sectionSubtitle: input.sectionSubtitle.trim(),
      actionLabel: DEFAULT_ASSIGNMENTS_SECTION.actionLabel,
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
      'Failed to update assignments screen headings.',
    );
  }
}

async function getNextSortOrder(): Promise<number> {
  const snapshot = await getDocs(
    query(assignmentsCollection(), orderBy('sortOrder', 'desc'), limit(1)),
  );

  if (snapshot.empty) {
    return 0;
  }

  const top = snapshot.docs[0].data() as AssignmentDocument;
  return (typeof top.sortOrder === 'number' ? top.sortOrder : 0) + 1;
}

export async function createAssignment(
  input: CreateAssignmentInput,
): Promise<Assignment> {
  try {
    if (!isCourseTrack(input.track)) {
      throw wrapFirebaseError(
        new Error('Assignment track is required.'),
        'FIRESTORE_ERROR',
        'Select whether this assignment is for kids or professionals.',
      );
    }

    const sortOrder = Math.trunc(await getNextSortOrder());
    const ref = doc(assignmentsCollection());
    const payload: AssignmentDocument = {
      title: input.title.trim(),
      subtitle: input.subtitle?.trim() ?? '',
      dueDateLabel: input.dueDateLabel?.trim() ?? '',
      pdfUrl: input.pdfUrl.trim(),
      track: input.track,
      sortOrder,
      isPublished: input.isPublished ?? true,
      ...buildTrackAwareSchoolAudienceWriteFields(input.track, input),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(ref, payload);

    return mapAssignment(ref.id, {
      ...payload,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    throw wrapFirebaseError(
      error,
      'FIRESTORE_ERROR',
      'Failed to create assignment.',
    );
  }
}

export async function updateAssignment(
  assignmentId: string,
  input: UpdateAssignmentInput,
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
    if (input.dueDateLabel !== undefined) {
      updates.dueDateLabel = input.dueDateLabel.trim();
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
    if (input.track !== undefined) {
      if (!isCourseTrack(input.track)) {
        throw wrapFirebaseError(
          new Error('Assignment track is required.'),
          'FIRESTORE_ERROR',
          'Select whether this assignment is for kids or professionals.',
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
      doc(assignmentsCollection(), assignmentId),
      updates as UpdateData<DocumentData>,
    );
  } catch (error) {
    throw wrapFirebaseError(
      error,
      'FIRESTORE_ERROR',
      'Failed to update assignment.',
    );
  }
}

export async function deleteAssignment(assignmentId: string): Promise<void> {
  try {
    await deleteDoc(doc(assignmentsCollection(), assignmentId));
  } catch (error) {
    throw wrapFirebaseError(
      error,
      'FIRESTORE_ERROR',
      'Failed to delete assignment.',
    );
  }
}

export async function reorderAssignments(orderedIds: string[]): Promise<void> {
  if (orderedIds.length === 0) {
    return;
  }

  try {
    const batch = writeBatch(db);

    orderedIds.forEach((id, index) => {
      batch.update(doc(assignmentsCollection(), id), {
        sortOrder: Math.trunc(index),
        updatedAt: serverTimestamp(),
      });
    });

    await batch.commit();
  } catch (error) {
    throw wrapFirebaseError(
      error,
      'FIRESTORE_ERROR',
      'Failed to reorder assignments.',
    );
  }
}

export async function moveAssignment(
  assignmentId: string,
  direction: 'up' | 'down',
  currentAssignments: Assignment[],
): Promise<void> {
  const ids = currentAssignments.map(item => item.id);
  const index = ids.indexOf(assignmentId);

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

  await reorderAssignments(nextIds);
}
