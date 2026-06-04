import type {
  DocumentData,
  FirebaseFirestoreTypes,
  UpdateData,
} from '@react-native-firebase/firestore';

import type { ContentSubscribeOptions } from '../../store/content/types/schoolAudience.types';
import type {
  CreateExamInput,
  Exam,
  ExamDocument,
  UpdateExamInput,
} from '../../store/content/types/exams.types';
import {
  isVisibleForViewerSchool,
  shouldFilterByViewerSchool,
} from '../../utils/content/schoolAudience';
import {
  applyLearnerContentFilters,
  buildSchoolAudienceWriteFields,
  mapSchoolAudienceFields,
} from './schoolAudienceFirestore';
import { wrapFirebaseError } from '../../utils/firebase/errors';
import { FIRESTORE_COLLECTIONS } from './constants';
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

function examsCollection() {
  return collection(db, FIRESTORE_COLLECTIONS.exams);
}

function examDocRef(examId: string) {
  return doc(db, FIRESTORE_COLLECTIONS.exams, examId);
}

function mapExam(id: string, data: ExamDocument): Exam {
  const timerSeconds =
    typeof data.timerSeconds === 'number' && Number.isFinite(data.timerSeconds)
      ? Math.max(0, Math.trunc(data.timerSeconds))
      : 0;

  return {
    id,
    title: data.title?.trim() ?? '',
    description: data.description?.trim() ?? '',
    timerSeconds,
    questions: Array.isArray(data.questions) ? data.questions : [],
    sortOrder: typeof data.sortOrder === 'number' ? data.sortOrder : 0,
    isPublished: data.isPublished === true,
    createdAt: isTimestamp(data.createdAt) ? data.createdAt : null,
    updatedAt: isTimestamp(data.updatedAt) ? data.updatedAt : null,
    ...mapSchoolAudienceFields(data),
  };
}

function sortExams(items: Exam[]): Exam[] {
  return [...items].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function subscribeExams(
  listener: (exams: Exam[]) => void,
  options?: ContentSubscribeOptions,
  onError?: (error: unknown) => void,
): () => void {
  const includeUnpublished = options?.includeUnpublished === true;
  const examsQuery = query(examsCollection(), orderBy('sortOrder', 'asc'));

  return onSnapshot(
    examsQuery,
    snapshot => {
      const items = snapshot.docs.map(examDoc =>
        mapExam(examDoc.id, examDoc.data() as ExamDocument),
      );

      let filtered = applyLearnerContentFilters(items, options);
      if (!includeUnpublished) {
        filtered = filtered.filter(item => item.questions.length > 0);
      }

      listener(sortExams(filtered));
    },
    error => onError?.(error),
  );
}

export function subscribeExam(
  examId: string,
  listener: (exam: Exam | null) => void,
  options?: ContentSubscribeOptions,
  onError?: (error: unknown) => void,
): () => void {
  return onSnapshot(
    examDocRef(examId),
    snapshot => {
      if (!snapshot.exists()) {
        listener(null);
        return;
      }
      const exam = mapExam(snapshot.id, snapshot.data() as ExamDocument);
      const includeUnpublished = options?.includeUnpublished === true;
      if (
        !includeUnpublished &&
        (!exam.isPublished ||
          exam.questions.length === 0 ||
          (shouldFilterByViewerSchool(options) &&
            !isVisibleForViewerSchool(exam, options?.viewerSchoolId)))
      ) {
        listener(null);
        return;
      }
      listener(exam);
    },
    error => onError?.(error),
  );
}

export async function getExam(examId: string): Promise<Exam | null> {
  try {
    const snapshot = await getDoc(examDocRef(examId));
    if (!snapshot.exists()) {
      return null;
    }
    return mapExam(snapshot.id, snapshot.data() as ExamDocument);
  } catch (error) {
    throw wrapFirebaseError(error, 'FIRESTORE_ERROR', 'Failed to load exam.');
  }
}

async function getNextSortOrder(): Promise<number> {
  const snapshot = await getDocs(
    query(examsCollection(), orderBy('sortOrder', 'desc'), limit(1)),
  );

  if (snapshot.empty) {
    return 0;
  }

  const top = snapshot.docs[0].data() as ExamDocument;
  return (typeof top.sortOrder === 'number' ? top.sortOrder : 0) + 1;
}

export async function createExam(input: CreateExamInput): Promise<Exam> {
  try {
    const sortOrder = Math.trunc(await getNextSortOrder());
    const ref = doc(examsCollection());
    const payload: ExamDocument = {
      title: input.title.trim(),
      description: input.description?.trim() ?? '',
      timerSeconds: Math.max(0, Math.trunc(input.timerSeconds)),
      questions: input.questions,
      sortOrder,
      isPublished: input.isPublished ?? true,
      ...buildSchoolAudienceWriteFields(input),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(ref, payload);

    return mapExam(ref.id, {
      ...payload,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    throw wrapFirebaseError(error, 'FIRESTORE_ERROR', 'Failed to create exam.');
  }
}

export async function updateExam(
  examId: string,
  input: UpdateExamInput,
): Promise<void> {
  try {
    const updates: Record<string, unknown> = {
      updatedAt: serverTimestamp(),
    };

    if (input.title !== undefined) {
      updates.title = input.title.trim();
    }
    if (input.description !== undefined) {
      updates.description = input.description.trim();
    }
    if (input.timerSeconds !== undefined) {
      updates.timerSeconds = Math.max(0, Math.trunc(input.timerSeconds));
    }
    if (input.questions !== undefined) {
      updates.questions = input.questions;
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
      doc(examsCollection(), examId),
      updates as UpdateData<DocumentData>,
    );
  } catch (error) {
    throw wrapFirebaseError(error, 'FIRESTORE_ERROR', 'Failed to update exam.');
  }
}

export async function deleteExam(examId: string): Promise<void> {
  try {
    await deleteDoc(doc(examsCollection(), examId));
  } catch (error) {
    throw wrapFirebaseError(error, 'FIRESTORE_ERROR', 'Failed to delete exam.');
  }
}

export async function reorderExams(orderedIds: string[]): Promise<void> {
  if (orderedIds.length === 0) {
    return;
  }

  try {
    const batch = writeBatch(db);

    orderedIds.forEach((id, index) => {
      batch.update(doc(examsCollection(), id), {
        sortOrder: Math.trunc(index),
        updatedAt: serverTimestamp(),
      });
    });

    await batch.commit();
  } catch (error) {
    throw wrapFirebaseError(error, 'FIRESTORE_ERROR', 'Failed to reorder exams.');
  }
}

export async function moveExam(
  examId: string,
  direction: 'up' | 'down',
  currentExams: Exam[],
): Promise<void> {
  const ids = currentExams.map(item => item.id);
  const index = ids.indexOf(examId);

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

  await reorderExams(nextIds);
}

