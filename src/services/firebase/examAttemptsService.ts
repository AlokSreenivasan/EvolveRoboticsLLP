import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

import { wrapFirebaseError } from '../../utils/firebase/errors';
import { getCurrentUserId } from './authService';
import { collection, db, doc, serverTimestamp, setDoc } from './firestoreClient';

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

