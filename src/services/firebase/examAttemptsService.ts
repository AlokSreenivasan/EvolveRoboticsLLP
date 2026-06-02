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
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
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
  correctCount: number;
  totalQuestions: number;
}): Promise<void> {
  const uid = getCurrentUserId();
  if (!uid) {
    throw new Error('You must be signed in to submit an exam.');
  }

  try {
    const attemptsCollection = collection(db, 'users', uid, 'examAttempts');
    const ref = doc(attemptsCollection);
    const safeTotal = Math.max(0, Math.trunc(input.totalQuestions));
    const safeCorrect = Math.max(0, Math.trunc(input.correctCount));
    const percentage =
      safeTotal > 0 ? Math.round((safeCorrect / safeTotal) * 100) : 0;

    const payload: ExamAttemptDocument = {
      examId: input.examId.trim(),
      answers: input.answers,
      correctCount: safeCorrect,
      totalQuestions: safeTotal,
      percentage,
      submittedAt: serverTimestamp(),
    };

    await setDoc(ref, payload);
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

