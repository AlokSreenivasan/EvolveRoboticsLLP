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
  ExamQuestion,
  UpdateExamInput,
} from '../../store/content/types/exams.types';
import {
  extractAnswerKey,
  mapAnswerKeyDocument,
  mergeAnswerKeyIntoQuestions,
  stripCorrectChoiceFromQuestions,
  stripQuestionsForPublic,
} from '../../utils/exams/answerKeys';
import {
  isVisibleForViewer,
  shouldFilterByViewerSchool,
} from '../../utils/content/schoolAudience';
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

function examsCollection() {
  return collection(db, FIRESTORE_COLLECTIONS.exams);
}

function examDocRef(examId: string) {
  return doc(db, FIRESTORE_COLLECTIONS.exams, examId);
}

function examAnswerKeyDocRef(examId: string) {
  return doc(db, FIRESTORE_COLLECTIONS.examAnswerKeys, examId);
}

function mapExamQuestions(
  data: ExamDocument,
  byQuestionId: Record<string, number> | null,
  includeAnswerKeys: boolean,
): ExamQuestion[] {
  const questions = Array.isArray(data.questions) ? data.questions : [];
  if (includeAnswerKeys) {
    return mergeAnswerKeyIntoQuestions(questions, byQuestionId);
  }
  return stripCorrectChoiceFromQuestions(questions);
}

function mapExam(
  id: string,
  data: ExamDocument,
  byQuestionId: Record<string, number> | null,
  includeAnswerKeys: boolean,
): Exam {
  const timerSeconds =
    typeof data.timerSeconds === 'number' && Number.isFinite(data.timerSeconds)
      ? Math.max(0, Math.trunc(data.timerSeconds))
      : 0;

  return {
    id,
    title: data.title?.trim() ?? '',
    description: data.description?.trim() ?? '',
    timerSeconds,
    questions: mapExamQuestions(data, byQuestionId, includeAnswerKeys),
    track: mapContentTrack(data),
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

async function loadAnswerKeyMap(
  examId: string,
): Promise<Record<string, number> | null> {
  const snapshot = await getDoc(examAnswerKeyDocRef(examId));
  if (!snapshot.exists()) {
    return null;
  }
  return mapAnswerKeyDocument(snapshot.data());
}

async function loadAnswerKeyMaps(
  examIds: string[],
): Promise<Map<string, Record<string, number> | null>> {
  const result = new Map<string, Record<string, number> | null>();
  await Promise.all(
    examIds.map(async examId => {
      result.set(examId, await loadAnswerKeyMap(examId));
    }),
  );
  return result;
}

async function writeExamAnswerKey(
  examId: string,
  questions: ExamQuestion[],
): Promise<void> {
  await setDoc(examAnswerKeyDocRef(examId), {
    byQuestionId: extractAnswerKey(questions),
  });
}

export function subscribeExams(
  listener: (exams: Exam[]) => void,
  options?: ContentSubscribeOptions,
  onError?: (error: unknown) => void,
): () => void {
  const includeUnpublished = options?.includeUnpublished === true;
  const examsQuery = buildSortedContentListQuery(examsCollection(), options);

  return onSnapshot(
    examsQuery,
    snapshot => {
      const docs = snapshot.docs.map(examDoc => ({
        id: examDoc.id,
        data: examDoc.data() as ExamDocument,
      }));

      const emit = (keys: Map<string, Record<string, number> | null>) => {
        const items = docs.map(({ id, data }) =>
          mapExam(id, data, keys.get(id) ?? null, includeUnpublished),
        );

        let filtered = applyLearnerContentFilters(items, options);
        if (!includeUnpublished) {
          filtered = filtered.filter(item => item.questions.length > 0);
        }

        listener(sortExams(filtered));
      };

      if (!includeUnpublished) {
        emit(new Map());
        return;
      }

      void loadAnswerKeyMaps(docs.map(item => item.id))
        .then(emit)
        .catch(error => onError?.(error));
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
  const includeUnpublished = options?.includeUnpublished === true;

  return onSnapshot(
    examDocRef(examId),
    snapshot => {
      if (!snapshot.exists()) {
        listener(null);
        return;
      }

      const data = snapshot.data() as ExamDocument;

      const emit = (byQuestionId: Record<string, number> | null) => {
        const exam = mapExam(
          snapshot.id,
          data,
          byQuestionId,
          includeUnpublished,
        );
        if (
          !includeUnpublished &&
          (!exam.isPublished ||
            exam.questions.length === 0 ||
            (options?.viewerTrack &&
              exam.track !== options.viewerTrack &&
              exam.track != null) ||
            (shouldFilterByViewerSchool(options) &&
              !isVisibleForViewer(
                exam,
                options?.viewerSchoolId,
                options?.viewerGrade,
              )))
        ) {
          listener(null);
          return;
        }
        listener(exam);
      };

      if (!includeUnpublished) {
        emit(null);
        return;
      }

      void loadAnswerKeyMap(examId)
        .then(emit)
        .catch(error => onError?.(error));
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
    return mapExam(snapshot.id, snapshot.data() as ExamDocument, null, false);
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
    if (!isCourseTrack(input.track)) {
      throw wrapFirebaseError(
        new Error('Exam track is required.'),
        'FIRESTORE_ERROR',
        'Select whether this exam is for kids or professionals.',
      );
    }

    const sortOrder = Math.trunc(await getNextSortOrder());
    const ref = doc(examsCollection());
    const publicQuestions = stripQuestionsForPublic(input.questions);
    const payload: ExamDocument = {
      title: input.title.trim(),
      description: input.description?.trim() ?? '',
      timerSeconds: Math.max(0, Math.trunc(input.timerSeconds)),
      questions: publicQuestions as ExamQuestion[],
      track: input.track,
      sortOrder,
      isPublished: input.isPublished ?? true,
      ...buildTrackAwareSchoolAudienceWriteFields(input.track, input),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(ref, payload);
    await writeExamAnswerKey(ref.id, input.questions);

    return mapExam(
      ref.id,
      {
        ...payload,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
      extractAnswerKey(input.questions),
      true,
    );
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
      updates.questions = stripQuestionsForPublic(input.questions);
      await writeExamAnswerKey(examId, input.questions);
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
          new Error('Exam track is required.'),
          'FIRESTORE_ERROR',
          'Select whether this exam is for kids or professionals.',
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
    await deleteDoc(examAnswerKeyDocRef(examId));
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
