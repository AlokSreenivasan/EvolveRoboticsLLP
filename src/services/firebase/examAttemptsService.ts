import { getFunctions, httpsCallable } from '@react-native-firebase/functions';
import type {
  DocumentData,
  FirebaseFirestoreTypes,
  UpdateData,
} from '@react-native-firebase/firestore';

import { wrapFirebaseError } from '../../utils/firebase/errors';
import { getCurrentUserId } from './authService';
import {
  collection,
  db,
  onSnapshot,
  orderBy,
  query,
} from './firestoreClient';

export type ExamAttemptDocument = {
  examId: string;
  /** Map of questionId -> selected choice index (0..3). */
  answers: Record<string, number>;
  correctCount: number;
  totalQuestions: number;
  percentage: number;
  submittedAt:
    | FirebaseFirestoreTypes.Timestamp
    | FirebaseFirestoreTypes.FieldValue;
};

export type ExamAttempt = {
  id: string;
  examId: string;
  answers: Record<string, number>;
  correctCount: number;
  totalQuestions: number;
  percentage: number;
  submittedAt: FirebaseFirestoreTypes.Timestamp | null;
};

export type SubmitExamAttemptResult = {
  attemptId: string;
  examId: string;
  correctCount: number;
  totalQuestions: number;
  percentage: number;
};

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

function mapAttempt(id: string, data: ExamAttemptDocument): ExamAttempt {
  return {
    id,
    examId: data.examId?.trim() ?? '',
    answers: (data.answers ?? {}) as Record<string, number>,
    correctCount: typeof data.correctCount === 'number' ? data.correctCount : 0,
    totalQuestions:
      typeof data.totalQuestions === 'number' ? data.totalQuestions : 0,
    percentage: typeof data.percentage === 'number' ? data.percentage : 0,
    submittedAt: isTimestamp(data.submittedAt) ? data.submittedAt : null,
  };
}

export async function createExamAttempt(input: {
  examId: string;
  answers: Record<string, number>;
}): Promise<SubmitExamAttemptResult> {
  const uid = getCurrentUserId();
  if (!uid) {
    throw new Error('You must be signed in to submit an exam.');
  }

  const examId = input.examId.trim();
  if (!examId) {
    throw new Error('Exam id is required.');
  }

  try {
    const callable = httpsCallable<
      { examId: string; answers: Record<string, number> },
      SubmitExamAttemptResult
    >(getFunctions(), 'submitExamAttempt');

    const response = await callable({
      examId,
      answers: input.answers,
    });

    const data = response.data;
    return {
      attemptId: data?.attemptId ?? '',
      examId: data?.examId ?? examId,
      correctCount:
        typeof data?.correctCount === 'number' ? data.correctCount : 0,
      totalQuestions:
        typeof data?.totalQuestions === 'number' ? data.totalQuestions : 0,
      percentage: typeof data?.percentage === 'number' ? data.percentage : 0,
    };
  } catch (error) {
    throw wrapFirebaseError(
      error,
      'FIRESTORE_ERROR',
      'Failed to submit exam attempt.',
    );
  }
}

export function subscribeExamAttempts(
  listener: (attempts: ExamAttempt[]) => void,
  onError?: (error: unknown) => void,
): () => void {
  const uid = getCurrentUserId();
  if (!uid) {
    listener([]);
    return () => undefined;
  }

  const attemptsCollection = collection(db, 'users', uid, 'examAttempts');
  const attemptsQuery = query(attemptsCollection, orderBy('submittedAt', 'desc'));

  return onSnapshot(
    attemptsQuery,
    snapshot => {
      const items = snapshot.docs.map(docSnap =>
        mapAttempt(
          docSnap.id,
          docSnap.data() as UpdateData<DocumentData> as ExamAttemptDocument,
        ),
      );
      listener(items);
    },
    error => onError?.(error),
  );
}
