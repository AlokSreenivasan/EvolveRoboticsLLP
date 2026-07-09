import type {
  DocumentData,
  FirebaseFirestoreTypes,
  UpdateData,
} from '@react-native-firebase/firestore';

import type { ContentSubscribeOptions } from '../../store/content/types/schoolAudience.types';
import type { ExamQuestion } from '../../store/content/types/exams.types';
import type {
  CreateQuizCompetitionInput,
  LegacyQuizCompetitionDocument,
  QuizCompetition,
  QuizCompetitionDocument,
  UpdateQuizCompetitionInput,
} from '../../store/content/types/quizCompetitions.types';
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

function quizCompetitionsCollection() {
  return collection(db, FIRESTORE_COLLECTIONS.quizCompetitions);
}

function quizCompetitionDocRef(quizId: string) {
  return doc(db, FIRESTORE_COLLECTIONS.quizCompetitions, quizId);
}

function normalizeCorrectChoiceIndex(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 0;
  }
  return Math.min(3, Math.max(0, Math.trunc(value)));
}

function mapLegacyQuestion(
  id: string,
  data: LegacyQuizCompetitionDocument,
): ExamQuestion | null {
  const prompt = data.prompt?.trim() ?? '';
  const choices = Array.isArray(data.choices) ? data.choices : [];
  if (!prompt || choices.length < 4) {
    return null;
  }

  return {
    id: `${id}_legacy_q1`,
    prompt,
    choices: [
      { id: choices[0]?.id ?? `${id}_a`, text: choices[0]?.text?.trim() ?? '' },
      { id: choices[1]?.id ?? `${id}_b`, text: choices[1]?.text?.trim() ?? '' },
      { id: choices[2]?.id ?? `${id}_c`, text: choices[2]?.text?.trim() ?? '' },
      { id: choices[3]?.id ?? `${id}_d`, text: choices[3]?.text?.trim() ?? '' },
    ],
    correctChoiceIndex: normalizeCorrectChoiceIndex(data.correctChoiceIndex),
  };
}

function mapQuestions(
  id: string,
  data: QuizCompetitionDocument,
): ExamQuestion[] {
  if (Array.isArray(data.questions) && data.questions.length > 0) {
    return data.questions;
  }

  const legacy = mapLegacyQuestion(id, data);
  return legacy ? [legacy] : [];
}

function mapQuizCompetition(
  id: string,
  data: QuizCompetitionDocument,
): QuizCompetition {
  const timerSeconds =
    typeof data.timerSeconds === 'number' && Number.isFinite(data.timerSeconds)
      ? Math.max(0, Math.trunc(data.timerSeconds))
      : 0;

  return {
    id,
    title: data.title?.trim() ?? '',
    description: data.description?.trim() ?? '',
    timerSeconds,
    questions: mapQuestions(id, data),
    track: mapContentTrack(data),
    sortOrder: typeof data.sortOrder === 'number' ? data.sortOrder : 0,
    isPublished: data.isPublished === true,
    createdAt: isTimestamp(data.createdAt) ? data.createdAt : null,
    updatedAt: isTimestamp(data.updatedAt) ? data.updatedAt : null,
    ...mapSchoolAudienceFields(data),
  };
}

function sortQuizCompetitions(items: QuizCompetition[]): QuizCompetition[] {
  return [...items].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function subscribeQuizCompetitions(
  listener: (quizzes: QuizCompetition[]) => void,
  options?: ContentSubscribeOptions,
  onError?: (error: unknown) => void,
): () => void {
  const includeUnpublished = options?.includeUnpublished === true;
  const quizzesQuery = query(
    quizCompetitionsCollection(),
    orderBy('sortOrder', 'asc'),
  );

  return onSnapshot(
    quizzesQuery,
    snapshot => {
      const items = snapshot.docs.map(quizDoc =>
        mapQuizCompetition(quizDoc.id, quizDoc.data() as QuizCompetitionDocument),
      );

      let filtered = applyLearnerContentFilters(items, options);
      if (!includeUnpublished) {
        filtered = filtered.filter(item => item.questions.length > 0);
      }

      listener(sortQuizCompetitions(filtered));
    },
    error => onError?.(error),
  );
}

export function subscribeQuizCompetition(
  quizId: string,
  listener: (quiz: QuizCompetition | null) => void,
  options?: ContentSubscribeOptions,
  onError?: (error: unknown) => void,
): () => void {
  return onSnapshot(
    quizCompetitionDocRef(quizId),
    snapshot => {
      if (!snapshot.exists()) {
        listener(null);
        return;
      }

      const quiz = mapQuizCompetition(
        snapshot.id,
        snapshot.data() as QuizCompetitionDocument,
      );
      const includeUnpublished = options?.includeUnpublished === true;

      if (
        !includeUnpublished &&
        (!quiz.isPublished ||
          quiz.questions.length === 0 ||
          (options?.viewerTrack &&
            quiz.track !== options.viewerTrack &&
            quiz.track != null) ||
          (shouldFilterByViewerSchool(options) &&
            !isVisibleForViewer(
              quiz,
              options?.viewerSchoolId,
              options?.viewerGrade,
            )))
      ) {
        listener(null);
        return;
      }

      listener(quiz);
    },
    error => onError?.(error),
  );
}

export async function getQuizCompetition(
  quizId: string,
): Promise<QuizCompetition | null> {
  try {
    const snapshot = await getDoc(quizCompetitionDocRef(quizId));
    if (!snapshot.exists()) {
      return null;
    }
    return mapQuizCompetition(
      snapshot.id,
      snapshot.data() as QuizCompetitionDocument,
    );
  } catch (error) {
    throw wrapFirebaseError(
      error,
      'FIRESTORE_ERROR',
      'Failed to load quiz competition.',
    );
  }
}

async function getNextSortOrder(): Promise<number> {
  const snapshot = await getDocs(
    query(quizCompetitionsCollection(), orderBy('sortOrder', 'desc'), limit(1)),
  );

  if (snapshot.empty) {
    return 0;
  }

  const top = snapshot.docs[0].data() as QuizCompetitionDocument;
  return (typeof top.sortOrder === 'number' ? top.sortOrder : 0) + 1;
}

export async function createQuizCompetition(
  input: CreateQuizCompetitionInput,
): Promise<QuizCompetition> {
  try {
    if (!isCourseTrack(input.track)) {
      throw wrapFirebaseError(
        new Error('Quiz competition track is required.'),
        'FIRESTORE_ERROR',
        'Select whether this quiz is for kids or professionals.',
      );
    }

    const sortOrder = Math.trunc(await getNextSortOrder());
    const ref = doc(quizCompetitionsCollection());
    const payload: QuizCompetitionDocument = {
      title: input.title.trim(),
      description: input.description?.trim() ?? '',
      timerSeconds: Math.max(0, Math.trunc(input.timerSeconds)),
      questions: input.questions,
      track: input.track,
      sortOrder,
      isPublished: input.isPublished ?? true,
      ...buildTrackAwareSchoolAudienceWriteFields(input.track, input),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(ref, payload);

    return mapQuizCompetition(ref.id, {
      ...payload,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    throw wrapFirebaseError(
      error,
      'FIRESTORE_ERROR',
      'Failed to create quiz competition.',
    );
  }
}

export async function updateQuizCompetition(
  quizId: string,
  input: UpdateQuizCompetitionInput,
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
    if (input.track !== undefined) {
      if (!isCourseTrack(input.track)) {
        throw wrapFirebaseError(
          new Error('Quiz competition track is required.'),
          'FIRESTORE_ERROR',
          'Select whether this quiz is for kids or professionals.',
        );
      }
      updates.track = input.track;
    }
    if (shouldApplyTrackAwareSchoolAudienceUpdate(input)) {
      Object.assign(
        updates,
        buildTrackAwareSchoolAudienceWriteFields(
          input.track === 'professionals'
            ? 'professionals'
            : input.track ?? 'kids',
          input,
        ),
      );
    }

    await updateDoc(
      doc(quizCompetitionsCollection(), quizId),
      updates as UpdateData<DocumentData>,
    );
  } catch (error) {
    throw wrapFirebaseError(
      error,
      'FIRESTORE_ERROR',
      'Failed to update quiz competition.',
    );
  }
}

export async function deleteQuizCompetition(quizId: string): Promise<void> {
  try {
    await deleteDoc(doc(quizCompetitionsCollection(), quizId));
  } catch (error) {
    throw wrapFirebaseError(
      error,
      'FIRESTORE_ERROR',
      'Failed to delete quiz competition.',
    );
  }
}

export async function reorderQuizCompetitions(
  orderedIds: string[],
): Promise<void> {
  if (orderedIds.length === 0) {
    return;
  }

  try {
    const batch = writeBatch(db);

    orderedIds.forEach((id, index) => {
      batch.update(doc(quizCompetitionsCollection(), id), {
        sortOrder: Math.trunc(index),
        updatedAt: serverTimestamp(),
      });
    });

    await batch.commit();
  } catch (error) {
    throw wrapFirebaseError(
      error,
      'FIRESTORE_ERROR',
      'Failed to reorder quiz competitions.',
    );
  }
}

export async function moveQuizCompetition(
  quizId: string,
  direction: 'up' | 'down',
  currentQuizzes: QuizCompetition[],
): Promise<void> {
  const ids = currentQuizzes.map(item => item.id);
  const index = ids.indexOf(quizId);

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

  await reorderQuizCompetitions(nextIds);
}
