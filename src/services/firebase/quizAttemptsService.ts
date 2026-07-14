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

export type QuizAttemptDocument = {
  quizId: string;
  /** Map of questionId -> selected choice index (0..3). */
  answers: Record<string, number>;
  correctCount: number;
  totalQuestions: number;
  percentage: number;
  /** XP earned for completing this quiz. */
  xpEarned: number;
  submittedAt:
    | FirebaseFirestoreTypes.Timestamp
    | FirebaseFirestoreTypes.FieldValue;
};

export type QuizAttempt = {
  id: string;
  quizId: string;
  answers: Record<string, number>;
  correctCount: number;
  totalQuestions: number;
  percentage: number;
  xpEarned: number;
  submittedAt: FirebaseFirestoreTypes.Timestamp | null;
};

export type SubmitQuizAttemptResult = {
  attemptId: string;
  quizId: string;
  correctCount: number;
  totalQuestions: number;
  percentage: number;
  xpEarned: number;
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

function mapAttempt(id: string, data: QuizAttemptDocument): QuizAttempt {
  return {
    id,
    quizId: data.quizId?.trim() ?? '',
    answers: (data.answers ?? {}) as Record<string, number>,
    correctCount: typeof data.correctCount === 'number' ? data.correctCount : 0,
    totalQuestions:
      typeof data.totalQuestions === 'number' ? data.totalQuestions : 0,
    percentage: typeof data.percentage === 'number' ? data.percentage : 0,
    xpEarned: typeof data.xpEarned === 'number' ? data.xpEarned : 0,
    submittedAt: isTimestamp(data.submittedAt) ? data.submittedAt : null,
  };
}

export async function createQuizAttempt(input: {
  quizId: string;
  answers: Record<string, number>;
}): Promise<SubmitQuizAttemptResult> {
  const uid = getCurrentUserId();
  if (!uid) {
    throw new Error('You must be signed in to submit a quiz.');
  }

  const quizId = input.quizId.trim();
  if (!quizId) {
    throw new Error('Quiz id is required.');
  }

  try {
    const callable = httpsCallable<
      { quizId: string; answers: Record<string, number> },
      SubmitQuizAttemptResult
    >(getFunctions(), 'submitQuizAttempt');

    const response = await callable({
      quizId,
      answers: input.answers,
    });

    const data = response.data;
    return {
      attemptId: data?.attemptId ?? quizId,
      quizId: data?.quizId ?? quizId,
      correctCount:
        typeof data?.correctCount === 'number' ? data.correctCount : 0,
      totalQuestions:
        typeof data?.totalQuestions === 'number' ? data.totalQuestions : 0,
      percentage: typeof data?.percentage === 'number' ? data.percentage : 0,
      xpEarned: typeof data?.xpEarned === 'number' ? data.xpEarned : 0,
    };
  } catch (error) {
    throw wrapFirebaseError(
      error,
      'FIRESTORE_ERROR',
      'Failed to submit quiz attempt.',
    );
  }
}

export function subscribeQuizAttempts(
  listener: (attempts: QuizAttempt[]) => void,
  onError?: (error: unknown) => void,
): () => void {
  const uid = getCurrentUserId();
  if (!uid) {
    listener([]);
    return () => undefined;
  }

  const attemptsCollection = collection(db, 'users', uid, 'quizAttempts');
  const attemptsQuery = query(
    attemptsCollection,
    orderBy('submittedAt', 'desc'),
  );

  return onSnapshot(
    attemptsQuery,
    snapshot => {
      const items = snapshot.docs.map(docSnap =>
        mapAttempt(
          docSnap.id,
          docSnap.data() as UpdateData<DocumentData> as QuizAttemptDocument,
        ),
      );
      listener(items);
    },
    error => onError?.(error),
  );
}
